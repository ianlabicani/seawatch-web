import { inject, Injectable } from '@angular/core';
import {
  collectionData,
  collection,
  Firestore,
  collectionChanges,
  query,
  where,
} from '@angular/fire/firestore';
import { map, shareReplay } from 'rxjs';
import { ITracking } from '../../shared/models';

@Injectable({
  providedIn: 'root',
})
export class TrackingService {
  firestore = inject(Firestore);

  constructor() {}

  getAll() {
    return collectionData(collection(this.firestore, 'trackings'), {
      idField: 'id',
    }).pipe(
      map((t) => t as ITracking[]),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  getChanges() {
    return collectionChanges(
      query(
        collection(this.firestore, 'trackings'),
        where('onGoing', '==', true)
      )
    ).pipe(shareReplay({ bufferSize: 1, refCount: true }));
  }
}
