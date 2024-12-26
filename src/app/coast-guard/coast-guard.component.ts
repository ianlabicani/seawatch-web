import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-coast-guard',
  imports: [RouterOutlet, SidebarComponent],
  templateUrl: './coast-guard.component.html',
  styleUrl: './coast-guard.component.scss',
})
export class CoastGuardComponent {
  auth = inject(Auth);
}
