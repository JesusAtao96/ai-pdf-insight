import { Component, inject, computed, linkedSignal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DocumentService } from '../../../core/services/document.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, switchMap, of } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-document-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="max-w-6xl mx-auto p-6 md:p-12 animate-in fade-in duration-700">
      @if (document(); as doc) {
        @if (doc.status === 'processing' || doc.status === 'uploading') {
          <!-- Page Header Skeleton -->
          <div class="mb-12 space-y-4">
             <div class="h-4 w-32 skeleton rounded-full"></div>
             <div class="h-14 w-96 skeleton rounded-2xl"></div>
             <div class="h-4 w-48 skeleton rounded-full opacity-60"></div>
          </div>

          <!-- Bento Grid Skeleton -->
          <div class="grid grid-cols-12 gap-8">
            <!-- Summary Area Skeleton -->
            <div class="col-span-12 lg:col-span-7 space-y-6">
              <div class="h-[520px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] p-8 flex flex-col gap-6">
                <div class="flex justify-between items-center">
                  <div class="h-8 w-48 skeleton rounded-xl"></div>
                  <div class="h-6 w-24 skeleton rounded-lg opacity-40"></div>
                </div>
                <div class="space-y-4 mt-4">
                  <div class="h-6 w-full skeleton rounded-lg opacity-80"></div>
                  <div class="h-6 w-[95%] skeleton rounded-lg opacity-70"></div>
                  <div class="h-6 w-[98%] skeleton rounded-lg opacity-60"></div>
                  <div class="h-6 w-[92%] skeleton rounded-lg opacity-50"></div>
                  <div class="h-6 w-[40%] skeleton rounded-lg opacity-40"></div>
                </div>
              </div>
              
              <!-- Tags Skeleton -->
              <div class="flex flex-wrap gap-2">
                <div class="h-8 w-24 skeleton rounded-xl opacity-80"></div>
                <div class="h-8 w-32 skeleton rounded-xl opacity-70"></div>
                <div class="h-8 w-28 skeleton rounded-xl opacity-60"></div>
              </div>
            </div>

            <!-- Insights Rail Skeleton -->
            <div class="col-span-12 lg:col-span-5">
              <div class="bg-slate-50/50 dark:bg-slate-900/40 backdrop-blur-3xl p-8 rounded-[32px] border border-slate-100/50 dark:border-slate-800/40 h-full space-y-8">
                <div class="flex justify-between items-center mb-4">
                  <div class="h-8 w-40 skeleton rounded-xl"></div>
                  <div class="h-6 w-16 skeleton rounded-full opacity-40"></div>
                </div>
                
                <div class="space-y-6">
                  @for (item of [1, 2, 3]; track item) {
                    <div class="bg-white dark:bg-slate-950 p-6 rounded-[28px] border border-slate-100 dark:border-white/5 space-y-4">
                      <div class="flex gap-4">
                        <div class="w-12 h-12 skeleton rounded-2xl shrink-0 opacity-80"></div>
                        <div class="flex-1 space-y-2 mt-1">
                          <div class="h-3 w-20 skeleton rounded-full opacity-60"></div>
                          <div class="h-4 w-full skeleton rounded-lg"></div>
                          <div class="h-4 w-[80%] skeleton rounded-lg opacity-70"></div>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
        } @else if (doc.status === 'completed') {
          <!-- Page Header -->
          <div class="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div class="space-y-2">
              <div class="flex items-center gap-3 mb-1">
                <h2 class="text-xs font-black text-primary-fixed dark:text-primary-fixed-dim uppercase tracking-widest font-headline">Analysis Results</h2>
                <span class="px-2 py-0.5 bg-tertiary-container/20 text-on-tertiary-container dark:bg-tertiary-dim/20 dark:text-tertiary-fixed text-[10px] font-black rounded-full uppercase tracking-tighter italic">
                  AI Analyzed
                </span>
              </div>
              <h3 class="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight font-headline">
                {{ doc.name }}
              </h3>
              <p class="text-slate-500 dark:text-slate-400 font-body text-sm">
                Processed {{ doc.createdAt | date:'shortTime' }} • 
                {{ doc.pages || '24' }} pages analyzed
              </p>
            </div>
            
            <div class="flex items-center gap-3 w-full md:w-auto">
              @if (isDirty()) {
                <button (click)="onSave(doc.id!)"
                  class="flex-1 md:flex-none px-8 py-3.5 bg-primary-fixed text-white rounded-2xl font-black hover:scale-105 transition-all shadow-xl shadow-primary-fixed/30 flex items-center justify-center gap-2">
                  <span class="material-symbols-outlined text-sm">save_as</span>
                  Save Insights
                </button>
              }
              <button routerLink="/upload" 
                class="p-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center">
                <span class="material-symbols-outlined">upload_file</span>
              </button>
            </div>
          </div>

          <!-- Bento Grid Content Layout -->
          <div class="grid grid-cols-12 gap-8">
            <!-- Summary Section -->
            <div class="col-span-12 lg:col-span-7 space-y-6">
              <div class="bg-white dark:bg-slate-900 p-8 lg:p-10 rounded-[32px] border border-slate-100 dark:border-slate-800/60 shadow-sm relative overflow-hidden group min-h-[500px] flex flex-col">
                <div class="flex items-center justify-between mb-8">
                  <h4 class="font-headline font-black text-xl flex items-center gap-3 dark:text-white">
                    <span class="material-symbols-outlined text-primary-fixed-dim p-2 bg-primary-fixed/5 rounded-xl">auto_awesome</span>
                    Executive Summary
                  </h4>
                  <div class="flex items-center gap-2">
                    <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest hidden sm:inline">Editable Mode</span>
                    <span class="material-symbols-outlined text-slate-200 dark:text-slate-700">edit_square</span>
                  </div>
                </div>
                
                <textarea 
                  [(ngModel)]="editableSummary"
                  class="flex-1 w-full bg-transparent border-none focus:ring-0 text-slate-700 dark:text-slate-300 leading-relaxed text-xl lg:text-2xl font-body custom-scrollbar resize-none placeholder:italic placeholder:text-slate-300 dark:placeholder:text-slate-700"
                  placeholder="Summarizing the document core..."
                  spellcheck="false"></textarea>
                  
                <!-- Background Accent -->
                <div class="absolute -bottom-20 -right-20 w-64 h-64 bg-primary-fixed/5 rounded-full blur-[100px] pointer-events-none group-focus-within:bg-primary-fixed/10 transition-colors"></div>
              </div>

              <!-- Metadata Tags Layer -->
              <div class="flex flex-wrap gap-3">
                @for (tag of doc.tags; track $index) {
                  <span 
                    [class]="getTagClasses(tag.color)"
                    class="px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border transition-all hover:scale-105 cursor-default">
                    <span class="material-symbols-outlined text-[14px]">{{ tag.icon || 'tag' }}</span>
                    {{ tag.label }}
                  </span>
                } @empty {
                  <span class="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-2xl text-[11px] font-black uppercase tracking-wider flex items-center gap-2 border border-slate-200 dark:border-slate-700">
                    <span class="material-symbols-outlined text-sm">info</span>
                    General Analysis
                  </span>
                }
              </div>
            </div>

            <!-- Insights Rail -->
            <div class="col-span-12 lg:col-span-5 space-y-6">
              <div class="bg-slate-50/50 dark:bg-slate-900/40 backdrop-blur-3xl p-8 lg:p-10 rounded-[32px] border border-slate-100/50 dark:border-slate-800/40 h-full">
                <div class="flex items-center justify-between mb-10">
                  <h4 class="font-headline font-black text-xl dark:text-white uppercase tracking-tighter">Critical Insights</h4>
                  <span class="text-[10px] font-black text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-950 px-3 py-1.5 rounded-full border border-slate-100 dark:border-slate-800 shadow-sm">
                    {{ editableInsights().length }} Nodes
                  </span>
                </div>

                <div class="space-y-6">
                  @for (insight of editableInsights(); track $index) {
                    <div class="bg-white dark:bg-slate-950 p-6 rounded-[28px] shadow-sm hover:ambient-shadow transition-all group border-2 border-transparent focus-within:border-primary-fixed-dim/20 focus-within:ring-8 focus-within:ring-primary-fixed/5">
                      <div class="flex items-start gap-4">
                        <div [class]="'w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ' + getIconBgClass(insight.type)">
                          <span class="material-symbols-outlined">{{ insight.icon }}</span>
                        </div>
                        <div class="flex-1 space-y-2">
                          <div class="flex items-center justify-between">
                            <p [class]="'font-black text-[10px] uppercase tracking-[0.15em] ' + getTextColorClass(insight.type)">
                              {{ insight.title }}
                            </p>
                            <span class="material-symbols-outlined text-sm text-slate-200 dark:text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">edit_square</span>
                          </div>
                          <textarea 
                            [(ngModel)]="insight.content"
                            class="w-full bg-transparent border-none p-0 text-[13px] text-slate-600 dark:text-slate-400 font-medium focus:ring-0 resize-none overflow-hidden custom-scrollbar leading-relaxed"
                            rows="2"
                            spellcheck="false"></textarea>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
        } @else {
          <!-- Enhanced Error State -->
          <div class="max-w-xl mx-auto py-24 text-center animate-in zoom-in duration-500">
             <div class="w-24 h-24 bg-error-container/10 text-error rounded-[40px] flex items-center justify-center mx-auto mb-10 shadow-lg shadow-error-container/5">
               <span class="material-symbols-outlined text-4xl font-bold">report</span>
             </div>
             <h3 class="text-4xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight">Analysis Blocked</h3>
             
             @if (doc.errorDetail) {
               <div class="mt-8 p-8 bg-slate-950 rounded-[32px] font-mono text-[11px] text-left overflow-auto border border-white/5 shadow-2xl max-h-80 custom-scrollbar group relative">
                 <div class="flex items-center justify-between mb-4">
                   <div class="flex items-center gap-2 text-red-500 font-black uppercase tracking-widest text-[9px]">
                     <span class="material-symbols-outlined text-xs">terminal</span>
                     System Diagnosis
                   </div>
                   <span class="text-slate-600 text-[8px] font-bold uppercase tracking-tighter group-hover:text-slate-400 transition-colors">v2.5_lite_fail</span>
                 </div>
                 <pre class="text-red-400/90 whitespace-pre-wrap leading-relaxed">{{ doc.errorDetail }}</pre>
               </div>
             }
             
             <p class="text-slate-500 dark:text-slate-400 mt-10 text-lg leading-relaxed font-body">
               The AI Curator was unable to interpret this document's structure. 
               This can happen with high-security PDFs or when API quotas are exceeded.
             </p>

             <div class="mt-14 flex flex-col sm:flex-row gap-5 justify-center">
               <button routerLink="/upload" class="px-10 py-5 bg-slate-950 dark:bg-white dark:text-slate-950 text-white rounded-[24px] font-black hover:scale-105 transition-all flex items-center gap-3 justify-center shadow-2xl">
                 <span class="material-symbols-outlined">refresh</span>
                 Try Different File
               </button>
               <button (click)="onSimulate(doc.id!)" class="px-10 py-5 bg-primary-fixed text-white rounded-[24px] font-black hover:scale-105 transition-all flex items-center gap-3 justify-center shadow-xl shadow-primary-fixed/20">
                 <span class="material-symbols-outlined">data_object</span>
                 Run Diagnosis
               </button>
             </div>
          </div>
        }
      } @else {
        <div class="flex flex-col items-center justify-center py-48 gap-6">
           <div class="flex items-center gap-4 text-slate-400 dark:text-slate-600 font-black uppercase tracking-[0.2em] text-sm italic">
             <div class="w-8 h-[2px] bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div class="w-full h-full bg-primary-fixed animate-[progress_1s_infinite]"></div>
             </div>
             Locating Metadata
           </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    textarea { field-sizing: content; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly documentService = inject(DocumentService);

  readonly document = toSignal(
    this.route.paramMap.pipe(
      map(params => params.get('id')),
      switchMap(id => id ? this.documentService.getDocument$(id) : of(null))
    )
  );

  // Editable state using linkedSignal (Angular 19+)
  readonly editableSummary = linkedSignal(() => this.document()?.summary ?? '');
  readonly editableInsights = linkedSignal(() => [...(this.document()?.insights ?? [])]);

  readonly isDirty = computed(() => {
    const doc = this.document();
    if (!doc) return false;
    return this.editableSummary() !== doc.summary || 
           JSON.stringify(this.editableInsights()) !== JSON.stringify(doc.insights);
  });

  getIconBgClass(type: string): string {
    switch (type) {
      case 'revenue': return 'bg-primary-container/20 text-primary dark:bg-primary-fixed-dim/20 dark:text-primary-fixed';
      case 'risk': return 'bg-error-container/10 text-error dark:bg-error-dim/20 dark:text-error-container';
      case 'opportunity': return 'bg-tertiary-container/30 text-tertiary dark:bg-tertiary-fixed-dim/20 dark:text-tertiary-fixed';
      case 'recommendation': return 'bg-secondary-container/30 text-secondary-dim dark:bg-secondary-fixed-dim/20 dark:text-secondary-fixed';
      default: return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
    }
  }

  getTextColorClass(type: string): string {
    switch (type) {
      case 'revenue': return 'text-primary dark:text-primary-fixed';
      case 'risk': return 'text-error dark:text-error-container';
      case 'opportunity': return 'text-tertiary dark:text-tertiary-fixed';
      case 'recommendation': return 'text-secondary-dim dark:text-secondary-fixed';
      default: return 'text-slate-900 dark:text-white';
    }
  }

  getTagClasses(color?: string): string {
    switch (color) {
      case 'primary': return 'bg-primary-container/10 dark:bg-primary-fixed-dim/10 text-primary dark:text-primary-fixed border-primary-container/20 dark:border-primary-fixed-dim/20';
      case 'secondary': return 'bg-secondary-container/10 dark:bg-secondary-dim/10 text-on-secondary-container dark:text-secondary-fixed border-secondary-container/20 dark:border-secondary-dim/20';
      case 'tertiary': return 'bg-tertiary-container/10 dark:bg-tertiary-dim/10 text-on-tertiary-container dark:text-tertiary-fixed border-tertiary-container/20 dark:border-tertiary-dim/20';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  }

  async onSave(id: string) {
    try {
      await this.documentService.updateAnalysis(id, {
        summary: this.editableSummary(),
        insights: this.editableInsights()
      });
    } catch (e) {
      console.error('Save failed', e);
    }
  }

  onSimulate(docId: string) {
    this.documentService.simulateAnalysis(docId).catch(err => console.error('Simulation failed', err));
  }
}


