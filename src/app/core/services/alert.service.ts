import { inject, Injectable } from '@angular/core';
import { IAlert } from '../../shared/models';
import { Firestore, collectionData, collection } from '@angular/fire/firestore';
import { map, shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  firestore = inject(Firestore);

  constructor() {}

  getAll() {
    const alerts$ = collectionData(collection(this.firestore, 'alerts'), {
      idField: 'id',
    }).pipe(
      map((a) => a as IAlert[]),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    return alerts$;
  }
}
