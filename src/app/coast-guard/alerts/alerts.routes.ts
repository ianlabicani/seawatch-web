import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./alerts.component').then((m) => m.AlertsComponent),
  },
  {
    path: ':id/details',
    loadComponent: () =>
      import('./alert-details/alert-details.component').then(
        (m) => m.AlertDetailsComponent
      ),
  },
];
