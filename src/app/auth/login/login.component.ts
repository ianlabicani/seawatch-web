import { Component, inject, signal } from '@angular/core';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { doc, Firestore, getDoc } from '@angular/fire/firestore';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(Auth);
  private firestore = inject(Firestore);
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
      const { user } = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );

      const userData = getDoc(doc(this.firestore, 'users', user.uid));
      localStorage.setItem('user', JSON.stringify(userData));
      this.isLogin.set(false);
      this.errorMessage.set(null);
      this.router.navigate(['/dashboard']);
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
