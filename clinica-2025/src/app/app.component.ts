import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavComponent } from "./components/nav/nav.component";

@Component({
  selector: 'app-root',
  standalone: true,
      imports: [CommonModule, RouterOutlet, NavComponent],

  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',

 })
// export class AppComponent {
//   getRouteAnimationData(outlet: RouterOutlet) {
//     return outlet?.activatedRouteData?.['animation'];
//   }
// }
export class AppComponent {
  title = 'clinica-2025';
  getRouteAnimationData(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }
  
}
