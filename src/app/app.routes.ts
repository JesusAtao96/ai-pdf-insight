import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { 
    path: 'login', 
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) 
  },
  {
    path: '',
    loadComponent: () => import('./shared/components/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      { 
        path: 'upload', 
        loadComponent: () => import('./features/documents/upload/upload.component').then(m => m.UploadComponent) 
      },
      { 
        path: 'history', 
        loadComponent: () => import('./features/documents/history/history.component').then(m => m.HistoryComponent) 
      },
      {
        path: 'documents/:id',
        loadComponent: () => import('./features/documents/document-detail/document-detail.component').then(m => m.DocumentDetailComponent)
      },
      { path: '', redirectTo: 'upload', pathMatch: 'full' }

    ]
  },
  { path: '**', redirectTo: 'upload' }
];
