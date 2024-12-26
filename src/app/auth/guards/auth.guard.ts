import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return toObservable(authService.userAuthSig).pipe(
    filter((user) => user !== undefined),
    map((user) => {
      if (!user) {
        router.navigate(['/auth/login']);
        return false;
      }
      return true;
    })
  );
};
