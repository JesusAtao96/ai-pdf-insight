import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-[-10%] right-[-5%] w-[40rem] h-[40rem] rounded-full bg-tertiary-container/20 blur-[120px] pointer-events-none"></div>
    <div class="fixed bottom-[-5%] left-[-5%] w-[30rem] h-[30rem] rounded-full bg-primary-container/10 blur-[100px] pointer-events-none"></div>

    <main class="relative z-10 w-full max-w-[440px] flex flex-col items-center mx-auto mt-[10vh]">
      <!-- Brand Identity Section -->
      <div class="mb-16 text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary-container mb-8 ambient-shadow">
          <span class="material-symbols-outlined text-on-primary-container text-4xl" style="font-variation-settings: 'FILL' 1;">auto_awesome</span>
        </div>
        <h1 class="font-headline text-4xl font-extrabold tracking-tight text-on-surface mb-4 leading-tight">
          AI-Powered <br/>
          <span class="text-primary">Document Insight</span>
        </h1>
        <p class="text-on-surface-variant font-body text-lg max-w-xs mx-auto">
          Advanced document analysis driven by curated intelligence.
        </p>
      </div>

      <!-- Login Container -->
      <div class="w-full glass-effect bg-surface rounded-xl p-10 ambient-shadow flex flex-col gap-8 border border-outline-variant/30">
        <div class="text-center">
          <h2 class="font-headline text-xl font-bold mb-2">Welcome Back</h2>
          <p class="text-sm text-on-surface-variant font-label">Please use your professional Gmail account to continue.</p>
        </div>

        <!-- Login Action -->
        <button 
          (click)="login()"
          class="button-gradient w-full py-4 px-6 rounded-lg text-on-primary flex items-center justify-center gap-4 transition-all hover:scale-[1.02] active:scale-[0.98] ambient-shadow">
          <div class="bg-white p-2 rounded-sm flex items-center justify-center shadow-sm">
            <svg height="18" viewBox="0 0 18 18" width="18">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"></path>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"></path>
              <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.712s.102-1.173.282-1.712V4.956H.957C.347 6.173 0 7.548 0 9s.347 2.827.957 4.044l3.007-2.332z" fill="#FBBC05"></path>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.956L3.964 7.288c.708-2.127 2.692-3.708 5.036-3.708z" fill="#EA4335"></path>
            </svg>
          </div>
          <span class="font-headline font-bold text-base tracking-wide">Log in with Google</span>
        </button>

        <!-- Metadata/Info Rail -->
        <div class="mt-4 flex flex-col gap-4">
          <div class="flex items-center gap-3 p-4 rounded-lg bg-surface-container-low border border-outline-variant/20">
            <span class="material-symbols-outlined text-primary text-2xl">verified_user</span>
            <span class="text-xs font-label text-on-surface-variant leading-relaxed">
              Enterprise-grade security. Only authorized domain accounts can access analysis results.
            </span>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <footer class="mt-12 flex items-center gap-6 text-xs font-label text-outline uppercase tracking-widest opacity-60">
        <a class="hover:text-primary transition-colors" href="#">Privacy Policy</a>
        <div class="w-1 h-1 rounded-full bg-outline-variant"></div>
        <a class="hover:text-primary transition-colors" href="#">Terms of Service</a>
        <div class="w-1 h-1 rounded-full bg-outline-variant"></div>
        <a class="hover:text-primary transition-colors" href="#">Help Center</a>
      </footer>
    </main>

    <!-- Visual Artifacts -->
    <div class="fixed top-20 left-20 opacity-5 pointer-events-none">
      <span class="material-symbols-outlined text-[120px] font-thin text-on-surface">description</span>
    </div>
    <div class="fixed bottom-20 right-20 opacity-5 pointer-events-none transform rotate-12">
      <span class="material-symbols-outlined text-[150px] font-thin text-on-surface">psychology</span>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background-color: var(--color-background);
      overflow-x: hidden;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly authService = inject(AuthService);

  async login() {
    await this.authService.loginWithGoogle();
  }
}
