import { TestBed } from '@angular/core/testing';
import { DocumentService } from './document.service';
import { Firestore, collection, addDoc, doc, getDoc, updateDoc, docData } from '@angular/fire/firestore';
import { Storage, ref, uploadBytesResumable, getDownloadURL } from '@angular/fire/storage';
import { AuthService } from './auth.service';
import { VertexAI, getGenerativeModel } from '@angular/fire/vertexai';
import { signal } from '@angular/core';
import { of, EMPTY } from 'rxjs';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mocks for Firebase
vi.mock('@angular/fire/firestore', () => ({
  getFirestore: vi.fn(),
  collection: vi.fn(() => ({})),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  collectionData: vi.fn(() => of([])),
  Firestore: class { },
  addDoc: vi.fn(),
  doc: vi.fn(() => ({ id: 'mock-doc-id' })),
  getDoc: vi.fn(),
  updateDoc: vi.fn(),
  docData: vi.fn(() => of({}))
}));

vi.mock('@angular/fire/storage', () => ({
  getStorage: vi.fn(),
  ref: vi.fn(),
  uploadBytesResumable: vi.fn(),
  getDownloadURL: vi.fn(),
  Storage: class { }
}));

vi.mock('@angular/fire/vertexai', () => ({
  getGenerativeModel: vi.fn(),
  VertexAI: class { }
}));

