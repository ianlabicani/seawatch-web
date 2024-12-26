import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Firestore, collectionData, collection } from '@angular/fire/firestore';
import { map } from 'rxjs';
import { TABLE_PAGINATION } from '../../shared/constants';
import { IAlert, IReport } from '../../shared/models';
import { NgxPaginationModule } from 'ngx-pagination';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-reports',
  imports: [NgxPaginationModule, DatePipe, RouterLink],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss',
})
export class ReportsComponent {
  private firestore = inject(Firestore);
  private destroyRef = inject(DestroyRef);

  reportsSig = signal<IReport[]>([]);
  isLoaded = signal<boolean>(false);

  itemsPerPage = TABLE_PAGINATION.ITEMS_PER_PAGE;
  currentPage = TABLE_PAGINATION.PAGE;

  ngOnInit(): void {
    collectionData(collection(this.firestore, 'reports'), {
      idField: 'id',
    })
      .pipe(
        map((t) => t as IReport[]),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((reports) => {
        this.isLoaded.set(true);
        this.reportsSig.set(reports);

        console.log(reports);
      });
  }
}
