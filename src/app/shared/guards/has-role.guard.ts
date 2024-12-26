import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';

export const hasRoleGuard = (role: string): CanActivateFn => {
  return () => {
    const router = inject(Router);
    const authService = inject(AuthService);

    return toObservable(authService.userAuthSig).pipe(
      filter((user) => user !== undefined),
      map((user) => {
        if (!user) {
          router.navigate(['/login']);
          return false;
        }

        if (user.role !== role) {
          console.log('here');

          router.navigate(['/']);
          return false;
        }

        return true;
      })
    );
  };
};
