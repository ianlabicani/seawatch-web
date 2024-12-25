import { Component, inject, input, OnInit, signal } from '@angular/core';
import { doc, Firestore, getDoc } from '@angular/fire/firestore';
import { IUserAuth } from '../../../auth/auth.service';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-users-details',
  imports: [],
  templateUrl: './users-details.component.html',
  styleUrl: './users-details.component.scss',
})
export class UsersDetailsComponent implements OnInit {
  private firestore = inject(Firestore);

  id = input.required<string>();
  userSig = signal<IUserAuth | null>(null);

  ngOnInit(): void {
    getDoc(doc(this.firestore, 'users', this.id())).then((snapshot) => {
      this.userSig.set({ ...snapshot.data(), id: snapshot.id } as IUserAuth);
    });
  }
}
