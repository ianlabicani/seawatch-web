import { Component, inject, input, signal } from '@angular/core';
import {
  addDoc,
  collection,
  Firestore,
  GeoPoint,
  Timestamp,
} from '@angular/fire/firestore';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-alerts-report-form',
  imports: [ReactiveFormsModule],
  templateUrl: './alerts-report-form.component.html',
  styleUrl: './alerts-report-form.component.scss',
})
export class AlertsReportFormComponent {
  private fb = inject(FormBuilder);
  private firestore = inject(Firestore);
  router = inject(Router);

  alertId = input.required<string>();

  formGroup = this.fb.nonNullable.group({
    description: ['', [Validators.required]],
    who: ['', Validators.required],
    what: ['', Validators.required],
    where: ['', Validators.required],
    when: ['', Validators.required],
    how: ['', Validators.required],

    createdAt: [Timestamp.now(), Validators.required],
    updatedAt: [Timestamp.now(), Validators.required],
  });

  isSubmitting = signal(false);

  async onSubmit() {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const data = this.formGroup.getRawValue();

    try {
      await addDoc(collection(this.firestore, 'reports'), {
        ...data,
      });
    } catch (error) {
      console.error('Error creating report:', error);
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
