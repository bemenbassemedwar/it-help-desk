import { Routes } from '@angular/router';

export const ENGINEER_ROUTES: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/engineer-dashboard.page').then(m => m.EngineerDashboardPage),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
];
