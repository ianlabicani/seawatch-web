import { Component, inject, OnInit, signal } from '@angular/core';
import { collection, collectionData, Firestore } from '@angular/fire/firestore';
import { map } from 'rxjs';

export interface ITracking {
  id: string;
  name: string;
  description: string;
  location: string;
  date: string;
}

@Component({
  selector: 'app-trackings',
  imports: [],
  templateUrl: './trackings.component.html',
  styleUrl: './trackings.component.scss',
})
export class TrackingsComponent implements OnInit {
  private firestore = inject(Firestore);
  trackingsSignal = signal<ITracking[]>([]);

  ngOnInit(): void {
    collectionData(collection(this.firestore, 'trackings'), {
      idField: 'id',
    })
      .pipe(map((t) => t as ITracking[]))
      .subscribe((trackings) => {
        // this.trackingsSignal.set(trackings);
      });

    this.trackingsSignal.set([
      {
        id: '1',
        name: 'John Doe',
        description: 'Delivered package',
        location: 'New York',
        date: '2024-12-25',
      },
      {
        id: '3',
        name: 'Michael Johnson',
        description: 'In transit',
        location: 'Chicago',
        date: '2024-12-23',
      },
      {
        id: '2',
        name: 'Jane Smith',
        description: 'Picked up package',
        location: 'Los Angeles',
        date: '2024-12-24',
      },
    ]);
  }
}
