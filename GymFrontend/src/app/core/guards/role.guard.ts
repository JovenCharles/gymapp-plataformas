import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AppRole, MockAuthService } from '../services/mock-auth.service';

export const roleGuard = (allowedRoles: AppRole[]): CanActivateFn => {
  return () => {
    const auth = inject(MockAuthService);
    const router = inject(Router);

    if (!auth.isLoggedIn()) {
      return router.createUrlTree(['/login']);
    }

    if (auth.canAccess(allowedRoles)) {
      return true;
    }

    return router.createUrlTree([auth.activeProfile().landingRoute]);
  };
};
