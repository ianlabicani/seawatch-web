import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService, IUserStorage } from '../auth/auth.service';

@Component({
  selector: 'app-welcome',
  imports: [RouterLink],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss',
})
export class WelcomeComponent {
  authService = inject(AuthService);
}
