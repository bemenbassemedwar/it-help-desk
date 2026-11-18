import { Routes } from '@angular/router';

export const MANAGER_ROUTES: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/manager-dashboard.page').then(m => m.ManagerDashboardPage),
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./users/user-management.page').then(m => m.UserManagementPage),
  },
  {
    path: 'departments',
    loadComponent: () =>
      import('./departments/department-management.page').then(m => m.DepartmentManagementPage),
  },
  {
    path: 'categories',
    loadComponent: () =>
      import('./categories/category-management.page').then(m => m.CategoryManagementPage),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./settings/settings.page').then(m => m.SettingsPage),
  },
  {
    path: 'reports',
    loadComponent: () =>
      import('./reports/reports.page').then(m => m.ReportsPage),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
];
