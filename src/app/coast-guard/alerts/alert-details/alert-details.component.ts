import {
  Component,
  DestroyRef,
  inject,
  input,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import {
  collection,
  collectionData,
  doc,
  docData,
  Firestore,
  getDoc,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { IAlert, ITracking } from '../../../shared/models';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MapComponent } from '../../../shared/components/map/map.component';
import { map, switchMap } from 'rxjs';
import { ReportsCreateComponent } from '../../reports/reports-create/reports-create.component';
import { AlertsReportFormComponent } from '../shared/alerts-report-form/alerts-report-form.component';

@Component({
  selector: 'app-alert-details',
  imports: [DatePipe, RouterLink, MapComponent, AlertsReportFormComponent],
  templateUrl: './alert-details.component.html',
  styleUrl: './alert-details.component.scss',
})
export class AlertDetailsComponent implements OnInit {
  submitReport() {
    throw new Error('Method not implemented.');
  }
  private firestore = inject(Firestore);

  id = input.required<string>();
  alertSig = signal<IAlert | null>(null);
  destroyRef = inject(DestroyRef);
  mapRefSig = viewChild.required<MapComponent>('appMap');
  isCreateReport = signal(false);
  polylineMarkers: Map<string, any> = new Map();
  endpointMarkers: Map<string, any> = new Map();

  ngOnInit() {
    docData(doc(this.firestore, `alerts/${this.id()}`), { idField: 'id' })
      .pipe(
        map((a) => a as IAlert),
        switchMap((a) =>
          docData(doc(this.firestore, `trackings/${a.trackingId}`), {
            idField: 'id',
          }).pipe(
            map((tracking) => ({
              ...a,
              tracking: tracking as ITracking,
            }))
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((a) => {
        console.log(a);

        this.alertSig.set(a);
        this.mapRefSig()
          .addAlertMarker(a.geoPoint.latitude, a.geoPoint.longitude)
          .addTo(this.mapRefSig().map);
        // add tracks
        const trackPoints: { latitude: number; longitude: number }[] =
          a.tracking.tracks.map((track: any) => ({
            latitude: track.latitude,
            longitude: track.longitude,
          }));
        const polyline = this.mapRefSig()
          .addPolyLine(trackPoints)
          .addTo(this.mapRefSig().map);
        this.polylineMarkers.set(a.tracking.id, polyline);
        const endPoint = trackPoints[trackPoints.length - 1];
        const endMarker = this.mapRefSig()
          .addEndPointMarker(endPoint.latitude, endPoint.longitude)
          .bindPopup(
            `
                Username:<strong> ${a.tracking.username}</strong> <br>
                Adventure ID: ${a.tracking.id} <br>
                Start Date: ${new Date(
                  a.tracking.createdAt.seconds * 1000
                ).toLocaleString()} <br>
                End Date: ${
                  a.tracking.updatedAt
                    ? new Date(
                        a.tracking.updatedAt.seconds * 1000
                      ).toLocaleString()
                    : 'Ongoing'
                } <br>
                Tracks Count: ${a.tracking.tracks.length} <br>
                Current Location: ${endPoint.latitude}, ${endPoint.longitude}
              `
          )
          .addTo(this.mapRefSig().map!);

        this.endpointMarkers.set(a.tracking.id, endMarker);
      });
  }

  async resolveAlert() {
    await updateDoc(doc(this.firestore, `alerts/${this.id()}`), {
      isResolved: true,
    });
  }
}
