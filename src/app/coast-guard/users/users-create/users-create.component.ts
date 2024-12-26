import { Component, inject } from '@angular/core';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import {
  addDoc,
  collection,
  doc,
  Firestore,
  setDoc,
} from '@angular/fire/firestore';
import {
  FormArray,
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

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
    createdAt: [Date.now(), Validators.required],
    updatedAt: [Date.now(), Validators.required],
  });

  async onSubmit() {
    const { password: _password, ...data } = this.formGroup.getRawValue();

    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    const userCredential = await createUserWithEmailAndPassword(
      this.auth,
      data.email,
      _password
    );

    if (!userCredential.user) {
      console.log('Error creating user');
      return;
    }

    await setDoc(doc(this.firestore, 'users', userCredential.user.uid), data);

    console.log('User created successfully');
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
