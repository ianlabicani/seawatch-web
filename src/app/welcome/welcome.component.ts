import { AfterViewInit, Component, ElementRef } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-welcome',
  imports: [RouterLink],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss',
})
export class WelcomeComponent implements AfterViewInit {
  user = JSON.parse(localStorage.getItem('user') || '{}');
  el!: ElementRef;

  ngAfterViewInit(): void {}
}
