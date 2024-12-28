import { inject, Injectable } from '@angular/core';
import { IUserAuth } from '../../auth/auth.service';
import { Firestore, collectionData, collection } from '@angular/fire/firestore';
import { map, shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  firestore = inject(Firestore);

  constructor() {}

  getAll() {
    return collectionData(collection(this.firestore, 'users'), {
      idField: 'id',
    }).pipe(
      map((t) => t as IUserAuth[]),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }
}
