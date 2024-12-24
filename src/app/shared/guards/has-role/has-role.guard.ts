import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const hasRoleGuard = (role: string): CanActivateFn => {
  return () => {
    const user = localStorage.getItem('user');
    const router = inject(Router);

    if (user === null) {
      router.navigate(['/auth/login']);
      return false;
    }

    const userData = JSON.parse(user);

    if (userData.role !== role) {
      console.log(role, userData.role);

      router.navigate(['/welcome']);
      return false;
    }

    return true;
  };
};
