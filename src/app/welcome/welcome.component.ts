import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { MapComponent } from '../shared/components/map/map.component';

@Component({
  selector: 'app-welcome',
  imports: [RouterLink, MapComponent],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss',
})
export class WelcomeComponent {
  authService = inject(AuthService);
}
