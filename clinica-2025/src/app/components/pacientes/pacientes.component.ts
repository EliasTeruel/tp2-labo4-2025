import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';
import { AuthService } from '../../services/auth.service';
import { UltimosTurnosPipe } from '../../pipes/ultimos-turnos.pipe';
import { ResaltarPacientesDirective } from '../../directives/resaltar-pacientes.directive';
import {  trigger,  transition,  style,  animate,  query,  stagger} from '@angular/animations';

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [CommonModule, FormsModule, UltimosTurnosPipe, ResaltarPacientesDirective],
  templateUrl: './pacientes.component.html',
  styleUrl: './pacientes.component.scss',
  animations: [
    trigger('fadeSlideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('900ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('listStagger', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger('100ms', [
            animate('900ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class PacientesComponent  implements OnInit {
historiaClinica: any[] = [];
objectKeys = Object.keys;
  usuario: any = null;
  especialidades: any[] = [];
  pacientesAtendidos: any[] = [];
pacienteSeleccionado: any = null;

  constructor(private supabaseService: SupabaseService, private authService: AuthService) {}

async ngOnInit() {
  const email = this.authService.getCurrentUserEmail();
  if (email) {
    this.usuario = await this.supabaseService.getUsuarioByEmail(email);
    if (this.usuario.rol === 'Especialista') {
      const pacientesIds = await this.supabaseService.getPacientesAtendidosPorEspecialista(this.usuario.id);
      this.pacientesAtendidos = await this.supabaseService.getUsuariosByIds(pacientesIds);
      for (let paciente of this.pacientesAtendidos) {
      paciente.ultimosTurnos = await this.supabaseService.getUltimosTurnosPorPaciente(paciente.id, this.usuario.id);
    }
    }
  }

}
async seleccionarPaciente(paciente: any) {
  this.pacienteSeleccionado = paciente;
  this.historiaClinica = await this.supabaseService.getHistoriaClinicaPorPaciente(paciente.id);
}

  }



