import { GeoPoint, Timestamp } from '@angular/fire/firestore';

export interface ITracking {
  id: string;
  uid: string;
  username: string;
  tracks: GeoPoint[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface IAlert {
  id: string;
  uid: string;
  trackingId: string;
  reportId: string | null;
  username: string;
  geoPoint: GeoPoint;
  report: IReport | null;
  isResolved: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface IReport {
  id: string;
  alertId: string;
  description: string;
  who: string;
  what: string;
  where: string;
  when: string;
  how: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
