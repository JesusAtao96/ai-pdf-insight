import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { Auth, GoogleAuthProvider, signInWithPopup, signOut } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';

// Mock Firebase Auth
const mockAuth = {
  currentUser: null,
};

const mockRouter = {
  navigate: vi.fn(),
};

vi.mock('@angular/fire/auth', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    authState: vi.fn(() => of(null)),
    signInWithPopup: vi.fn(),
    signOut: vi.fn(),
    GoogleAuthProvider: vi.fn(),
  };
});

describe('AuthService - Zoneless Business Logic (Gherkin Style)', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        AuthService,
        { provide: Auth, useValue: mockAuth },
        { provide: Router, useValue: mockRouter },
      ],
    });
    service = TestBed.inject(AuthService);
  });

  describe('Feature: User Authentication with Google', () => {
    
    it('Scenario: Successful Google Login', async () => {
      // Given: The user is not authenticated
      vi.mocked(signInWithPopup).mockResolvedValue({ user: { uid: '123' } } as any);

      // When: The user attempts to login with Google
      await service.loginWithGoogle();

      // Then: The user should be redirected to the home page
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    });

    it('Scenario: User Sign Out', async () => {
      // Given: The user is currently authenticated
      vi.mocked(signOut).mockResolvedValue();

      // When: The user attempts to sign out
      await service.logout();

      // Then: The session should be terminated in Firebase
      expect(signOut).toHaveBeenCalled();
      // And: The user should be redirected to the login page
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('Scenario: Google Login Failure', async () => {
      // Given: An error occurs during the Google Auth flow
      vi.mocked(signInWithPopup).mockRejectedValue(new Error('Auth failed'));

      // When: The user attempts to login
      // Then: The service should propagate the error
      await expect(service.loginWithGoogle()).rejects.toThrow('Auth failed');
    });

  });
});
