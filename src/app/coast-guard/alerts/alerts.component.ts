import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Firestore, collectionData, collection } from '@angular/fire/firestore';
import { map } from 'rxjs';
import { TABLE_PAGINATION } from '../../shared/constants';
import { IAlert } from '../../shared/models';
import { NgxPaginationModule } from 'ngx-pagination';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-coast-guard-alerts',
  imports: [NgxPaginationModule, DatePipe],
  templateUrl: './alerts.component.html',
  styleUrl: './alerts.component.scss',
})
export class AlertsComponent {
  private firestore = inject(Firestore);
  private destroyRef = inject(DestroyRef);

  alertsSig = signal<IAlert[]>([]);
  isLoaded = signal<boolean>(false);

  itemsPerPage = TABLE_PAGINATION.ITEMS_PER_PAGE;
  currentPage = TABLE_PAGINATION.PAGE;

  ngOnInit(): void {
    collectionData(collection(this.firestore, 'alerts'), {
      idField: 'id',
    })
      .pipe(
        map((t) => t as IAlert[]),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((alerts) => {
        this.isLoaded.set(true);
        this.alertsSig.set(alerts);

        console.log(alerts);
      });
  }
}
