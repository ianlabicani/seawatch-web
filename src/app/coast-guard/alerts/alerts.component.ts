import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TABLE_PAGINATION } from '../../shared/constants';
import { IAlert } from '../../shared/models';
import { NgxPaginationModule } from 'ngx-pagination';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MapComponent } from '../../shared/components/map/map.component';
import { AlertService } from '../../core/services/alert.service';
import { ExportPdfService } from '../../core/services/export-pdf.service';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-coast-guard-alerts',
  imports: [
    NgxPaginationModule,
    DatePipe,
    RouterLink,
    MapComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './alerts.component.html',
  styleUrl: './alerts.component.scss',
})
export class AlertsComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private alertService = inject(AlertService);
  private exportPdfService = inject(ExportPdfService);
  private fb = inject(FormBuilder);

  alertsSig = signal<IAlert[]>([]);
  isLoaded = signal<boolean>(false);

  itemsPerPage = TABLE_PAGINATION.ITEMS_PER_PAGE;
  currentPage = TABLE_PAGINATION.PAGE;
  mapRefSig = viewChild.required<MapComponent>('appMap');

  exportForm = this.fb.nonNullable.group({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });
  exportError = signal<string | null>(null);

  ngOnInit(): void {
    this.alertService
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((alerts) => {
        this.isLoaded.set(true);
        this.alertsSig.set(alerts);
        for (let a = 0; a < alerts.length; a++) {
          const element = alerts[a];
          this.mapRefSig()
            .addAlertMarker(
              element.geoPoint.latitude,
              element.geoPoint.longitude
            )
            .bindPopup(
              `
                Username:<strong> ${element.username}</strong> <br>
                Alert ID: ${element.id} <br>
                Reported At: 
                <strong>
                ${new Date(element.createdAt.seconds * 1000).toLocaleString()}
                </strong> 
                 <br>
                 `
            )
            .addTo(this.mapRefSig().map);
        }
      });
  }

  async exportToPDF() {
    const { start, end } = this.exportForm.getRawValue();

    if (!start || !end) {
      this.exportError.set('Start and end dates are required.');
      return;
    }

    const columns: (keyof IAlert)[] = [
      'id',
      'username',
      'geoPoint',
      'isResolved',
      'createdAt',
      'updatedAt',
    ];

    try {
      await this.exportPdfService.exportToPDF(
        'alerts',
        new Date(start),
        new Date(end),
        columns,
        'createdAt',
        (alert: IAlert) => [
          alert.id,
          alert.username || 'No Name',
          `${alert.geoPoint.latitude}, ${alert.geoPoint.longitude}`,
          alert.isResolved ? 'Yes' : 'No',
          alert.trackingId || 'N/A',
          alert.createdAt.toDate().toLocaleString(),
          alert.updatedAt.toDate().toLocaleString(),
        ]
      );
    } catch (error: any) {
      this.exportError.set(error.message);
    }
  }
}
