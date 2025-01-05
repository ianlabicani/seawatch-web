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
  Firestore,
  getDoc,
  Timestamp,
  updateDoc,
} from '@angular/fire/firestore';

import { IAlert, IReport, ITracking } from '../../../shared/models';
import { DatePipe, JsonPipe } from '@angular/common';
import { Router } from '@angular/router';
import { MapComponent } from '../../../shared/components/map/map.component';
import { from } from 'rxjs';
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
  reportSig = signal<IReport | null>(null);
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
  isLoading = signal(true);

  ngOnInit() {
    this.formGroup.controls.alertId.setValue(this.id());

    from(this.getAlert(this.id())).subscribe(async (alert) => {
      this.alertSig.set(alert);
      const [report, tracking, user] = await Promise.all([
        this.getReport(alert.reportId ?? undefined),
        this.getTracking(alert.trackingId),
        this.getUser(alert.uid),
      ]);

      this.reportSig.set(report);
      this.trackingSig.set(tracking);
      this.userSig.set(user);

      this.isLoading.set(false);

      // alert point
      this.mapRefSig().addAlertMarker(alert, user).addTo(this.mapRefSig().map);

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
      this.mapRefSig().addEndPointMarker(tracking).addTo(this.mapRefSig().map);
    });
  }

  async getAlert(alertId: string) {
    const alertRef = doc(this.firestore, `alerts/${alertId}`);
    const alertDoc = await getDoc(alertRef);
    return { ...alertDoc.data(), id: alertDoc.id } as IAlert;
  }

  async getReport(reportId?: string) {
    if (!reportId) {
      return null;
    }

    const reportRef = doc(this.firestore, `reports/${reportId}`);
    const reportDoc = await getDoc(reportRef);

    if (!reportDoc.exists()) {
      return null;
    }

    const report = { ...reportDoc.data(), id: reportDoc.id } as IReport;

    return report;
  }

  async getTracking(trackingId: string) {
    const trackingRef = doc(this.firestore, `trackings/${trackingId}`);
    const trackingDoc = await getDoc(trackingRef);
    return { ...trackingDoc.data(), id: trackingDoc.id } as ITracking;
  }

  async getUser(userId: string) {
    const userRef = doc(this.firestore, `users/${userId}`);
    const userDoc = await getDoc(userRef);
    return { ...userDoc.data(), id: userDoc.id } as IUserAuth;
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
      this.isSubmitting.set(false);
      this.isCreateReport.set(false);
      this.reportSig.set({
        ...data,
        id: docRef.id,
      });
    } catch (error) {
      console.error('Error creating report:', error);
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
