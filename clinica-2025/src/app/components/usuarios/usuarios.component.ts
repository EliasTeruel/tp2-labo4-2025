import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ResaltarHistoriaDirective } from '../../directives/resaltar-historia.directive';
@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, ResaltarHistoriaDirective],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.scss'
})
export class UsuariosComponent implements OnInit {
  usuarios: any[] = [];
  especialistas: any[] = [];
  pacientes: any[] = [];
  historiaClinica: any[] = [];
  especialistaSeleccionado: any = null;
  pacienteSeleccionado: any = null;
  objectKeys = Object.keys;

  constructor(private supabaseService: SupabaseService, private authService: AuthService) {}

  async ngOnInit() {
    this.usuarios = await this.supabaseService.getUsuarios();
    this.especialistas = this.usuarios.filter(u => u.rol === 'Especialista');
    this.pacientes = this.usuarios.filter(u => u.rol === 'Paciente');
  }

  async seleccionarEspecialista(esp: any) {
    this.especialistaSeleccionado = esp;
    this.pacienteSeleccionado = null;
    const pacientesIds = await this.supabaseService.getPacientesAtendidosPorEspecialista(esp.id);
    this.pacientes = await this.supabaseService.getUsuariosByIds(pacientesIds);
    this.historiaClinica = [];
  }

  async seleccionarPaciente(paciente: any) {
    this.pacienteSeleccionado = paciente;
    this.historiaClinica = await this.supabaseService.getHistoriaClinicaPorPaciente(paciente.id);
  }

  // async verTodosLosPacientes() {
  //   this.especialistaSeleccionado = null;
  //   this.pacienteSeleccionado = null;
  //   this.pacientes = this.usuarios.filter(u => u.rol === 'Paciente');
  //   this.historiaClinica = [];
  // }

  async verTodosLosPacientes() {
  this.especialistaSeleccionado = null;
  this.pacienteSeleccionado = null;
  this.pacientes = this.usuarios.filter(u => u.rol === 'Paciente');
  this.historiaClinica = await this.supabaseService.getTodasLasHistoriasClinicas();
}

getNombrePaciente(id: string): string {
  const paciente = this.pacientes.find(p => p.id === id);
  return paciente ? `${paciente.nombre} ${paciente.apellido}` : '';
}
}