import { GeoPoint, Timestamp } from '@angular/fire/firestore';

export interface ITracking {
  id: string;
  uid: string;
  displayName: string;
  tracks: GeoPoint[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface IAlert {
  id: string;
  uid: string;
  trackingId: string;
  displayName: string;
  geoPoint: GeoPoint;
  isResolved: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface IReport {
  id: string;
  uid: string;
  alertId: string;
  trackingId: string;
  incidentDate: Timestamp;
  location: GeoPoint;
  description: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
