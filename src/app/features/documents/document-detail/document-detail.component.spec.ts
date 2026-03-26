import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DocumentDetailComponent } from './document-detail.component';
import { DocumentService } from '../../../core/services/document.service';
import { of } from 'rxjs';
import { provideRouter, ActivatedRoute } from '@angular/router';

describe('DocumentDetailComponent Tags', () => {
  let component: DocumentDetailComponent;
  let fixture: ComponentFixture<DocumentDetailComponent>;
  let mockDocumentService: any;

  beforeEach(async () => {
    mockDocumentService = {
      getDocument$: vi.fn().mockReturnValue(of({
        id: '123',
        name: 'test.pdf',
        status: 'completed',
        summary: 'Test summary',
        insights: [],
        tags: [
          { label: 'AI', icon: 'smart_toy', color: 'primary' },
          { label: 'Cloud', icon: 'cloud', color: 'secondary' }
        ]
      })),
      updateAnalysis: vi.fn().mockResolvedValue(undefined)
    };

    await TestBed.configureTestingModule({
      imports: [DocumentDetailComponent],
      providers: [
        { provide: DocumentService, useValue: mockDocumentService },
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({ get: () => '123' })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render dynamic tags', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const tagsContainer = compiled.querySelector('.flex.flex-wrap.gap-3');
    const tags = Array.from(tagsContainer?.querySelectorAll('span') || []);
    
    expect(tags.length).toBeGreaterThanOrEqual(2);
    const tagTexts = tags.map(t => t.textContent?.trim());
    
    expect(tagTexts.some(text => text?.includes('AI'))).toBe(true);
    expect(tagTexts.some(text => text?.includes('Cloud'))).toBe(true);
    // Check for icons (they are now smaller Material Symbols)
    expect(tagTexts.some(text => text?.includes('smart_toy') || text?.includes('tag'))).toBe(true);
  });

  it('should apply correct color classes', () => {
    expect(component.getTagClasses('primary')).toContain('text-primary');
    expect(component.getTagClasses('secondary')).toContain('text-on-secondary-container');
  });
});
