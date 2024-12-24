import { Routes } from '@angular/router';
import { authGuard } from './auth/guards/auth/auth.guard';
import { hasRoleGuard } from './shared/guards/has-role/has-role.guard';

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
    path: 'coast-guard',
    canActivate: [authGuard, hasRoleGuard('coast-guard')],
    loadComponent: () =>
      import('./coast-guard/coast-guard.component').then(
        (m) => m.CoastGuardComponent
      ),
    loadChildren: () =>
      import('./coast-guard/coast-guard.routes').then((m) => m.routes),
  },
];
