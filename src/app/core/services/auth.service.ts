import { inject, Injectable, signal } from '@angular/core';
import { Auth, authState, GoogleAuthProvider, signInWithPopup, signOut, User } from '@angular/fire/auth';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { map } from 'rxjs';
import { AppUser } from '../models/user.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  // Bridging Observable to Signal for Zoneless change detection
  readonly user = toSignal(
    authState(this.auth).pipe(
      map(user => this.mapToAppUser(user))
    )
  );

  async loginWithGoogle(): Promise<void> {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      
      // Optional: Domain restriction check
      // if (!result.user.email?.endsWith('@gmail.com')) {
      //   await signOut(this.auth);
      //   throw new Error('Unauthorized domain');
      // }

      await this.router.navigate(['/']);
    } catch (error) {
      console.error('Authentication attempt failed. Please check your credentials or network status.');
      throw new Error('Login failed');
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      await this.router.navigate(['/login']);
    } catch (error) {
      console.error('Sign-out attempt encountered an issue.');
      throw new Error('Logout failed');
    }
  }


  private mapToAppUser(user: User | null): AppUser | null {
    if (!user) return null;
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    };
  }
}
