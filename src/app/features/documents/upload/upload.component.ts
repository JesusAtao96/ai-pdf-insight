import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DocumentService } from '../../../core/services/document.service';

@Component({
  selector: 'app-upload',
  imports: [CommonModule],
  template: `
    <div class="max-w-4xl mx-auto">
      @if (!isUploading()) {
        <!-- Content visible only when NOT uploading -->
        <div class="animate-in fade-in slide-in-from-top-4 duration-700">
          <div class="mb-12">
            <h2 class="text-4xl font-headline font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mb-4">Analyze with Precision.</h2>
            <p class="text-lg text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              Drop your PDF documents here. Our AI models will extract semantic meaning, summarize key findings, and identify potential risks in seconds.
            </p>
          </div>

          <div class="space-y-12">
            <!-- Upload Area -->
            <div 
              class="group relative bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-primary-fixed transition-all duration-300 p-12 flex flex-col items-center justify-center min-h-[400px] shadow-sm overflow-hidden"
              (dragover)="onDragOver($event)"
              (dragleave)="onDragLeave($event)"
              (drop)="onDrop($event)"
              [class.border-primary-fixed]="isDragging()"
              [class.bg-primary-fixed/5]="isDragging()"
            >
              <div class="absolute inset-0 bg-primary-fixed/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div class="mb-8 w-20 h-20 bg-primary-fixed/10 dark:bg-primary-fixed/20 rounded-full flex items-center justify-center">
                <span class="material-symbols-outlined text-4xl text-primary-fixed">upload_file</span>
              </div>
              
              <h3 class="font-headline font-black text-2xl mb-3 text-slate-900 dark:text-slate-100">Drag and drop your file</h3>
              <p class="font-body text-sm font-medium text-slate-400 dark:text-slate-500 mb-10 uppercase tracking-widest">Supports PDF (Max 20MB)</p>
              
              <button 
                type="button"
                (click)="fileInput.click()"
                class="relative z-10 cursor-pointer bg-slate-950 dark:bg-white dark:text-slate-950 text-white font-black px-10 py-4 rounded-2xl shadow-2xl hover:scale-105 transition-all active:scale-95 flex items-center gap-2">
                <span class="material-symbols-outlined text-sm">folder_open</span>
                Browse Local Files
              </button>
              <input #fileInput type="file" class="hidden" accept="application/pdf" (change)="onFileSelected($event)">
            </div>
          </div>
        </div>
      } @else {
        <!-- Processing/Uploading State -->
        <div class="py-24 animate-in fade-in zoom-in-95 duration-700">
          <div class="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-[40px] p-10 md:p-14 border border-slate-100 dark:border-slate-800/60 shadow-2xl relative overflow-hidden">
            <div class="absolute -top-24 -right-24 w-64 h-64 bg-primary-fixed/10 rounded-full blur-3xl"></div>
            
            <div class="relative z-10 flex flex-col items-center text-center">
              <div class="w-20 h-20 rounded-3xl bg-primary-fixed/5 flex items-center justify-center mb-8 relative">
                <span class="material-symbols-outlined text-4xl text-primary-fixed animate-bounce">description</span>
                <div class="absolute inset-0 rounded-3xl border-2 border-primary-fixed/20 animate-ping"></div>
              </div>

              <div class="space-y-4 mb-12">
                <h3 class="text-3xl font-headline font-black text-slate-900 dark:text-white uppercase tracking-tighter">Uploading Insights...</h3>
                <p class="text-slate-500 dark:text-slate-400 font-medium">Preparing your document for AI Analysis</p>
              </div>
              
              <div class="w-full space-y-6">
                <div class="flex justify-between items-end">
                  <span class="text-[10px] font-black text-primary-fixed uppercase tracking-[0.2em] italic">Current Phase: Cloud Sync</span>
                  <span class="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{{ uploadProgress() }}%</span>
                </div>

                <!-- Premium Progress Bar -->
                <div class="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner p-1">
                  <div class="h-full bg-primary-fixed rounded-full transition-all duration-500 relative" [style.width.%]="uploadProgress()">
                    <div class="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                  </div>
                </div>

                <div class="p-6 bg-slate-50 dark:bg-slate-950 rounded-[28px] border border-slate-100 dark:border-slate-800 flex items-start gap-4 text-left">
                  <div class="p-2.5 bg-purple-100/50 dark:bg-purple-900/30 rounded-xl">
                    <span class="material-symbols-outlined text-purple-600 dark:text-purple-400 text-lg">auto_awesome</span>
                  </div>
                  <div>
                    <h4 class="text-[10px] font-black text-purple-800 dark:text-purple-300 uppercase tracking-widest mb-1">AI Intelligence Layer</h4>
                    <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                      Semantic extraction will execute immediately after sync. Please remain on this screen for optimal results.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class UploadComponent {
  private readonly documentService = inject(DocumentService);
  private readonly router = inject(Router);

  readonly isUploading = this.documentService.isUploading;
  readonly uploadProgress = this.documentService.uploadProgress;
  readonly isDragging = signal(false);

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(false);
    const file = event.dataTransfer?.files[0];
    if (file) this.upload(file);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.upload(file);
  }

  private async upload(file: File) {
    try {
      const docId = await this.documentService.uploadDocument(file);
      this.router.navigate(['/documents', docId]);
    } catch (error: any) {
      alert(error.message);
    }
  }
}
