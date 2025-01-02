import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { NgClass } from '@angular/common';
import { AlertService } from '../../core/services/alert.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, NgClass],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  private authService = inject(AuthService);
  alertService = inject(AlertService);
  router = inject(Router);

  alertCount = toSignal(this.alertService.getUnresolvedCount());

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/']);
  }
}
