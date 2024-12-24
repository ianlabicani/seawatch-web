import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'welcome',
    pathMatch: 'full',
  },
  {
    path: 'welcome',
    loadComponent: () =>
      import('./welcome/welcome.component').then((m) => m.WelcomeComponent),
  },
  {
    path: 'auth',
    loadComponent: () =>
      import('./auth/auth.component').then((m) => m.AuthComponent),
    loadChildren: () => import('./auth/auth.routes').then((m) => m.routes),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./coast-guard/coast-guard.component').then(
        (m) => m.CoastGuardComponent
      ),
  },
];
