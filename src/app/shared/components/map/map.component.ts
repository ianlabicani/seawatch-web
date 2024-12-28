import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  viewChild,
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
  currentMapStyle = this.mapStyles[0];

  ngOnInit(): void {
    this.initializeMap();
  }

  initializeMap(): void {
    this.map = L.map(this.mapRef.nativeElement, {
      center: this.center,
      zoom: this.zoom,
      zoomControl: false,
    });

    this.mtLayer = new MaptilerLayer({
      apiKey: 'bZpmItn2cuWjeIdpgbH5',
      style: this.currentMapStyle.name,
    }).addTo(this.map);
    this.addGeofencingPolygon();

    setTimeout(() => {
      this.map.invalidateSize();
    }, 0);
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
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

  onChangeMapStyle(i: number) {
    if (this.currentMapStyle === this.mapStyles[i]) {
      return;
    }

    this.currentMapStyle = this.mapStyles[i];
    this.mtLayer.setStyle(this.currentMapStyle.name);
  }
}
