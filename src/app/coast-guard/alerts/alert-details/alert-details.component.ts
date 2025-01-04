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
  collectionData,
  doc,
  docData,
  Firestore,
  getDoc,
  query,
  Timestamp,
  updateDoc,
  where,
} from '@angular/fire/firestore';

import { IAlert, IReport, ITracking } from '../../../shared/models';
import { DatePipe, JsonPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MapComponent } from '../../../shared/components/map/map.component';
import { combineLatest, from, map, switchMap } from 'rxjs';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReportsDetailsComponent } from '../../reports/reports-details/reports-details.component';
import { IUserAuth } from '../../../auth/auth.service';

@Component({
  selector: 'app-alert-details',
  imports: [
    DatePipe,
    MapComponent,
    ReactiveFormsModule,
    ReportsDetailsComponent,
    JsonPipe,
  ],
  templateUrl: './alert-details.component.html',
  styleUrl: './alert-details.component.scss',
})
export class AlertDetailsComponent implements OnInit {
  private fb = inject(FormBuilder);

  private firestore = inject(Firestore);

  router = inject(Router);

  id = input.required<string>();
  alertSig = signal<IAlert | null>(null);
  trackingSig = signal<ITracking | null>(null);
  userSig = signal<IUserAuth | null>(null);
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

  async getAlertWithUserAndTracking(alertId: string) {
    // Reference for alert
    const alertRef = doc(this.firestore, `alerts/${alertId}`);
    const alertDoc = await getDoc(alertRef);
    const alert = { ...alertDoc.data(), id: alertDoc.id } as IAlert;

    // Fetch tracking and user data concurrently
    const [trackingDoc, userDoc] = await Promise.all([
      getDoc(doc(this.firestore, `trackings/${alert.trackingId}`)), // Fetch tracking
      getDoc(doc(this.firestore, `users/${alert.uid}`)), // Fetch user directly
    ]);

    // Extract data
    const tracking = { ...trackingDoc.data(), id: trackingDoc.id } as ITracking;
    const user = { ...userDoc.data(), id: userDoc.id } as IUserAuth;

    return Promise.resolve({ alert, tracking, user });
  }

  ngOnInit() {
    this.formGroup.controls.alertId.setValue(this.id());

    from(this.getAlertWithUserAndTracking(this.id())).subscribe(
      ({ alert, tracking, user }) => {
        this.alertSig.set(alert);
        this.trackingSig.set(tracking);
        this.userSig.set(user);

        const alertPoint = alert.geoPoint;
        const startPoint = tracking.tracks[0];

        // alert point
        this.mapRefSig()
          .addAlertMarker(alert, user)
          .addTo(this.mapRefSig().map);

        // startpoint
        this.mapRefSig()
          .addStartPointMarker(tracking)
          .addTo(this.mapRefSig().map);

        // polyline
        const trackPoints: { latitude: number; longitude: number }[] =
          tracking.tracks.map((track) => ({
            latitude: track.latitude,
            longitude: track.longitude,
          }));
        this.mapRefSig()
          .addPolyLine(trackPoints, {
            color: 'red',
            weight: 3,
            opacity: 0.7,
            lineJoin: 'round',
          })
          .addTo(this.mapRefSig().map);

        // endpoint
        const endPoint = tracking.tracks[tracking.tracks.length - 1];
        this.mapRefSig()
          .addEndPointMarker(tracking)
          .addTo(this.mapRefSig().map);
      }
    );
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
