import { inject, Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { getDoc, doc, Firestore } from '@angular/fire/firestore';

export interface IUserAuth {
  id: string;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
  profilePictureUrl?: string;
  phoneNumber?: string;
  address?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  constructor() {}

  async login(email: string, password: string) {
    const { user } = await signInWithEmailAndPassword(
      this.auth,
      email,
      password
    );

    const snapshot = await getDoc(doc(this.firestore, 'users', user.uid));
    this.setUserAuth({ ...snapshot.data() } as IUserAuth);
  }

  async logout() {
    await this.auth.signOut();
    this.removeUserAuth();
  }

  private setUserAuth(user: IUserAuth) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  getUserAuth() {
    const user = localStorage.getItem('user');
    if (!user) return null;

    return JSON.parse(user);
  }

  private removeUserAuth() {
    localStorage.removeItem('user');
  }
}
