import { Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { TABLE_PAGINATION } from '../../shared/constants';
import { IAlert } from '../../shared/models';
import { NgxPaginationModule } from 'ngx-pagination';
import { DatePipe, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MapComponent } from '../../shared/components/map/map.component';
import { ExportPdfService } from '../../core/services/export-pdf.service';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  getDoc,
  doc,
  Firestore,
  collection,
  getDocs,
} from '@angular/fire/firestore';
import { from } from 'rxjs';
import { IUserAuth } from '../../auth/auth.service';

@Component({
  selector: 'app-coast-guard-alerts',
  imports: [
    NgxPaginationModule,
    DatePipe,
    RouterLink,
    MapComponent,
    ReactiveFormsModule,
    NgClass,
  ],
  templateUrl: './alerts.component.html',
  styleUrl: './alerts.component.scss',
})
export class AlertsComponent implements OnInit {
  firestore = inject(Firestore);
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
    from(this.getAllAlerts()).subscribe((alerts) => {
      this.isLoaded.set(true);
      this.alertsSig.set(alerts);
      this.addAlertsToMap(alerts);
    });
  }

  async addAlertsToMap(alerts: IAlert[]) {
    for (let i = 0; i < alerts.length; i++) {
      const alert = alerts[i];

      const userDoc = await getDoc(doc(this.firestore, 'users', alert.uid));
      const user = { ...userDoc.data(), id: userDoc.id } as IUserAuth;
      this.mapRefSig().addAlertMarker(alert, user).addTo(this.mapRefSig().map);
    }
  }

  async getAllAlerts() {
    const alertsSnapshot = await getDocs(collection(this.firestore, 'alerts'));
    const alerts: IAlert[] = [];
    alertsSnapshot.forEach((doc) => {
      const alert = { ...doc.data(), id: doc.id } as IAlert;
      alerts.push(alert);
    });
    return alerts;
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
