import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes } from '@angular/router';
import { authGuard, roleGuard, getRoleHomePath } from './core/auth/role.guard';
import { AuthStore } from './core/auth/auth.store';
import { ShellComponent } from './layout/shell/shell.component';

const roleRedirectGuard: CanActivateFn = () => {
  const auth = inject(AuthStore);
  const router = inject(Router);
  const role = auth.userRole();
  if (role) {
    return router.createUrlTree([getRoleHomePath(role)]);
  }
  return router.createUrlTree(['/login']);
};

export const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES),
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'employee',
        canActivate: [roleGuard(['EMPLOYEE'])],
        loadChildren: () => import('./features/employee/employee.routes').then(m => m.EMPLOYEE_ROUTES),
      },
      {
        path: 'engineer',
        canActivate: [roleGuard(['ENGINEER'])],
        loadChildren: () => import('./features/engineer/engineer.routes').then(m => m.ENGINEER_ROUTES),
      },
      {
        path: 'manager',
        canActivate: [roleGuard(['MANAGER'])],
        loadChildren: () => import('./features/manager/manager.routes').then(m => m.MANAGER_ROUTES),
      },
      {
        path: 'tickets/:id',
        loadComponent: () =>
          import('./features/tickets/ticket-detail/ticket-detail.page').then(m => m.TicketDetailPage),
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./features/notifications/notifications.page').then(m => m.NotificationsPage),
      },
      {
        path: '',
        pathMatch: 'full',
        canActivate: [roleRedirectGuard],
        children: [],
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
