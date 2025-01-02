import {
  Component,
  ElementRef,
  Input,
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

@Component({
  selector: 'app-map',
  imports: [NgClass],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
})
export class MapComponent implements OnInit {
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

  ngOnInit(): void {
    this.initializeMap();
  }

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

  useMaptilerLayer(): void {
    // Remove OpenStreetMap layer if it's active
    if (this.osmLayer && this.map.hasLayer(this.osmLayer)) {
      this.map.removeLayer(this.osmLayer);
    }
    this.isMapTilerActive.set(true);

    // Add MapTiler layer
    this.mtLayer = new MaptilerLayer({
      apiKey: 'bZpmItn2cuWjeIdpgbH5',
    }).addTo(this.map);
  }

  //TODO: add start point markers

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

  addEndPointMarker(latitude: number, longitude: number) {
    return L.marker([latitude, longitude], {
      icon: L.icon({
        iconUrl: 'icons/sailing-boat-pin.png',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [-1, -35],
      }),
    });
  }

  addAlertMarker(latitude: number, longitude: number) {
    return L.marker([latitude, longitude], {
      icon: L.icon({
        iconUrl: 'icons/alert-icon-gps.png',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [-1, -35],
      }),
    });
  }

  addPolyLine(tracks: { latitude: number; longitude: number }[]) {
    return L.polyline(tracks.map((t) => [t.latitude, t.longitude]));
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
}
