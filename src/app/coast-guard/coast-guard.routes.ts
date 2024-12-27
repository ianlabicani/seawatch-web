import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
  },
  {
    path: 'trackings',
    loadComponent: () =>
      import('./trackings/trackings.component').then(
        (m) => m.TrackingsComponent
      ),
  },
  {
    path: 'users',
    loadChildren: () => import('./users/users.routes').then((m) => m.routes),
  },
  {
    path: 'alerts',
    loadChildren: () => import('./alerts/alerts.routes').then((m) => m.routes),
  },
  {
    path: 'reports',
    loadChildren: () =>
      import('./reports/reports.routes').then((m) => m.routes),
  },
];
