import { inject, Injectable } from '@angular/core';
import { IAlert } from '../../shared/models';
import { Firestore, collectionData, collection } from '@angular/fire/firestore';
import { map, shareReplay } from 'rxjs';
import { tap } from 'rxjs/operators';
import Swal from 'sweetalert2';
@Injectable({
  providedIn: 'root',
})
export class AlertService {
  firestore = inject(Firestore);

  constructor() {}

  getAll() {
    return collectionData(collection(this.firestore, 'alerts'), {
      idField: 'id',
    }).pipe(
      map((a) => a as IAlert[]),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  getUnresolvedCount() {
    return this.getAll().pipe(
      map((alerts) => alerts.filter((alert) => !alert.isResolved).length)
    );
  }
}
