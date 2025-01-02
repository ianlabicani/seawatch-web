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
  addDoc,
  collection,
  doc,
  docData,
  Firestore,
  Timestamp,
  updateDoc,
} from '@angular/fire/firestore';
import { IAlert, IReport, ITracking } from '../../../shared/models';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MapComponent } from '../../../shared/components/map/map.component';
import { map, switchMap } from 'rxjs';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReportsDetailsComponent } from '../../reports/reports-details/reports-details.component';

@Component({
  selector: 'app-alert-details',
  imports: [
    DatePipe,
    MapComponent,
    ReactiveFormsModule,
    ReportsDetailsComponent,
  ],
  templateUrl: './alert-details.component.html',
  styleUrl: './alert-details.component.scss',
})
export class AlertDetailsComponent implements OnInit {
  submitReport() {
    throw new Error('Method not implemented.');
  }
  private fb = inject(FormBuilder);

  private firestore = inject(Firestore);

  router = inject(Router);

  id = input.required<string>();
  alertSig = signal<IAlert | null>(null);
  destroyRef = inject(DestroyRef);
  mapRefSig = viewChild.required<MapComponent>('appMap');
  isCreateReport = signal(false);
  polylineMarkers: Map<string, any> = new Map();
  endpointMarkers: Map<string, any> = new Map();

  formGroup = this.fb.nonNullable.group({
    alertId: ['', Validators.required],
    description: ['', [Validators.required]],
    who: ['', Validators.required],
    what: ['', Validators.required],
    where: ['', Validators.required],
    when: ['', Validators.required],
    how: ['', Validators.required],

    createdAt: [Timestamp.now(), Validators.required],
    updatedAt: [Timestamp.now(), Validators.required],
  });

  isSubmitting = signal(false);

  ngOnInit() {
    this.formGroup.controls.alertId.setValue(this.id());

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
        switchMap((at) => {
          return docData(doc(this.firestore, `reports/${at.reportId}`), {
            idField: 'id',
          }).pipe(
            map((report) => {
              return {
                ...at,
                report: report as IReport,
              };
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((a) => {
        this.alertSig.set(a);
        this.mapRefSig()
          .addAlertMarker(a.geoPoint.latitude, a.geoPoint.longitude)
          .bindPopup(
            `
                Username:<strong> ${a.username}</strong> <br>
                Alert ID: ${a.id} <br>
                Reported At: 
                <strong>
                ${new Date(a.createdAt.seconds * 1000).toLocaleString()}
                </strong> 
                 <br>
                 `
          )

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
      reportId: null,
    });
  }

  async onSubmit() {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const data = this.formGroup.getRawValue();

    try {
      const docRef = await addDoc(collection(this.firestore, 'reports'), {
        ...data,
      });
      await updateDoc(doc(this.firestore, `alerts/${this.id()}`), {
        isResolved: true,
        reportId: docRef.id,
      });
    } catch (error) {
      console.error('Error creating report:', error);
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