describe('DocumentService', () => {
  let service: DocumentService;
  let authServiceMock: any;
  let firestoreMock: any;
  let storageMock: any;

  beforeEach(() => {
    authServiceMock = {
      user: signal({ uid: 'test-user-123' }),
      user$ : of({ uid: 'test-user-123' })
    };

    firestoreMock = { type: 'Firestore' };
    storageMock = { type: 'Storage' };

    TestBed.configureTestingModule({
      providers: [
        DocumentService,
        { provide: AuthService, useValue: authServiceMock },
        { provide: Firestore, useValue: firestoreMock },
        { provide: Storage, useValue: storageMock },
        { provide: VertexAI, useValue: { type: 'VertexAI' } }
      ]
    });

    service = TestBed.inject(DocumentService);
    vi.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('US-001: History Data', () => {
    it('should return history when user is authenticated', async () => {
      await TestBed.runInInjectionContext(async () => {
        service.getHistory().subscribe();
        // Small delay to allow signal -> observable propagation
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      expect(collection).toHaveBeenCalled();
    });

    it('should return empty list when user is NOT authenticated', async () => {
      authServiceMock.user.set(null);
      await TestBed.runInInjectionContext(async () => {
        return new Promise<void>((resolve) => {
          service.getHistory().subscribe(history => {
            expect(history).toEqual([]);
            resolve();
          });
        });
      });
    });
  });

  describe('US-002: PDF Upload & Validation', () => {
    it('should throw error for non-PDF file', async () => {
      const file = new File([''], 'test.txt', { type: 'text/plain' });
      await expect(service.uploadDocument(file)).rejects.toThrow('Only PDF files are allowed');
    });

    it('should throw error for file > 20MB', async () => {
      const largeFile = new File([new ArrayBuffer(21 * 1024 * 1024)], 'large.pdf', { type: 'application/pdf' });
      await expect(service.uploadDocument(largeFile)).rejects.toThrow('File size exceeds 20MB limit');
    });

    it('should throw error if user not authenticated', async () => {
      authServiceMock.user.set(null);
      const file = new File([''], 'test.pdf', { type: 'application/pdf' });
      await expect(service.uploadDocument(file)).rejects.toThrow('User not authenticated');
    });

    it('should successfully upload a PDF and initiate AI processing', async () => {
      const file = new File(['%PDF-1.4'], 'test.pdf', { type: 'application/pdf' });
      const mockUploadTask = {
        on: vi.fn((event, next) => next({ bytesTransferred: 100, totalBytes: 100 })),
        then: vi.fn((resolve) => resolve({}))
      };
      
      vi.mocked(uploadBytesResumable).mockReturnValue(mockUploadTask as any);
      vi.mocked(getDownloadURL).mockResolvedValue('http://download.url');
      vi.mocked(addDoc).mockResolvedValue({ id: 'doc-id-123' } as any);

      // Spy on processDocumentWithAI to avoid testing its internal logic here
      const processSpy = vi.spyOn(service, 'processDocumentWithAI').mockResolvedValue();

      const docId = await service.uploadDocument(file);

      expect(docId).toBe('doc-id-123');
      expect(uploadBytesResumable).toHaveBeenCalled();
      expect(addDoc).toHaveBeenCalled();
      expect(processSpy).toHaveBeenCalledWith('doc-id-123', expect.any(String));
      expect(service.uploadProgress()).toBe(100);
    });

    it('should handle upload task error', async () => {
      const file = new File(['%PDF-1.4'], 'test.pdf', { type: 'application/pdf' });
      const mockUploadTask = {
        on: vi.fn((event, next, error) => error(new Error('Upload failed'))),
        then: vi.fn((resolve, reject) => reject(new Error('Upload failed')))
      };
      
      vi.mocked(uploadBytesResumable).mockReturnValue(mockUploadTask as any);

      await expect(service.uploadDocument(file)).rejects.toThrow('Upload failed');
      expect(service.isUploading()).toBe(false);
    });
  });

  describe('US-003: AI Processing', () => {
    it('should handle AI processing success', async () => {
      const docId = 'test-doc-id';
      const base64 = 'YmFzZTY0';
      const mockResult = {
        response: Promise.resolve({
          text: () => JSON.stringify({
            summary: 'Summary',
            insights: [],
            tags: []
          })
        })
      };
      
      vi.mocked(getGenerativeModel).mockReturnValue({
        generateContent: vi.fn().mockResolvedValue(mockResult)
      } as any);

      await service.processDocumentWithAI(docId, base64);

      expect(updateDoc).toHaveBeenLastCalledWith(expect.anything(), expect.objectContaining({
        status: 'completed',
        summary: 'Summary',
        tags: [] // Hits the `|| []` branch
      }));
    });

    it('should handle AI processing error', async () => {
      const docId = 'test-doc-id';
      const base64 = 'YmFzZTY0';
      
      vi.mocked(getGenerativeModel).mockReturnValue({
        generateContent: vi.fn().mockRejectedValue(new Error('AI error'))
      } as any);

      await service.processDocumentWithAI(docId, base64);

      expect(updateDoc).toHaveBeenLastCalledWith(expect.anything(), expect.objectContaining({
        status: 'error',
        errorDetail: 'AI Analysis Failed: AI error'
      }));
    });

    it('should handle AI processing error without message', async () => {
      const docId = 'test-doc-id';
      
      vi.mocked(getGenerativeModel).mockReturnValue({
        generateContent: vi.fn().mockRejectedValue('String error') // No .message
      } as any);

      await service.processDocumentWithAI(docId, 'base64');

      expect(updateDoc).toHaveBeenLastCalledWith(expect.anything(), expect.objectContaining({
        status: 'error',
        errorDetail: 'AI Analysis Failed: String error' // Hits the `|| apiError.toString()` branch
      }));
    });

    it('should handle outer AI processing error', async () => {
      const docId = 'test-doc-id';
      // Force first updateDoc call to throw to trigger outer catch
      vi.mocked(updateDoc).mockRejectedValueOnce(new Error('Fatal error'));

      await service.processDocumentWithAI(docId, 'base64');
      
      // expect updateDoc to be called twice: 
      // 1. the one that failed (line 136)
      // 2. the one in the catch block (line 194)
      expect(updateDoc).toHaveBeenCalledTimes(2);
      expect(updateDoc).toHaveBeenLastCalledWith(expect.anything(), expect.objectContaining({
        status: 'error',
        errorDetail: 'Fatal error'
      }));
    });
  });

  describe('Helper Methods', () => {
    it('getDocument should return document data', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: '123',
        data: () => ({ name: 'Test' })
      } as any);
      
      const doc = await service.getDocument('123');
      expect(doc?.name).toBe('Test');
    });

    it('getDocument should return null if document does not exist', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false
      } as any);
      
      const doc = await service.getDocument('non-existent');
      expect(doc).toBeNull();
    });

    it('getDocument$ should return observable', () => {
      service.getDocument$('123');
      expect(docData).toHaveBeenCalled();
    });

    it('updateAnalysis should call updateDoc', async () => {
      await service.updateAnalysis('123', { status: 'completed' });
      expect(updateDoc).toHaveBeenCalled();
    });

    it('simulateAnalysis should update doc with mock data', async () => {
      await service.simulateAnalysis('123');
      expect(updateDoc).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
        status: 'completed',
        errorDetail: 'Success (Simulated)'
      }));
    });
  });
});
