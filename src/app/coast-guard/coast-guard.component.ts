import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';

@Component({
  selector: 'app-coast-guard',
  imports: [RouterOutlet, SidebarComponent],
  templateUrl: './coast-guard.component.html',
  styleUrl: './coast-guard.component.scss',
})
export class CoastGuardComponent {}
