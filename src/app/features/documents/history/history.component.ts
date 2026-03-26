import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DocumentService } from '../../../core/services/document.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto py-8">
      <!-- Page Header -->
      <div class="mb-12">
        <h3 class="text-4xl font-extrabold font-headline tracking-tight text-slate-900 dark:text-slate-50 mb-4 transition-colors">Past Document Insights</h3>
        <p class="text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
          Review your previous AI-assisted analyses. Access summary reports, extracted data, and structural insights from your uploaded PDF files.
        </p>
      </div>

      <!-- History List -->
      <div class="space-y-4">
        <!-- Table Header (Hidden on Mobile) -->
        <div class="hidden md:grid grid-cols-12 px-8 py-2 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          <div class="col-span-4">Document Name</div>
          <div class="col-span-2">Date Processed</div>
          <div class="col-span-4">Summary Preview</div>
          <div class="col-span-2 text-right">Status & Actions</div>
        </div>

        @if (history(); as docs) {
          @for (doc of docs; track doc.id) {
            <div class="grid grid-cols-1 md:grid-cols-12 items-center px-6 md:px-8 py-6 bg-white dark:bg-slate-900 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300 group shadow-sm hover:shadow-md border border-slate-100 dark:border-slate-800">
              <!-- Doc Info -->
              <div class="col-span-1 md:col-span-4 flex items-center gap-4 mb-4 md:mb-0">
                <div class="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <span class="material-symbols-outlined">{{ doc.type === 'pdf' ? 'description' : 'article' }}</span>
                </div>
                <div class="overflow-hidden">
                  <p class="font-bold text-slate-800 dark:text-slate-100 font-headline truncate">{{ doc.name }}</p>
                  <p class="text-xs text-slate-400 dark:text-slate-500">{{ (doc.size || 0) / 1024 | number:'1.1-1' }} KB • {{ doc.type | uppercase }}</p>
                </div>
              </div>

              <!-- Date -->
              <div class="col-span-1 md:col-span-2 text-sm text-slate-500 dark:text-slate-400 font-medium mb-2 md:mb-0">
                {{ doc.createdAt | date:'MMM d, y' }}
              </div>

              <!-- Preview -->
              <div class="col-span-1 md:col-span-4 mb-4 md:mb-0">
                @if (doc.summary) {
                  <p class="text-sm text-slate-500 dark:text-slate-400 line-clamp-1 italic pr-4">
                    "{{ doc.summary }}"
                  </p>
                } @else {
                  <div class="flex items-center gap-2 text-blue-600 dark:text-blue-400 animate-pulse">
                    <span class="material-symbols-outlined text-sm">autorenew</span>
                    <span class="text-xs font-bold">Processing Analysis...</span>
                  </div>
                }
              </div>

              <!-- Status & Actions -->
              <div class="col-span-1 md:col-span-2 flex items-center justify-between md:justify-end gap-3">
                <span [class]="doc.status === 'completed' 
                  ? 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold'
                  : 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-xs font-bold'">
                  <span class="w-1.5 h-1.5 rounded-full" [class]="doc.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'"></span>
                  {{ doc.status | titlecase }}
                </span>
                
                <button [routerLink]="['/documents', doc.id]" 
                  class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-slate-700 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                  <span class="material-symbols-outlined">visibility</span>
                </button>
              </div>
            </div>
          } @empty {
            <!-- Empty State -->
            <div class="py-24 text-center">
              <div class="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <span class="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600">history</span>
              </div>
              <h4 class="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">No History Yet</h4>
              <p class="text-slate-500 dark:text-slate-400 mb-8 max-w-xs mx-auto">Upload your first document to see your AI insights history here.</p>
              <button routerLink="/upload" 
                class="px-8 py-4 bg-primary-fixed text-white rounded-2xl font-black hover:scale-105 transition-all shadow-xl shadow-primary-fixed/20">
                Process New Document
              </button>
            </div>
          }
        } @else {
          <!-- Loading Skeletons -->
          @for (item of [1, 2, 3, 4, 5]; track item) {
            <div class="grid grid-cols-1 md:grid-cols-12 items-center px-6 md:px-8 py-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div class="col-span-1 md:col-span-4 flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl skeleton opacity-60"></div>
                <div class="space-y-2 flex-1">
                  <div class="h-4 w-40 skeleton rounded-lg"></div>
                  <div class="h-3 w-20 skeleton rounded-lg opacity-40"></div>
                </div>
              </div>
              <div class="col-span-1 md:col-span-2 hidden md:block">
                <div class="h-4 w-24 skeleton rounded-lg opacity-30"></div>
              </div>
              <div class="col-span-1 md:col-span-4 hidden md:block">
                <div class="h-4 w-full max-w-[200px] skeleton rounded-lg opacity-20"></div>
              </div>
              <div class="col-span-1 md:col-span-2 flex justify-end">
                <div class="h-8 w-24 skeleton rounded-full opacity-40"></div>
              </div>
            </div>
          }
        }
      </div>
    </div>
  `
})
export class HistoryComponent {
  private readonly documentService = inject(DocumentService);
  readonly history = toSignal(this.documentService.getHistory(), { initialValue: undefined });
}
