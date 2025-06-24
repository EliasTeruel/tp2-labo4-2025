import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ResaltarRealizadoDirective } from '../../directives/resaltar-realizado.directive';


@Component({
  selector: 'app-turnos-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ResaltarRealizadoDirective],
  templateUrl: './turnos-admin.component.html',
  styleUrls: ['./turnos-admin.component.scss']
})
export class TurnosAdminComponent implements OnInit {
  turnos: any[] = [];
  turnosFiltrados: any[] = [];
  especialidades: any[] = [];
  especialistas: any[] = [];
  filtroEspecialidad: string | null = null;
  filtroEspecialista: string | null = null;

  modalAbierto = false;
  modalComentario = '';
  modalTurno: any = null;

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit() {
    this.turnos = await this.supabaseService.getTurnosClinica();
    this.especialidades = this.turnos
      .map(t => t.especialidades)
      .filter((v, i, a) => a.findIndex(u => u.id === v.id) === i);
    this.especialistas = this.turnos
      .map(t => t.usuarios)
      .filter((v, i, a) => a.findIndex(u => u.id === v.id) === i);
    this.turnosFiltrados = this.turnos;
  }

  filtrarPorEspecialidad(id: string) {
    this.filtroEspecialidad = id;
    this.filtrarTurnos();
  }
  filtrarPorEspecialista(id: string) {
    this.filtroEspecialista = id;
    this.filtrarTurnos();
  }
  filtrarTurnos() {
    this.turnosFiltrados = this.turnos.filter(t =>
      (!this.filtroEspecialidad || t.especialidad_id === this.filtroEspecialidad) &&
      (!this.filtroEspecialista || t.especialista_id === this.filtroEspecialista)
    );
  }

  puedeCancelar(turno: any) {
    return !['aceptado', 'realizado', 'rechazado'].includes(turno.estado);
  }

  abrirCancelar(turno: any) {
    this.modalAbierto = true;
    this.modalComentario = '';
    this.modalTurno = turno;
  }
  cerrarModal() {
    this.modalAbierto = false;
    this.modalComentario = '';
    this.modalTurno = null;
  }
  async confirmarCancelar() {
    if (this.modalTurno && this.modalComentario) {
      await this.supabaseService.cancelarTurno(this.modalTurno.id, this.modalComentario);
      await this.ngOnInit();
      this.cerrarModal();
    }
  }
}