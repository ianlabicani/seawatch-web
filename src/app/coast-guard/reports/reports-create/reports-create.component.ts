import { Component, inject, signal } from '@angular/core';
import {
  Firestore,
  Timestamp,
  GeoPoint,
  addDoc,
  collection,
} from '@angular/fire/firestore';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-reports-create',
  imports: [ReactiveFormsModule],
  templateUrl: './reports-create.component.html',
  styleUrl: './reports-create.component.scss',
})
export class ReportsCreateComponent {
  private fb = inject(FormBuilder);
  private firestore = inject(Firestore);
  router = inject(Router);
  route = inject(ActivatedRoute);
  isSubmitting = signal(false);

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
        location: new GeoPoint(0, 0),
        incidentDate: Timestamp.fromDate(new Date()),
      });

      this.router.navigate(['..'], { relativeTo: this.route });
    } catch (error) {
      console.error('Error creating report:', error);
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
