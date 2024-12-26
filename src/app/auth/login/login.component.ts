import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  formGroup = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  isLogin = signal(false);
  errorMessage = signal<string | null>(null);

  async onSubmit() {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }
    this.isLogin.set(true);

    try {
      const { email, password } = this.formGroup.getRawValue();
      await this.authService.login(email, password);
      setTimeout(() => {
        this.isLogin.set(false);
        this.errorMessage.set(null);
        const userAuthData = this.authService.userAuthSig();

        if (!userAuthData) {
          this.router.navigate(['/']);
          return;
        }

        if (userAuthData.role === 'coast-guard') {
          this.router.navigate(['/coast-guard']);
          return;
        } else if (userAuthData.role === 'user') {
          this.router.navigate(['/user']);
          return;
        }
      }, 1000);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        this.errorMessage.set('User not found');
        this.formGroup.controls.password.reset();
      } else if (error.code === 'auth/wrong-password') {
        this.errorMessage.set('Wrong password');
        this.formGroup.controls.password.reset();
      } else {
        this.errorMessage.set('An error occurred');
      }
      this.isLogin.set(false);
      console.error(error);
    }
  }
}
