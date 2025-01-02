import {
  Component,
  DestroyRef,
  inject,
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

@Component({
  selector: 'app-coast-guard-alerts',
  imports: [NgxPaginationModule, DatePipe, RouterLink, MapComponent],
  templateUrl: './alerts.component.html',
  styleUrl: './alerts.component.scss',
})
export class AlertsComponent {
  private destroyRef = inject(DestroyRef);
  private alertService = inject(AlertService);

  alertsSig = signal<IAlert[]>([]);
  isLoaded = signal<boolean>(false);

  itemsPerPage = TABLE_PAGINATION.ITEMS_PER_PAGE;
  currentPage = TABLE_PAGINATION.PAGE;
  mapRefSig = viewChild.required<MapComponent>('appMap');

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
}
