import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import {
  Firestore,
  collectionData,
  collection,
  query,
  where,
} from '@angular/fire/firestore';
import { filter, map, switchMap } from 'rxjs';
import { ITracking } from '../../coast-guard/trackings/trackings.component';
import { TABLE_PAGINATION } from '../../shared/constants';
import { NgxPaginationModule } from 'ngx-pagination';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-user-trackings',
  imports: [NgxPaginationModule],
  templateUrl: './trackings.component.html',
  styleUrl: './trackings.component.scss',
})
export class TrackingsComponent implements OnInit {
  private firestore = inject(Firestore);
  private destroyRef = inject(DestroyRef);
  private authService = inject(AuthService);
  userAuth$ = toObservable(this.authService.userAuthSig);

  trackingsSignal = signal<ITracking[]>([]);
  isLoaded = signal<boolean>(false);

  itemsPerPage = TABLE_PAGINATION.ITEMS_PER_PAGE;
  currentPage = TABLE_PAGINATION.PAGE;

  ngOnInit(): void {
    this.userAuth$
      .pipe(
        filter((u) => !!u),
        switchMap((u) => {
          const q = query(
            collection(this.firestore, 'trackings'),
            where('uid', '==', u.uid)
          );
          return collectionData(q, {
            idField: 'id',
          }).pipe(
            map((t) => t as ITracking[]),
            takeUntilDestroyed(this.destroyRef)
          );
        })
      )
      .subscribe((trackings) => {
        this.isLoaded.set(true);
        this.trackingsSignal.set(trackings);
      });
  }
}
