import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pacientes.component.html',
  styleUrl: './pacientes.component.scss'
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
    }
  }
}
async seleccionarPaciente(paciente: any) {
  this.pacienteSeleccionado = paciente;
  this.historiaClinica = await this.supabaseService.getHistoriaClinicaPorPaciente(paciente.id);
}

  }



