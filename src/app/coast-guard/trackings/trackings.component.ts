import { Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { collection, Firestore, getDocs } from '@angular/fire/firestore';
import { NgxPaginationModule } from 'ngx-pagination';
import { TABLE_PAGINATION } from '../../shared/constants';
import { ITracking } from '../../shared/models';
import { DatePipe } from '@angular/common';
import { MapComponent } from '../../shared/components/map/map.component';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { ExportPdfService } from '../../core/services/export-pdf.service';
import { from } from 'rxjs';

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
  private exportPdfService = inject(ExportPdfService);
  private fb = inject(FormBuilder);
  firestore = inject(Firestore);

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
    from(this.getAllTrackings()).subscribe((trackings) => {
      this.isLoaded.set(true);
      this.trackingsSignal.set(trackings);
      this.addTrackingsToMap(trackings);
    });
  }

  async getAllTrackings() {
    const trackingsSnapshot = await getDocs(
      collection(this.firestore, 'trackings')
    );
    const trackings: ITracking[] = [];
    trackingsSnapshot.forEach((doc) => {
      const tracking = { ...doc.data(), id: doc.id } as ITracking;
      trackings.push(tracking);
    });
    return trackings;
  }

  private addTrackingsToMap(trackings: ITracking[]) {
    for (let i = 0; i < trackings.length; i++) {
      const tracking = trackings[i];
      const polylineColor = this.mapRefSig().getPolylineColor(tracking.id);

      const trackPoints: { latitude: number; longitude: number }[] =
        tracking.tracks.map((track: any) => ({
          latitude: track.latitude,
          longitude: track.longitude,
        }));
      // startpoint
      const startPoint = trackPoints[0];
      const startMarker = this.mapRefSig()
        .addStartPointMarker(tracking)
        .addTo(this.mapRefSig().map!);
      this.startpointMarkers.set(tracking.id, startMarker);

      // polyline
      const polyline = this.mapRefSig()
        .addPolyLine(trackPoints, {
          color: polylineColor,
          weight: 4,
          opacity: 0.8,
        })
        .addTo(this.mapRefSig().map);
      this.polylineMarkers.set(tracking.id, polyline);

      // endpoint
      const endPoint = trackPoints[trackPoints.length - 1];
      const endMarker = this.mapRefSig()
        .addEndPointMarker(tracking)
        .addTo(this.mapRefSig().map!);

      this.endpointMarkers.set(tracking.id, endMarker);
      this.startpointMarkers.set(tracking.id, startMarker);
    }
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
