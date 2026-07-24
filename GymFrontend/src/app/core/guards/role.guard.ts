import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AppRole } from '../models/user.model';
import { AuthService } from '../services/auth.service';

export const roleGuard = (allowedRoles: AppRole[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
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
