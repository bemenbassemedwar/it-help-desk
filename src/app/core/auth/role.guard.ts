import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Role } from '../../models/enums';
import { AuthStore } from './auth.store';

export function getRoleHomePath(role: Role): string {
  switch (role) {
    case 'MANAGER':
      return '/manager';
    case 'ENGINEER':
      return '/engineer';
    case 'EMPLOYEE':
      return '/employee';
  }
}

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthStore);
  const router = inject(Router);

  if (auth.isLoggedIn()) {
    return true;
  }
  return router.createUrlTree(['/login']);
};

export function roleGuard(allowedRoles: Role[]): CanActivateFn {
  return () => {
    const auth = inject(AuthStore);
    const router = inject(Router);

    const role = auth.userRole();
    if (role && allowedRoles.includes(role)) {
      return true;
    }

    if (role) {
      return router.createUrlTree([getRoleHomePath(role)]);
    }
    return router.createUrlTree(['/login']);
  };
}
