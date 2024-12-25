import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./users.component').then((m) => m.UsersComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./users-details/users-details.component').then(
        (m) => m.UsersDetailsComponent
      ),
  },
];
