import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./reports.component').then((m) => m.ReportsComponent),
  },
  {
    path: ':id/create',
    loadComponent: () =>
      import('./reports-create/reports-create.component').then(
        (m) => m.ReportsCreateComponent
      ),
  },
];
