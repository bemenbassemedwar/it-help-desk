import { Routes } from '@angular/router';

export const EMPLOYEE_ROUTES: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/employee-dashboard.page').then(m => m.EmployeeDashboardPage),
  },
  {
    path: 'new-ticket',
    loadComponent: () =>
      import('./new-ticket/new-ticket.page').then(m => m.NewTicketPage),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
];
