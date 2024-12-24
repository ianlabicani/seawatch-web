import { Component, inject } from '@angular/core';
import { Auth, signOut } from '@angular/fire/auth';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-coast-guard',
  imports: [RouterOutlet],
  templateUrl: './coast-guard.component.html',
  styleUrl: './coast-guard.component.scss',
})
export class CoastGuardComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/welcome']);
  }
}
