import { Component } from '@angular/core';
import { SidebarComponent } from './sidebar/sidebar.component';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-user',
  imports: [SidebarComponent, RouterOutlet],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss',
})
export class UserComponent {}
