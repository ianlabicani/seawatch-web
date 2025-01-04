import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import '@maptiler/sdk/dist/maptiler-sdk.css';
// @ts-ignore
import { MaptilerLayer } from '@maptiler/leaflet-maptilersdk';
import L from 'leaflet';
import { aparriMockBoundaries } from './aparri-mock-boundaries';
import { NgClass } from '@angular/common';
import { IAlert, ITracking } from '../../models';
import { IUserAuth } from '../../../auth/auth.service';

@Component({
  selector: 'app-map',
  imports: [NgClass],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  ngAfterViewInit(): void {
    this.initializeMap();
  }
  @ViewChild('map', { static: true }) mapRef!: ElementRef;
  mtLayer?: MaptilerLayer;
  osmLayer?: L.TileLayer; // To store OpenStreetMap layer
  isMapTilerActive = signal(false);
  center: L.LatLngExpression = [18.385435, 121.641164]; // Default center
  @Input() zoom: number = 12; // Default zoom
  map!: L.Map;
  mapStyles: { name: string; url: string }[] = [
    {
      name: 'satellite',
      url: 'https://cloud.maptiler.com/static/img/maps/satellite.png?t=1713275643',
    },
    {
      name: 'ocean',
      url: 'https://cloud.maptiler.com/static/img/maps/ocean.png?t=1713275643',
    },
    {
      name: 'streets',
      url: 'https://cloud.maptiler.com/static/img/maps/streets-v2.png?t=1713275643',
    },
    {
      name: 'basic',
      url: 'https://cloud.maptiler.com/static/img/maps/basic-v2.png?t=1713275643',
    },
    {
      name: 'landscape',
      url: 'https://cloud.maptiler.com/static/img/maps/landscape.png?t=1713275643',
    },
    {
      name: 'openstreetmap',
      url: 'https://cloud.maptiler.com/static/img/maps/openstreetmap.png?t=1713275643',
    },
    {
      name: 'outdoor',
      url: 'https://cloud.maptiler.com/static/img/maps/outdoor-v2.png?t=1713275643',
    },
    {
      name: 'topo',
      url: 'https://cloud.maptiler.com/static/img/maps/topo-v2.png?t=1713275643',
    },
    {
      name: 'winter',
      url: 'https://cloud.maptiler.com/static/img/maps/winter-v2.png?t=1713275643',
    },
  ];
  currentMapStyle: { name: string; url: string } | null = null;

  ngOnInit(): void {}

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  initializeMap(): void {
    this.map = L.map(this.mapRef.nativeElement, {
      center: this.center,
      zoom: this.zoom,
      zoomControl: false,
    });

    this.useLeafletLayer();

    this.addGeofencingPolygon();

    setTimeout(() => {
      this.map.invalidateSize();
    }, 0);
  }

  useLeafletLayer(): void {
    // Remove MapTiler layer if it's active
    if (this.mtLayer && this.map.hasLayer(this.mtLayer)) {
      this.map.removeLayer(this.mtLayer);
    }
    this.isMapTilerActive.set(false);

    // Add OpenStreetMap layer
    this.osmLayer = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }
    ).addTo(this.map);
  }

  addGeofencingPolygon(): void {
    L.geoJSON()
      .addData(aparriMockBoundaries as any)
      .setStyle({
        color: 'red',
        weight: 3,
        opacity: 0.7,
        fillColor: 'orange',
        fillOpacity: 0.2,
      })
      .addTo(this.map);
  }

  addEndPointMarker(tracking: ITracking) {
    const endPoint = tracking.tracks[tracking.tracks.length - 1];
    const startPoint = tracking.tracks[0];
    return L.marker([endPoint.latitude, endPoint.longitude], {
      icon: L.icon({
        iconUrl: 'icons/sailing-boat-pin.png',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [-1, -35],
      }),
    }).bindPopup(
      `<div class="container">
  <div class="card">
    <div class="card-header">
      <h4>Tracking End Point</h4>
    </div>
    <div class="card-body">
      <p><strong>Username:</strong> <span>${tracking.username}</span></p>
      <p><strong>Tracking ID:</strong> <span>${tracking.id}</span></p>
            <p><strong>Tracks Count:</strong> <span>${
              tracking.tracks.length
            }</span></p>
      <p><strong>Start Location:</strong> 
        <span>${startPoint.latitude}, ${startPoint.longitude}</span>
      </p>

      <p><strong>Start Date:</strong> <span>${new Date(
        tracking.createdAt.seconds * 1000
      ).toLocaleString()}</span></p>
      <p><strong>End Date:</strong> 
        <span>
          ${
            tracking.updatedAt
              ? new Date(tracking.updatedAt.seconds * 1000).toLocaleString()
              : 'Ongoing'
          }
        </span>
      </p>
    </div>
  </div>
</div>
`
    );
  }

  addStartPointMarker(tracking: ITracking) {
    const startPoint = tracking.tracks[0];

    return L.marker([startPoint.latitude, startPoint.longitude], {
      icon: L.icon({
        iconUrl: 'icons/start-point.png',
        iconSize: [40, 40],
        iconAnchor: [23, 43],
        popupAnchor: [-1, -35],
      }),
    }).bindPopup(
      `
  <div class="container">
    <div class="card">
      <div class="card-header">
        <h4>Tracking Starting Point</h4>
      </div>
      <div class="card-body">
        <p><strong>Username:</strong> ${tracking.username}</p>
        <p><strong>Adventure ID:</strong> ${tracking.id}</p>
        <p><strong>Tracks Count:</strong> ${tracking.tracks.length}</p>
        <p><strong>Start Location:</strong> ${startPoint.latitude}, ${
        startPoint.longitude
      }</p>
        <p><strong>Start Date:</strong> ${new Date(
          tracking.createdAt.seconds * 1000
        ).toLocaleString()}</p>
        <p><strong>End Date:</strong> ${
          tracking.updatedAt
            ? new Date(tracking.updatedAt.seconds * 1000).toLocaleString()
            : 'Ongoing'
        }</p>
      </div>
    </div>
  </div>
`
    );
  }

  addAlertMarker(alert: IAlert, user: IUserAuth) {
    const latitude = alert.geoPoint.latitude;
    const longitude = alert.geoPoint.longitude;

    return L.marker([latitude, longitude], {
      icon: L.icon({
        iconUrl: 'icons/alert-icon-gps.png',
        iconSize: [45, 45],
        iconAnchor: [20, 40],
        popupAnchor: [-1, -35],
      }),
    }).bindPopup(
      `
        <div class="card">
        <div class="card-header text-center bg-primary text-white">
          <h5 class="card-title mb-0">Alert Details</h5>
        </div>
        <div class="card-body">
          <p class="card-text">
            <strong>Alert ID:</strong> ${alert.id}<br>
            <strong>Username:</strong> ${user.username}<br>
            <strong>User Contact:</strong> ${user.phoneNumber}<br>
            <strong>Location:</strong> ${latitude}, ${longitude}<br>
            <strong>Reported At:</strong> 
            <span class="text-primary">
              ${new Date(alert.createdAt.seconds * 1000).toLocaleString()}
            </span>
          </p>
        </div>
      </div>
      `
    );
  }

  addPolyLine(
    tracks: { latitude: number; longitude: number }[],
    options?: L.PolylineOptions
  ) {
    return L.polyline(
      tracks.map((t) => [t.latitude, t.longitude]),
      options
    );
  }

  onChangeMapStyle(i: number, isLeaflet: boolean = false) {
    if (this.osmLayer && this.map.hasLayer(this.osmLayer)) {
      this.map.removeLayer(this.osmLayer);
    }

    if (this.mtLayer && this.map.hasLayer(this.mtLayer)) {
      this.map.removeLayer(this.mtLayer);
      this.currentMapStyle = null;
    }
    if (isLeaflet) {
      this.isMapTilerActive.set(false);
      this.osmLayer = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }
      ).addTo(this.map);
      return;
    }

    if (this.currentMapStyle === this.mapStyles[i]) {
      return;
    }

    this.isMapTilerActive.set(true);
    this.mtLayer = new MaptilerLayer({
      apiKey: 'bZpmItn2cuWjeIdpgbH5',
      style: this.currentMapStyle?.name,
    }).addTo(this.map);

    this.currentMapStyle = this.mapStyles[i];
    this.mtLayer.setStyle(this.currentMapStyle.name);
  }

  getPolylineColor(adventureId: string): string {
    // Use a hash function to generate a unique color based on the ID
    const colors = [
      '#FF5733', // Red
      '#33FF57', // Green
      '#3357FF', // Blue
      '#F1C40F', // Yellow
      '#8E44AD', // Purple
      '#16A085', // Teal
      '#E74C3C', // Coral
    ];

    // Generate a unique index based on the adventure ID
    const index = this.hashCode(adventureId) % colors.length;

    return colors[index];
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32-bit integer
    }
    return Math.abs(hash); // Return positive hash
  }
}
