import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { collection, collectionData, Firestore } from '@angular/fire/firestore';
import { NgxPaginationModule } from 'ngx-pagination'; // <-- import the module

import { map } from 'rxjs';
import { TABLE_PAGINATION } from '../../shared/constants';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ITracking } from '../../shared/models';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-trackings',
  imports: [NgxPaginationModule, DatePipe],
  templateUrl: './trackings.component.html',
  styleUrl: './trackings.component.scss',
})
export class TrackingsComponent implements OnInit {
  private firestore = inject(Firestore);
  private destroyRef = inject(DestroyRef);

  trackingsSignal = signal<ITracking[]>([]);
  isLoaded = signal<boolean>(false);

  itemsPerPage = TABLE_PAGINATION.ITEMS_PER_PAGE;
  currentPage = TABLE_PAGINATION.PAGE;

  ngOnInit(): void {
    collectionData(collection(this.firestore, 'trackings'), {
      idField: 'id',
    })
      .pipe(
        map((t) => t as ITracking[]),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((trackings) => {
        this.isLoaded.set(true);
        this.trackingsSignal.set(trackings);
      });
  }
}
