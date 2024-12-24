import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'auth',
    loadComponent: () =>
      import('./auth/auth.component').then((m) => m.AuthComponent),
    loadChildren: () => import('./auth/auth.routes').then((m) => m.routes),
  },
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full',
  },
];
