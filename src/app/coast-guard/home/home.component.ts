import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  viewChild,
} from '@angular/core';
import { MapComponent } from '../../shared/components/map/map.component';
// @ts-ignore
import L from 'leaflet';
import {
  collectionChanges,
  collection,
  where,
  query,
  Firestore,
} from '@angular/fire/firestore';
import { IAlert, ITracking } from '../../shared/models';
import { TrackingService } from '../../core/services/tracking.service';

@Component({
  selector: 'app-home',
  imports: [MapComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private firestore = inject(Firestore);
  private trackingService = inject(TrackingService);
  destroyRef = inject(DestroyRef);

  mapRef = viewChild.required<MapComponent>('appMap');

  alertMarkers: Map<string, any> = new Map();
  polylineMarkers: Map<string, any> = new Map();
  endpointMarkers: Map<string, any> = new Map();
  startpointMarkers: Map<string, any> = new Map();

  ngOnInit(): void {
    this.trackingService.getChanges().subscribe((changes: any) => {
      changes.forEach((change: any) => {
        const adventure = {
          ...change.doc.data(),
          id: change.doc.id,
        } as ITracking;

        const polylineColor = this.mapRef().getPolylineColor(adventure.id);

        if (change.type === 'added') {
          const trackPoints: { latitude: number; longitude: number }[] =
            adventure.tracks.map((track: any) => ({
              latitude: track.latitude,
              longitude: track.longitude,
            }));
          const polyline = this.mapRef()
            .addPolyLine(trackPoints, {
              color: polylineColor, // Use the unique color
              weight: 4,
              opacity: 0.8,
            })
            .addTo(this.mapRef().map);
          this.polylineMarkers.set(adventure.id, polyline);
          const endPoint = trackPoints[trackPoints.length - 1];
          const startPoint = trackPoints[0];
          const startMarker = this.mapRef()
            .addStartPointMarker(startPoint.latitude, startPoint.longitude)
            .bindPopup(
              `Username:<strong> ${adventure.username}</strong> <br>
                Adventure ID: ${adventure.id} <br>
                Start Date: ${new Date(
                  adventure.createdAt.seconds * 1000
                ).toLocaleString()} <br>
                End Date: ${
                  adventure.updatedAt
                    ? new Date(
                        adventure.updatedAt.seconds * 1000
                      ).toLocaleString()
                    : 'Ongoing'
                } <br>
                Tracks Count: ${adventure.tracks.length} <br>
                Start Location: ${startPoint.latitude}, ${startPoint.longitude}
              `
            )
            .addTo(this.mapRef().map!);

          this.startpointMarkers.set(adventure.id, startMarker);

          const endMarker = this.mapRef()
            .addEndPointMarker(endPoint.latitude, endPoint.longitude)
            .bindPopup(
              `
                Username:<strong> ${adventure.username}</strong> <br>
                Adventure ID: ${adventure.id} <br>
                Start Date: ${new Date(
                  adventure.createdAt.seconds * 1000
                ).toLocaleString()} <br>
                End Date: ${
                  adventure.updatedAt
                    ? new Date(
                        adventure.updatedAt.seconds * 1000
                      ).toLocaleString()
                    : 'Ongoing'
                } <br>
                Tracks Count: ${adventure.tracks.length} <br>
                Current Location: ${endPoint.latitude}, ${endPoint.longitude}
              `
            )
            .addTo(this.mapRef().map!);

          this.endpointMarkers.set(adventure.id, endMarker);
        }

        if (change.type === 'modified') {
          const trackPoints: { latitude: number; longitude: number }[] =
            adventure.tracks.map((track) => ({
              latitude: track.latitude,
              longitude: track.longitude,
            }));
          const polyline = this.polylineMarkers.get(adventure.id);
          polyline.setLatLngs(
            trackPoints.map((coord) =>
              L.latLng(coord.latitude, coord.longitude)
            )
          );
          const endPoint = trackPoints[trackPoints.length - 1];
          const endMarker = this.endpointMarkers.get(adventure.id);
          endMarker.setLatLng([endPoint.latitude, endPoint.longitude]);
        }

        if (change.type === 'removed') {
          const polyline = this.polylineMarkers.get(adventure.id);
          polyline.removeFrom(this.mapRef().map!);
          this.polylineMarkers.delete(adventure.id);
          const endMarker = this.endpointMarkers.get(adventure.id);
          endMarker.removeFrom(this.mapRef().map!);
          const startMarker = this.startpointMarkers.get(adventure.id);
          startMarker.removeFrom(this.mapRef().map!);
          this.endpointMarkers.delete(adventure.id);
          this.startpointMarkers.delete(adventure.id);
        }
      });
    });

    collectionChanges(
      query(
        collection(this.firestore, 'alerts'),
        where('isResolved', '==', false)
      )
    ).subscribe((changes: any) => {
      changes.forEach((change: any) => {
        const alert = {
          ...change.doc.data(),
          id: change.doc.id,
        } as IAlert;
        if (change.type === 'added') {
          const alertMarker = this.mapRef()
            .addAlertMarker(alert.geoPoint.latitude, alert.geoPoint.longitude)
            .bindPopup(
              `
                Username:<strong> ${alert.username}</strong> <br>
                Alert ID: ${alert.id} <br>
                Reported At: 
                <strong>
                ${new Date(alert.createdAt.seconds * 1000).toLocaleString()}
                </strong> 
                 <br>
                 `
            )
            .addTo(this.mapRef().map!);
          this.alertMarkers.set(change.doc.id, alertMarker);
        }
        if (change.type === 'modified') {
          const alertMarker = this.alertMarkers.get(change.doc.id);
          alertMarker.setLatLng([
            alert.geoPoint.latitude,
            alert.geoPoint.longitude,
          ]);
        }
        if (change.type === 'removed') {
          const alertMarker = this.alertMarkers.get(change.doc.id);
          alertMarker.removeFrom(this.mapRef().map!);
          this.alertMarkers.delete(change.doc.id);
        }
      });
    });
  }
}
