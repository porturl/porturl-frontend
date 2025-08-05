import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>',
})
export class AppComponent {
  // The constructor is now empty.
  // The authentication flow is handled by the APP_INITIALIZER in main.ts
  // before this component is even created.
  constructor() {}
}
