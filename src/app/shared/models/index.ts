import { GeoPoint, Timestamp } from '@angular/fire/firestore';

export interface ITracking {
  id: string;
  uid: string;
  displayName: string;
  tracks: GeoPoint[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
