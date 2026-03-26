import { TestBed } from '@angular/core/testing';
import { DocumentService } from './document.service';
import { Firestore } from '@angular/fire/firestore';
import { Storage } from '@angular/fire/storage';
import { AuthService } from './auth.service';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Hoisted mocks
vi.mock('@angular/fire/firestore', () => ({
  getFirestore: vi.fn(),
  collection: vi.fn(() => ({})),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  collectionData: vi.fn(() => of([])), // Return valid observable
  Firestore: class {},
  addDoc: vi.fn()
}));

vi.mock('@angular/fire/storage', () => ({
  getStorage: vi.fn(),
  ref: vi.fn(),
  uploadBytesResumable: vi.fn(),
  getDownloadURL: vi.fn(),
  Storage: class {}
}));

describe('DocumentService', () => {
  let service: DocumentService;
  let authServiceMock: any;
  let firestoreMock: any;
  let storageMock: any;

  beforeEach(() => {
    authServiceMock = {
      user: signal({ uid: 'test-user-123' })
    };

    firestoreMock = { type: 'Firestore' };
    storageMock = { type: 'Storage' };

    TestBed.configureTestingModule({
      providers: [
        DocumentService,
        { provide: AuthService, useValue: authServiceMock },
        { provide: Firestore, useValue: firestoreMock },
        { provide: Storage, useValue: storageMock }
      ]
    });

    service = TestBed.inject(DocumentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('US-002: PDF Upload', () => {
    it('Given a non-PDF file, When uploading, Then it should throw an error', async () => {
      const file = new File([''], 'test.txt', { type: 'text/plain' });
      await expect(service.uploadDocument(file)).rejects.toThrow('Only PDF files are allowed');
    });

    it('Given a file larger than 20MB, When uploading, Then it should throw an error', async () => {
      // Create a blob-based file to avoid memory issues in tests
      const largeFile = new File([new ArrayBuffer(21 * 1024 * 1024)], 'large.pdf', { type: 'application/pdf' });
      await expect(service.uploadDocument(largeFile)).rejects.toThrow('File size exceeds 20MB limit');
    });

    it('Given an unauthenticated user, When uploading, Then it should throw an error', async () => {
      authServiceMock.user.set(null);
      const file = new File([''], 'test.pdf', { type: 'application/pdf' });
      await expect(service.uploadDocument(file)).rejects.toThrow('User not authenticated');
    });
  });
});
