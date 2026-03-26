import { inject, Injectable, signal } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, query, where, orderBy, doc, getDoc, updateDoc, docData } from '@angular/fire/firestore';
import { Storage, ref, uploadBytesResumable, getDownloadURL } from '@angular/fire/storage';
import { VertexAI, getGenerativeModel } from '@angular/fire/vertexai';
import { AuthService } from './auth.service';
import { AppDocument } from '../models/document.interface';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, Observable, EMPTY, from, of } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private readonly firestore = inject(Firestore);
  private readonly storage = inject(Storage);
  private readonly authService = inject(AuthService);
  private readonly vertexAI = inject(VertexAI);

  // Signal for tracking currently uploading file progress
  readonly uploadProgress = signal<number>(0);
  readonly isUploading = signal<boolean>(false);

  // Real-time documents list for the current user
  readonly documents = toSignal(
    this.getHistory(),
    { initialValue: [] as AppDocument[] }
  );

  public getHistory(): Observable<AppDocument[]> {
    const user = this.authService.user();
    if (!user) return EMPTY;

    const docsRef = collection(this.firestore, 'documents');
    const q = query(
      docsRef,
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    return collectionData(q, { idField: 'id' }) as Observable<AppDocument[]>;
  }

  async getDocument(id: string): Promise<AppDocument | null> {
    const docRef = doc(this.firestore, 'documents', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as AppDocument;
    }
    return null;
  }

  getDocument$(id: string): Observable<AppDocument | null> {
    const docRef = doc(this.firestore, 'documents', id);
    return docData(docRef, { idField: 'id' }) as Observable<AppDocument>;
  }

  async uploadDocument(file: File): Promise<string> {
    const user = this.authService.user();
    if (!user) throw new Error('User not authenticated');

    if (file.type !== 'application/pdf') {
      throw new Error('Only PDF files are allowed');
    }

    if (file.size > 20 * 1024 * 1024) { // 20MB limit
      throw new Error('File size exceeds 20MB limit');
    }

    this.isUploading.set(true);
    this.uploadProgress.set(0);

    try {
      const filePath = `users/${user.uid}/documents/${Date.now()}_${file.name}`;
      const storageRef = ref(this.storage, filePath);
      const uploadTask = uploadBytesResumable(storageRef, file);

      // Listen to progress
      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          this.uploadProgress.set(Math.round(progress));
        },
        (error) => {
          console.error('Upload failed');
          this.isUploading.set(false);
          throw error;
        }
      );

      await uploadTask;
      const downloadURL = await getDownloadURL(storageRef);

      // Create metadata in Firestore
      const docMetadata: AppDocument = {
        name: file.name,
        size: file.size,
        type: file.type,
        url: downloadURL,
        status: 'uploading',
        userId: user.uid,
        createdAt: Date.now()
      };

      const docRef = await addDoc(collection(this.firestore, 'documents'), docMetadata);

      // Convert file to base64 for AI processing
      const base64Data = await this.fileToBase64(file);

      // Start AI Processing
      this.processDocumentWithAI(docRef.id, base64Data);

      return docRef.id;
    } finally {
      this.isUploading.set(false);
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async processDocumentWithAI(docId: string, base64Data: string): Promise<void> {
    const docRef = doc(this.firestore, 'documents', docId);

    try {
      await updateDoc(docRef, { status: 'processing' });

      const model = getGenerativeModel(this.vertexAI, {
        model: 'gemini-2.5-flash-lite',
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
          topP: 0.95
        }
      });

      const prompt = `
        You are a Document Curator. Analyze the provided PDF.
        Extract a comprehensive summary, 4 key insights, and 5-7 specific keywords from the document content.
        Return ONLY valid JSON.
        {
          "summary": "...",
          "insights": [
             { "type": "revenue", "icon": "payments", "title": "...", "content": "..." },
             { "type": "risk", "icon": "warning", "title": "...", "content": "..." },
             { "type": "opportunity", "icon": "insights", "title": "...", "content": "..." },
             { "type": "recommendation", "icon": "psychology", "title": "...", "content": "..." }
          ],
          "tags": [
             { "label": "Keyword", "icon": "tag", "color": "slate" }
          ]
        }
        Keywords should be single words or short phrases. Use icon 'tag' by default unless a better one fits. Color should be 'slate' by default.
      `;

      try {
        const result = await model.generateContent([
          { text: prompt },
          { inlineData: { data: base64Data, mimeType: 'application/pdf' } }
        ]);

        const response = await result.response;
        let text = response.text();
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const extractedData = JSON.parse(text);

        await updateDoc(docRef, {
          summary: extractedData.summary,
          insights: extractedData.insights,
          tags: extractedData.tags || [],
          status: 'completed'
        });
      } catch (apiError: any) {
        console.error('Vertex AI SDK Error:', apiError);
        const detailedError = apiError.message || apiError.toString() || 'Unknown AI Error';
        await updateDoc(docRef, {
          status: 'error',
          errorDetail: `AI Analysis Failed: ${detailedError}`
        });
      }
    } catch (outerError: any) {
      console.error('AI Processing Context Error:', outerError);
      await updateDoc(docRef, {
        status: 'error',
        errorDetail: outerError.message || 'Fatal initialization error'
      });
    }
  }


  async updateAnalysis(id: string, updates: Partial<AppDocument>): Promise<void> {
    const docRef = doc(this.firestore, 'documents', id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Date.now()
    });
  }

  async simulateAnalysis(docId: string): Promise<void> {
    const docRef = doc(this.firestore, 'documents', docId);

    // Create high-quality mock data matching the screenshot/spec requirements
    const mockSummary = "This analysis indicates a robust 15% increase in year-over-year revenue, primarily driven by the expansion of the SaaS vertical and optimized cloud infrastructure costs. Key performance indicators show a significant improvement in customer acquisition cost (CAC) efficiency, dropping by 8.4%. However, operational expenditures saw a slight uptick due to strategic hiring in the AI research division.";

    const mockInsights = [
      { type: 'revenue', icon: 'payments', title: 'Revenue Growth', content: 'Subscription revenue outperformed projections by expanded SaaS vertical presence.' },
      { type: 'risk', icon: 'warning', title: 'Operational Risk', content: 'R&D spending in Europe exceeded budget by 12% due to strategic hiring.' },
      { type: 'opportunity', icon: 'insights', title: 'Market Opportunity', content: 'Expansion into Southeast Asia is identified as a high-potential growth vector.' },
      { type: 'recommendation', icon: 'psychology', title: 'AI Recommendation', content: 'Consolidate cloud vendors to reduce infrastructure overhead by 15% annually.' }
    ];

    const mockTags = [
      { label: 'SaaS Expansion', icon: 'tag', color: 'slate' },
      { label: 'CAC Efficiency', icon: 'tag', color: 'slate' },
      { label: 'Infrastructure', icon: 'tag', color: 'slate' },
      { label: 'AI Strategy', icon: 'tag', color: 'slate' },
      { label: 'Fiscal YoY', icon: 'tag', color: 'slate' }
    ];

    await updateDoc(docRef, {
      summary: mockSummary,
      insights: mockInsights,
      tags: mockTags,
      status: 'completed',
      errorDetail: 'Success (Simulated)'
    });
  }
}
