import { Component, DestroyRef, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { Auth } from '@angular/fire/auth';
import { TrackingService } from '../core/services/tracking.service';
import { AlertService } from '../core/services/alert.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-coast-guard',
  imports: [RouterOutlet, SidebarComponent],
  templateUrl: './coast-guard.component.html',
  styleUrl: './coast-guard.component.scss',
})
export class CoastGuardComponent {
  auth = inject(Auth);
  private trackingService = inject(TrackingService);
  private alertService = inject(AlertService);
  destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.trackingService
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
    this.alertService
      .getAll()
      .pipe(
        tap((alerts) => {
          const hasUnresolvedAlert = alerts.some((alert) => !alert.isResolved);
          console.log('hasUnresolvedAlert', hasUnresolvedAlert);

          if (hasUnresolvedAlert) {
            Swal.fire({
              title: 'Alert',
              text: 'There is an unresolved alert.',
              icon: 'warning',
              confirmButtonText: 'Ok',
            });
          }
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }
}
