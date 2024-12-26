import { inject, WritableSignal } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, IUserStorage } from '../auth.service';
import { filter, map } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';

export const unauthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return toObservable(authService.userAuthSig).pipe(
    filter((user) => user !== undefined),
    map((user) => {
      if (user) {
        router.navigate(['/']);
        return false;
      }
      return true;
    })
  );
};
