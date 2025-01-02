import {
  Component,
  inject,
  input,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { doc, docData, Firestore } from '@angular/fire/firestore';
import { MapComponent } from '../../../shared/components/map/map.component';
import { ITracking } from '../../../shared/models';
import { map } from 'rxjs';

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
  alertMarkers: Map<string, any> = new Map();
  endpointMarkers: Map<string, any> = new Map();
  startpointMarkers: Map<string, any> = new Map();

  ngOnInit(): void {
    docData(doc(this.firestore, `trackings/${this.id()}`), { idField: 'id' })
      .pipe(map((a) => a as ITracking))
      .subscribe((a) => {
        this.trackingSig.set(a);

        const trackPoints: { latitude: number; longitude: number }[] =
          a.tracks.map((track: any) => ({
            latitude: track.latitude,
            longitude: track.longitude,
          }));
        const polyline = this.mapRefSig()
          .addPolyLine(trackPoints, {
            color: 'blue', // Use the unique color
            weight: 4,
            opacity: 0.8,
          })
          .addTo(this.mapRefSig().map);
        this.polylineMarkers.set(a.id, polyline);
        const endPoint = trackPoints[trackPoints.length - 1];
        const startPoint = trackPoints[0];
        const startMarker = this.mapRefSig()
          .addStartPointMarker(startPoint.latitude, startPoint.longitude)
          .bindPopup(
            `Username:<strong> ${a.username}</strong> <br>
                a ID: ${a.id} <br>
                Start Date: ${new Date(
                  a.createdAt.seconds * 1000
                ).toLocaleString()} <br>
                End Date: ${
                  a.updatedAt
                    ? new Date(a.updatedAt.seconds * 1000).toLocaleString()
                    : 'Ongoing'
                } <br>
                Tracks Count: ${a.tracks.length} <br>
                Start Location: ${startPoint.latitude}, ${startPoint.longitude}
              `
          )
          .addTo(this.mapRefSig().map!);

        this.startpointMarkers.set(a.id, startMarker);

        const endMarker = this.mapRefSig()
          .addEndPointMarker(endPoint.latitude, endPoint.longitude)
          .bindPopup(
            `
                Username:<strong> ${a.username}</strong> <br>
                a ID: ${a.id} <br>
                Start Date: ${new Date(
                  a.createdAt.seconds * 1000
                ).toLocaleString()} <br>
                End Date: ${
                  a.updatedAt
                    ? new Date(a.updatedAt.seconds * 1000).toLocaleString()
                    : 'Ongoing'
                } <br>
                Tracks Count: ${a.tracks.length} <br>
                Current Location: ${endPoint.latitude}, ${endPoint.longitude}
              `
          )
          .addTo(this.mapRefSig().map!);

        this.endpointMarkers.set(a.id, endMarker);
      });
  }
}
