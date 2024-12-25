import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { collection, collectionData, Firestore } from '@angular/fire/firestore';
import { NgxPaginationModule } from 'ngx-pagination'; // <-- import the module

import { map } from 'rxjs';
import { TABLE_PAGINATION } from '../../shared/constants';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export interface ITracking {
  id: string;
  username: string;
  description: string;
  location: string;
  date: string;
}

@Component({
  selector: 'app-trackings',
  imports: [NgxPaginationModule],
  templateUrl: './trackings.component.html',
  styleUrl: './trackings.component.scss',
})
export class TrackingsComponent implements OnInit {
  private firestore = inject(Firestore);
  private destroyRef = inject(DestroyRef);

  trackingsSignal = signal<ITracking[]>([]);

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
        // this.trackingsSignal.set(trackings);
      });

    this.trackingsSignal.set([
      {
        id: '1',
        username: 'John Doe',
        description: 'Delivered package',
        location: 'New York',
        date: '2024-12-25',
      },
      {
        id: '3',
        username: 'Michael Johnson',
        description: 'In transit',
        location: 'Chicago',
        date: '2024-12-23',
      },
      {
        id: '2',
        username: 'Jane Smith',
        description: 'Picked up package',
        location: 'Los Angeles',
        date: '2024-12-24',
      },
    ]);
  }
}
