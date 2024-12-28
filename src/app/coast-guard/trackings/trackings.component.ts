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
import { ITracking } from '../../shared/models';
import { DatePipe } from '@angular/common';
import { MapComponent } from '../../shared/components/map/map.component';
import { TrackingService } from '../../core/services/tracking.service';

@Component({
  selector: 'app-trackings',
  imports: [NgxPaginationModule, DatePipe, MapComponent],
  templateUrl: './trackings.component.html',
  styleUrl: './trackings.component.scss',
})
export class TrackingsComponent implements OnInit {
  private firestore = inject(Firestore);
  private destroyRef = inject(DestroyRef);

  trackingService = inject(TrackingService);

  trackingsSignal = signal<ITracking[]>([]);
  isLoaded = signal<boolean>(false);

  itemsPerPage = TABLE_PAGINATION.ITEMS_PER_PAGE;
  currentPage = TABLE_PAGINATION.PAGE;

  mapRefSig = viewChild.required<MapComponent>('appMap');

  polylineMarkers: Map<string, any> = new Map();
  endpointMarkers: Map<string, any> = new Map();

  ngOnInit(): void {
    this.trackingService
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((trackings) => {
        console.log('subscribed trackings');

        this.isLoaded.set(true);
        this.trackingsSignal.set(trackings);
        for (let track = 0; track < trackings.length; track++) {
          const element = trackings[track];
          const trackPoints: { latitude: number; longitude: number }[] =
            element.tracks.map((track: any) => ({
              latitude: track.latitude,
              longitude: track.longitude,
            }));
          const polyline = this.mapRefSig()
            .addPolyLine(trackPoints)
            .addTo(this.mapRefSig().map);
          this.polylineMarkers.set(element.id, polyline);
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
        }
      });
  }
}
