import { inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  user,
} from '@angular/fire/auth';
import { getDoc, doc, Firestore, setDoc } from '@angular/fire/firestore';
import { filter, switchMap, from, map, of } from 'rxjs';

export interface IUserStorage {
  uid: string;
  email: string;
  role: string;
}

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

  userAuthSig = signal<IUserStorage | null | undefined>(undefined);

  constructor() {
    user(this.auth)
      .pipe(
        switchMap((u) => {
          if (!u) {
            return of(null);
          }
          return from(getDoc(doc(this.firestore, 'users', u.uid))).pipe(
            map((snap) => ({ ...snap.data(), uid: snap.id } as IUserStorage))
          );
        })
      )
      .subscribe((u) => {
        if (!u) {
          this.userAuthSig.set(null);
        } else {
          this.userAuthSig.set(u);
        }
      });
  }

  async login(email: string, password: string) {
    const { user } = await signInWithEmailAndPassword(
      this.auth,
      email,
      password
    );

    const snapshot = await getDoc(doc(this.firestore, 'users', user.uid));
    if (!snapshot.exists()) {
      throw new Error('User not found');
    }

    const userStorage: IUserStorage = {
      uid: snapshot.id,
      email: snapshot.data()['email'],
      role: snapshot.data()['role'],
    };
  }

  async register(email: string, password: string, username: string) {
    const { user } = await createUserWithEmailAndPassword(
      this.auth,
      email,
      password
    );
    const userRef = doc(this.firestore, 'users', user.uid);
    await setDoc(userRef, {
      username,
      email,
      role: 'user',
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }

  async logout() {
    await this.auth.signOut();
  }
}
