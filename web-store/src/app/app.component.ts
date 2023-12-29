import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <router-outlet></router-outlet>
    <app-header></app-header>
  `,
  styles: []
})
export class AppComponent {
  title = 'web-store';
}
