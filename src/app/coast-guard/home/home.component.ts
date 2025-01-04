import { Component, inject, OnDestroy, OnInit, viewChild } from '@angular/core';
import { MapComponent } from '../../shared/components/map/map.component';
// @ts-ignore
import L from 'leaflet';
import {
  collection,
  where,
  query,
  Firestore,
  getDoc,
  doc,
  onSnapshot,
  getCountFromServer,
} from '@angular/fire/firestore';
import { IAlert, ITracking } from '../../shared/models';
import { IUserAuth } from '../../auth/auth.service';
import { from } from 'rxjs';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [MapComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy {
  private firestore = inject(Firestore);
  private router = inject(Router);

  mapRef = viewChild.required<MapComponent>('appMap');

  alertMarkers: Map<string, any> = new Map();
  polylineMarkers: Map<string, any> = new Map();
  endpointMarkers: Map<string, any> = new Map();
  startpointMarkers: Map<string, any> = new Map();
  alertsUnsubscribe: any;
  trackingsUnsubscribe: any;

  ngOnInit(): void {
    this.listenToAlerts();
    this.listenToTrackings();
    from(this.isThereUnresolvedAlerts()).subscribe((isThereAlerts) => {
      if (isThereAlerts) {
        Swal.fire({
          title: '🚨 Alert  🚨',
          text: 'There is a new alert, check the alerts page',
          icon: 'warning',
          showCancelButton: true,
        }).then((result) => {
          if (result.isConfirmed) {
            this.router.navigate(['/coast-guard/alerts']);
          }
        });
      }
    });
  }

  ngOnDestroy(): void {
    if (this.alertsUnsubscribe) {
      this.alertsUnsubscribe();
    }

    if (this.trackingsUnsubscribe) {
      this.trackingsUnsubscribe();
    }
  }

  private listenToTrackings() {
    const q = query(
      collection(this.firestore, 'trackings'),
      where('onGoing', '==', true)
    );
    this.trackingsUnsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        const tracking = {
          ...change.doc.data(),
          id: change.doc.id,
        } as ITracking;

        const polylineColor = this.mapRef().getPolylineColor(tracking.id);

        if (change.type === 'added') {
          const userDoc = await getDoc(
            doc(this.firestore, 'users', tracking.uid)
          );
          const user = { ...userDoc.data(), id: userDoc.id } as IUserAuth;
          const trackPoints: { latitude: number; longitude: number }[] =
            tracking.tracks.map((track) => ({
              latitude: track.latitude,
              longitude: track.longitude,
            }));
          // startpoint
          const startPoint = trackPoints[0];
          const startMarker = this.mapRef()
            .addStartPointMarker(tracking)
            .addTo(this.mapRef().map!);
          this.startpointMarkers.set(tracking.id, startMarker);
          //polyline
          const polyline = this.mapRef()
            .addPolyLine(trackPoints, {
              color: 'red',
              weight: 4,
              opacity: 0.8,
            })
            .addTo(this.mapRef().map!);
          this.polylineMarkers.set(tracking.id, polyline);
          //endpoint
          const endPoint = trackPoints[trackPoints.length - 1];
          const endMarker = this.mapRef()
            .addEndPointMarker(tracking)
            .addTo(this.mapRef().map!);
          this.endpointMarkers.set(tracking.id, endMarker);
        }

        if (change.type === 'modified') {
          const trackPoints: { latitude: number; longitude: number }[] =
            tracking.tracks.map((track) => ({
              latitude: track.latitude,
              longitude: track.longitude,
            }));
          // polyline
          const polyline = this.polylineMarkers.get(tracking.id);
          polyline.setLatLngs(
            trackPoints.map((coord) =>
              L.latLng(coord.latitude, coord.longitude)
            )
          );
          // endpoint
          const endPoint = trackPoints[trackPoints.length - 1];
          const endMarker = this.endpointMarkers.get(tracking.id);
          endMarker.setLatLng([endPoint.latitude, endPoint.longitude]);
        }

        if (change.type === 'removed') {
          // startpoint
          const startMarker = this.startpointMarkers.get(tracking.id);
          startMarker.removeFrom(this.mapRef().map!);
          this.startpointMarkers.delete(tracking.id);
          // polyline
          const polyline = this.polylineMarkers.get(tracking.id);
          polyline.removeFrom(this.mapRef().map!);
          // endpoint
          this.polylineMarkers.delete(tracking.id);
          const endMarker = this.endpointMarkers.get(tracking.id);
          endMarker.removeFrom(this.mapRef().map!);
          this.endpointMarkers.delete(tracking.id);
        }
      });
    });
  }

  private listenToAlerts() {
    const q = query(
      collection(this.firestore, 'alerts'),
      where('isResolved', '==', false)
    );
    this.alertsUnsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        const alert = {
          ...change.doc.data(),
          id: change.doc.id,
        } as IAlert;

        if (change.type === 'added') {
          const userDoc = await getDoc(doc(this.firestore, 'users', alert.uid));
          const user = { ...userDoc.data(), id: userDoc.id } as IUserAuth;
          const alertMarker = this.mapRef()
            .addAlertMarker(alert, user)
            .addTo(this.mapRef().map!);
          this.alertMarkers.set(alert.id, alertMarker);
        }

        if (change.type === 'removed') {
          const alertMarker = this.alertMarkers.get(alert.id);
          alertMarker.removeFrom(this.mapRef().map!);
          this.alertMarkers.delete(alert.id);
        }
      });
    });
  }

  private async isThereUnresolvedAlerts() {
    const snapshot = await getCountFromServer(
      query(
        collection(this.firestore, 'alerts'),
        where('isResolved', '==', false)
      )
    );
    return snapshot.data().count > 0;
  }
}
