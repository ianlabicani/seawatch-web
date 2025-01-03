import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { NgxPaginationModule } from 'ngx-pagination';
import { TABLE_PAGINATION } from '../../shared/constants';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IAlert, ITracking } from '../../shared/models';
import { DatePipe } from '@angular/common';
import { MapComponent } from '../../shared/components/map/map.component';
import { TrackingService } from '../../core/services/tracking.service';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { ExportPdfService } from '../../core/services/export-pdf.service';

@Component({
  selector: 'app-trackings',
  imports: [
    NgxPaginationModule,
    DatePipe,
    MapComponent,
    RouterLink,
    ReactiveFormsModule,
  ],
  templateUrl: './trackings.component.html',
  styleUrl: './trackings.component.scss',
})
export class TrackingsComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private exportPdfService = inject(ExportPdfService);
  private fb = inject(FormBuilder);
  trackingService = inject(TrackingService);

  trackingsSignal = signal<ITracking[]>([]);
  isLoaded = signal<boolean>(false);
  itemsPerPage = TABLE_PAGINATION.ITEMS_PER_PAGE;
  currentPage = TABLE_PAGINATION.PAGE;
  mapRefSig = viewChild.required<MapComponent>('appMap');
  polylineMarkers: Map<string, any> = new Map();
  endpointMarkers: Map<string, any> = new Map();
  startpointMarkers: Map<string, any> = new Map();
  exportForm = this.fb.nonNullable.group({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });
  exportError = signal<string | null>(null);

  ngOnInit(): void {
    this.trackingService
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((trackings) => {
        this.isLoaded.set(true);
        this.trackingsSignal.set(trackings);
        for (let track = 0; track < trackings.length; track++) {
          const element = trackings[track];
          const polylineColor = this.mapRefSig().getPolylineColor(element.id);

          const trackPoints: { latitude: number; longitude: number }[] =
            element.tracks.map((track: any) => ({
              latitude: track.latitude,
              longitude: track.longitude,
            }));
          const polyline = this.mapRefSig()
            .addPolyLine(trackPoints, {
              color: polylineColor, // Use the unique color
              weight: 4,
              opacity: 0.8,
            })
            .addTo(this.mapRefSig().map);
          this.polylineMarkers.set(element.id, polyline);
          const startPoint = trackPoints[0];
          const startMarker = this.mapRefSig()
            .addStartPointMarker(startPoint.latitude, startPoint.longitude)
            .bindPopup(
              `
                Username:<strong> ${element.username}</strong> <br>
                Adventure ID: ${element.id} <br>
                Start Date At: ${new Date(
                  element.createdAt.seconds * 1000
                ).toLocaleString()} <br>
                Last Update At: ${
                  element.updatedAt
                    ? new Date(
                        element.updatedAt.seconds * 1000
                      ).toLocaleString()
                    : 'Ongoing'
                } <br>
                Tracks Count: ${element.tracks.length} <br>
                Start Location: ${startPoint.latitude}, ${startPoint.longitude}
              `
            )
            .addTo(this.mapRefSig().map!);
          this.startpointMarkers.set(element.id, startMarker);
          const endPoint = trackPoints[trackPoints.length - 1];
          const endMarker = this.mapRefSig()
            .addEndPointMarker(endPoint.latitude, endPoint.longitude)
            .bindPopup(
              `
                Username:<strong> ${element.username}</strong> <br>
                Adventure ID: ${element.id} <br>
                Start Date At: ${new Date(
                  element.createdAt.seconds * 1000
                ).toLocaleString()} <br>
                Last Update At: ${
                  element.updatedAt
                    ? new Date(
                        element.updatedAt.seconds * 1000
                      ).toLocaleString()
                    : 'Ongoing'
                } <br>
                Tracks Count: ${element.tracks.length} <br>
                Current Location: ${endPoint.latitude}, ${endPoint.longitude}
              `
            )
            .addTo(this.mapRefSig().map!);

          this.endpointMarkers.set(element.id, endMarker);
          this.startpointMarkers.set(element.id, startMarker);
        }
      });
  }

  async exportToPDF() {
    const { start, end } = this.exportForm.getRawValue();

    if (!start || !end) {
      this.exportError.set('Start and end dates are required.');
      return;
    }

    const columns: (keyof ITracking)[] = [
      'id',
      'username',
      'onGoing',
      'tracks',
      'createdAt',
      'updatedAt',
    ];

    try {
      await this.exportPdfService.exportToPDF(
        'trackings',
        new Date(start),
        new Date(end),
        columns,
        'createdAt',
        (t: ITracking) => [
          t.id,
          t.username || 'No Name',
          t.onGoing ? 'Yes' : 'No',
          t.tracks.length,
          t.createdAt.toDate().toLocaleString(),
          t.updatedAt.toDate().toLocaleString(),
        ]
      );
    } catch (error: any) {
      this.exportError.set(error.message);
    }
  }
}
