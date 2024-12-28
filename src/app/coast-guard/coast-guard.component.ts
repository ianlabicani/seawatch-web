import { Component, DestroyRef, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { Auth } from '@angular/fire/auth';
import { TrackingService } from '../core/services/tracking.service';
import { AlertService } from '../core/services/alert.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReportService } from '../core/services/report.service';
import { UserService } from '../core/services/user.service';

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
  private reportService = inject(ReportService);
  private userService = inject(UserService);
  destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.trackingService
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
    this.alertService
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }
}
