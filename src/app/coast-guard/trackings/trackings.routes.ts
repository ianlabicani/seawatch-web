import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./trackings.component').then((m) => m.TrackingsComponent),
  },
  {
    path: ':id/details',
    loadComponent: () =>
      import('./trackings-details/trackings-details.component').then(
        (m) => m.TrackingsDetailsComponent
      ),
  },
];
