import { inject, Injectable } from '@angular/core';
import { IReport } from '../../shared/models';
import { Firestore, collectionData, collection } from '@angular/fire/firestore';
import { map, shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  firestore = inject(Firestore);

  constructor() {}

  getAll() {
    return collectionData(collection(this.firestore, 'reports'), {
      idField: 'id',
    }).pipe(
      map((t) => t as IReport[]),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }
}
