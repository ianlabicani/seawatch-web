import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./users.component').then((m) => m.UsersComponent),
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./users-create/users-create.component').then(
        (m) => m.UsersCreateComponent
      ),
  },
  {
    path: ':id/details',
    loadComponent: () =>
      import('./users-details/users-details.component').then(
        (m) => m.UsersDetailsComponent
      ),
  },
];
