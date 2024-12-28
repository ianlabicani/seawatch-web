import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TABLE_PAGINATION } from '../../shared/constants';
import { IReport } from '../../shared/models';
import { NgxPaginationModule } from 'ngx-pagination';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReportService } from '../../core/services/report.service';

@Component({
  selector: 'app-reports',
  imports: [NgxPaginationModule, DatePipe, RouterLink],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss',
})
export class ReportsComponent {
  private reportService = inject(ReportService);
  private destroyRef = inject(DestroyRef);

  reportsSig = signal<IReport[]>([]);
  isLoaded = signal<boolean>(false);

  itemsPerPage = TABLE_PAGINATION.ITEMS_PER_PAGE;
  currentPage = TABLE_PAGINATION.PAGE;

  ngOnInit(): void {
    this.reportService
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((reports) => {
        this.isLoaded.set(true);
        this.reportsSig.set(reports);
      });
  }
}
