import {
  Component,
  inject,
  input,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { doc, Firestore, getDoc } from '@angular/fire/firestore';
import { MapComponent } from '../../../shared/components/map/map.component';
import { ITracking } from '../../../shared/models';
import { from } from 'rxjs';

@Component({
  selector: 'app-trackings-details',
  imports: [MapComponent],
  templateUrl: './trackings-details.component.html',
  styleUrl: './trackings-details.component.scss',
})
export class TrackingsDetailsComponent implements OnInit {
  id = input.required<string>();
  firestore = inject(Firestore);
  trackingSig = signal<ITracking | null>(null);
  mapRefSig = viewChild.required<MapComponent>('appMap');
  polylineMarkers: Map<string, any> = new Map();

  ngOnInit(): void {
    from(this.getTracking(this.id())).subscribe((tracking) => {
      this.trackingSig.set(tracking);
      this.addTrackingToMap(tracking);
    });
  }

  async getTracking(id: string) {
    const trackingDoc = await getDoc(doc(this.firestore, `trackings/${id}`));
    return { ...trackingDoc.data(), id: trackingDoc.id } as ITracking;
  }

  addTrackingToMap(tracking: ITracking) {
    const polylineColor = this.mapRefSig().getPolylineColor(tracking.id);

    const trackPoints: { latitude: number; longitude: number }[] =
      tracking.tracks.map((track: any) => ({
        latitude: track.latitude,
        longitude: track.longitude,
      }));
    // startpoint
    const startPoint = trackPoints[0];
    this.mapRefSig().addStartPointMarker(tracking).addTo(this.mapRefSig().map!);

    // polyline
    this.mapRefSig()
      .addPolyLine(trackPoints, {
        color: polylineColor,
        weight: 4,
        opacity: 0.8,
      })
      .addTo(this.mapRefSig().map);

    // endpoint
    this.mapRefSig().addEndPointMarker(tracking).addTo(this.mapRefSig().map!);
  }

  get durationMinutes(): number {
    const trackingData = this.trackingSig();
    if (!trackingData) {
      return 0;
    }

    const createdAtMs =
      trackingData.createdAt.seconds * 1000 +
      trackingData.createdAt.nanoseconds / 1e6;

    const updatedAtMs =
      trackingData.updatedAt.seconds * 1000 +
      trackingData.updatedAt.nanoseconds / 1e6;

    return Math.floor((updatedAtMs - createdAtMs) / (1000 * 60));
  }
}
