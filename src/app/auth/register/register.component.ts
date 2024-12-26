import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';
import { Firestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  authService = inject(AuthService);
  private router = inject(Router);

  formGroup = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  isSubmit = signal(false);
  errorMessage = signal<string | null>(null);

  async onSubmit() {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }
    this.isSubmit.set(true);

    try {
      const { email, password, username } = this.formGroup.getRawValue();
      await this.authService.register(email, password, username);
      this.isSubmit.set(false);
      this.errorMessage.set(null);
      this.router.navigate(['/user']);
    } catch (error) {}
  }
}
