import { Component, inject, signal } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  updateCurrentUser,
} from '@angular/fire/auth';
import { doc, Firestore, setDoc, Timestamp } from '@angular/fire/firestore';
import {
  FormArray,
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-users-create',
  imports: [ReactiveFormsModule],
  templateUrl: './users-create.component.html',
  styleUrl: './users-create.component.scss',
})
export class UsersCreateComponent {
  private fb = inject(FormBuilder);
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  router = inject(Router);
  route = inject(ActivatedRoute);
  isSubmitting = signal(false);

  formGroup = this.fb.nonNullable.group({
    boatId: ['', Validators.required],
    username: ['', [Validators.required, Validators.minLength(3)]],
    firstname: ['', Validators.required],
    lastname: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['user', Validators.required],
    profilePictureUrl: [null],
    phoneNumber: ['', Validators.required],
    emergencyContact: this.fb.array([]),
    address: [''],
    lastLogin: [null],
    createdAt: [Timestamp.now(), Validators.required],
    updatedAt: [Timestamp.now(), Validators.required],
  });

  async onSubmit() {
    const { password: _password, ...data } = this.formGroup.getRawValue();

    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }
    this.isSubmitting.set(true);
    const currentUser = this.auth.currentUser;

    const userCredential = await createUserWithEmailAndPassword(
      this.auth,
      data.email,
      _password
    );

    if (!userCredential.user) {
      console.error('Error creating user');
      return;
    }

    await updateCurrentUser(this.auth, currentUser);

    await setDoc(doc(this.firestore, 'users', userCredential.user.uid), data);

    this.router.navigate(['..', userCredential.user.uid, 'details'], {
      relativeTo: this.route,
    });
  }

  get emergencyContact(): FormArray {
    return this.formGroup.get('emergencyContact') as FormArray;
  }

  addEmergencyContact(): void {
    const contactGroup = this.fb.group({
      name: ['', Validators.required],
      relationship: ['', Validators.required],
      phoneNumber: [
        '',
        [Validators.required, Validators.pattern(/^\+?[0-9]{7,15}$/)],
      ],
    });
    this.emergencyContact.push(contactGroup);
  }

  removeEmergencyContact(index: number): void {
    this.emergencyContact.removeAt(index);
  }
}
