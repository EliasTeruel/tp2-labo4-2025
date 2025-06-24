import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavComponent } from "./components/nav/nav.component";
import { trigger, transition, style, animate, query, group } from '@angular/animations';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
@Component({
  selector: 'app-root',
  standalone: true,
      imports: [CommonModule, RouterOutlet, NavComponent],

  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',

  animations: [

transition('* <=> *', [
        query(':enter', [
          style({ opacity: 0 }),
          animate('500ms ease-out', style({ opacity: 1 }))
        ], { optional: true })
      ])
    

//   trigger('routeAnimations', [
//     // Fade entre Home y AdminPanel
//     transition('HomePage <=> AdminPanel', [
//       style({ position: 'relative' }),
//       query(':enter, :leave', [
//         style({
//           position: 'absolute',
//           width: '100%',
//           left: 0,
//           top: 0
//         })
//       ], { optional: true }),
//       group([
//         query(':enter', [
//           style({ opacity: 0 }),
//           animate('3000ms ease-in', style({ opacity: 1 }))
//         ], { optional: true }),
//         query(':leave', [
//           animate('3000ms ease-out', style({ opacity: 0 }))
//         ], { optional: true }),
//       ])
//     ]),

//     // Slide para Register
//     transition('* <=> Register', [
//       style({ position: 'relative' }),
//       query(':enter, :leave', [
//         style({
//           position: 'absolute',
//           width: '100%',
//           height: '100vh',
//           left: 0,
//           top: 0
//         })
//       ], { optional: true }),
//       group([
//         query(':enter', [
//           style({ left: '100%' }),
//           animate('3000ms ease-out', style({ left: '0%' }))
//         ], { optional: true }),
//         query(':leave', [
//           animate('3000ms ease-out', style({ left: '-100%' }))
//         ], { optional: true }),
//       ])
//     ]),

//     // Zoom para Login
//     transition('* <=> Login', [
//       query(':enter, :leave', [
//         style({
//           position: 'absolute',
//           width: '100%',
//           top: 0,
//           left: 0
//         })
//       ], { optional: true }),
//       group([
//         query(':enter', [
//           style({ transform: 'scale(0.8)', opacity: 0 }),
//           animate('3000ms ease-out', style({ transform: 'scale(1)', opacity: 1 }))
//         ], { optional: true }),
//         query(':leave', [
//           animate('300ms ease-in', style({ transform: 'scale(1.1)', opacity: 0 }))
//         ], { optional: true }),
//       ])
//     ]),

//     // Slide derecha para MiPerfil
//     transition('* <=> Perfil', [
//       query(':enter, :leave', [
//         style({
//           position: 'absolute',
//           width: '100%',
//           top: 0
//         })
//       ], { optional: true }),
//       group([
//         query(':enter', [
//           style({ transform: 'translateX(-100%)' }),
//           animate('3000ms ease-out', style({ transform: 'translateX(0)' }))
//         ], { optional: true }),
//         query(':leave', [
//           animate('3000ms ease-in', style({ transform: 'translateX(100%)' }))
//         ], { optional: true }),
//       ])
//     ]),

//     // Rotate para Turnos
//     transition('* <=> Turnos', [
//       query(':enter, :leave', [
//         style({
//           position: 'absolute',
//           width: '100%',
//           top: 0,
//           left: 0
//         })
//       ], { optional: true }),
//       group([
//         query(':enter', [
//           style({ transform: 'rotateY(90deg)', opacity: 0 }),
//           animate('500ms ease-out', style({ transform: 'rotateY(0)', opacity: 1 }))
//         ], { optional: true }),
//         query(':leave', [
//           animate('500ms ease-in', style({ transform: 'rotateY(-90deg)', opacity: 0 }))
//         ], { optional: true }),
//       ])
//     ]),

//     // Scale para TurnosAdmin
//     transition('* <=> TurnosAdmin', [
//       query(':enter, :leave', [
//         style({
//           position: 'absolute',
//           width: '100%',
//           top: 0,
//           left: 0
//         })
//       ], { optional: true }),
//       group([
//         query(':enter', [
//           style({ transform: 'scale(0)' }),
//           animate('500ms ease-out', style({ transform: 'scale(1)' }))
//         ], { optional: true }),
//         query(':leave', [
//           animate('500ms ease-in', style({ transform: 'scale(0)' }))
//         ], { optional: true }),
//       ])
//     ]),
//   ]),
//   transition('* <=> Usuarios', [
//   query(':enter, :leave', [
//     style({
//       position: 'absolute',
//       width: '100%',
//       top: 0,
//       left: 0,
//       backfaceVisibility: 'hidden'
//     })
//   ], { optional: true }),
//   group([
//     query(':enter', [
//       style({ transform: 'rotateY(-180deg)', opacity: 0 }),
//       animate('600ms ease-out', style({ transform: 'rotateY(0deg)', opacity: 1 }))
//     ], { optional: true }),
//     query(':leave', [
//       animate('600ms ease-in', style({ transform: 'rotateY(180deg)', opacity: 0 }))
//     ], { optional: true })
//   ])
// ]),

// // Blur para MisTurnosPaciente
// transition('* <=> MisTurnosPaciente', [
//   query(':enter, :leave', [
//     style({
//       position: 'absolute',
//       width: '100%',
//       top: 0,
//       left: 0
//     })
//   ], { optional: true }),
//   group([
//     query(':enter', [
//       style({ filter: 'blur(10px)', opacity: 0 }),
//       animate('3000ms ease-out', style({ filter: 'blur(0)', opacity: 1 }))
//     ], { optional: true }),
//     query(':leave', [
//       animate('3000ms ease-in', style({ filter: 'blur(10px)', opacity: 0 }))
//     ], { optional: true })
//   ])
// ]),

// // Slide up para MisTurnosEspecialista
// transition('* <=> MisTurnosEspecialista', [
//   query(':enter, :leave', [
//     style({
//       position: 'absolute',
//       width: '100%',
//       top: 0,
//       left: 0
//     })
//   ], { optional: true }),
//   group([
//     query(':enter', [
//       style({ transform: 'translateY(100%)', opacity: 0 }),
//       animate('3000ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
//     ], { optional: true }),
//     query(':leave', [
//       animate('3000ms ease-in', style({ transform: 'translateY(-100%)', opacity: 0 }))
//     ], { optional: true })
//   ])
// ]),

// // Fade + Scale para Pacientes
// transition('* <=> pacientes', [
//   query(':enter, :leave', [
//     style({
//       position: 'absolute',
//       width: '100%',
//       top: 0,
//       left: 0
//     })
//   ], { optional: true }),
//   group([
//     query(':enter', [
//       style({ transform: 'scale(0.5)', opacity: 0 }),
//       animate('3000ms ease-out', style({ transform: 'scale(1)', opacity: 1 }))
//     ], { optional: true }),
//     query(':leave', [
//       animate('3000ms ease-in', style({ transform: 'scale(1.2)', opacity: 0 }))
//     ], { optional: true })
//   ])
// ])
]


})
export class AppComponent {
  getRouteAnimationData(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.['animation'];
  }
}
// export class AppComponent {
//   title = 'clinica-2025';
//   getRouteAnimationData(outlet: RouterOutlet) {
//     return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
//   }
// }
