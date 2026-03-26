import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HistoryComponent } from './history.component';
import { DocumentService } from '../../../core/services/document.service';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';

describe('HistoryComponent', () => {
  let component: HistoryComponent;
  let fixture: ComponentFixture<HistoryComponent>;
  let mockDocumentService: any;

  beforeEach(async () => {
    mockDocumentService = {
      getHistory: vi.fn().mockReturnValue(of([
        { id: '1', name: 'test.pdf', status: 'completed', createdAt: Date.now(), type: 'pdf', summary: 'Test summary' }
      ]))
    };

    await TestBed.configureTestingModule({
      imports: [HistoryComponent],
      providers: [
        { provide: DocumentService, useValue: mockDocumentService },
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render document list', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(mockDocumentService.getHistory).toHaveBeenCalled();
    const headlines = compiled.querySelectorAll('.font-headline');
    // headlines[0] is the page title, headlines[1] should be the document name
    expect(headlines[1]?.textContent).toContain('test.pdf');
    expect(compiled.querySelector('.italic')?.textContent).toContain('Test summary');
  });

  it('should show completed status', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const status = compiled.querySelector('.bg-emerald-50');
    expect(status).toBeTruthy();
    expect(status?.textContent).toContain('Completed');
  });
});
