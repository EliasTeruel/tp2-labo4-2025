import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-turnos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './turnos.component.html',
  styleUrl: './turnos.component.scss'
})
export class TurnosComponent implements OnInit {
  especialidades: any[] = [];
  especialistas: any[] = [];
  fechasDisponibles: string[] = [];
  horariosDisponibles: string[] = [];
  especialidadSeleccionada: string = '';
  especialistaSeleccionado: string = '';
  fechaSeleccionada: string = '';
  horaSeleccionada: string = '';
  isLoading = false;
  msjError = '';
  msjExito = '';
  rol: string | null = null;
  pacienteId: string | null = null;
  diasDisponibles: number[] = [];
msjSinHorarios = '';
loadingEspecialistas: boolean = false;
loadingFechas: boolean = false;
loadingHorarios: boolean = false;
msjNoEspecialistas: string = '';
msjNoFechas: string = '';

  constructor(private supabaseService: SupabaseService, private authService: AuthService) { }

  async ngOnInit() {
    this.rol = this.authService.getRol();
    const email = this.authService.getCurrentUserEmail();
    if (this.rol === 'Paciente' && email) {
      this.pacienteId = await this.supabaseService.getUserIdByEmail(email);
      console.log('Paciente ID obtenido:', this.pacienteId);
    }
    this.especialidades = await this.supabaseService.getEspecialidades();
  }
async onEspecialidadChange() {
  this.especialistaSeleccionado = '';
  this.fechaSeleccionada = '';
  this.horaSeleccionada = '';
  this.fechasDisponibles = [];
  this.horariosDisponibles = [];
  this.msjNoEspecialistas = '';
  this.loadingEspecialistas = true;
  
  try {
    if (this.especialidadSeleccionada) {
      this.especialistas = await this.supabaseService.getEspecialistasPorEspecialidad(this.especialidadSeleccionada);
      if (this.especialistas.length === 0) {
        this.msjNoEspecialistas = 'No hay especialistas disponibles para esta especialidad.';
      }
    }
  } catch (error) {
    this.msjNoEspecialistas = 'Error al cargar especialistas.';
  } finally {
    this.loadingEspecialistas = false;
  }
  
  this.msjError = '';
  this.msjExito = '';
  this.msjSinHorarios = '';
}

async onEspecialistaChange() {
  this.fechaSeleccionada = '';
  this.horaSeleccionada = '';
  this.fechasDisponibles = [];
  this.horariosDisponibles = [];
  this.msjNoFechas = '';
  this.loadingFechas = true;
  
  try {
    if (this.especialistaSeleccionado && this.especialidadSeleccionada) {
      this.diasDisponibles = await this.supabaseService.getDiasDisponiblesEspecialista(
        this.especialistaSeleccionado,
        this.especialidadSeleccionada
      );
      this.fechasDisponibles = this.generarFechasDisponibles();
      
      if (this.fechasDisponibles.length === 0) {
        this.msjNoFechas = 'El especialista no tiene días disponibles en las próximas 2 semanas.';
      }
    }
  } catch (error) {
    this.msjNoFechas = 'Error al cargar fechas disponibles.';
  } finally {
    this.loadingFechas = false;
  }
  
  this.msjError = '';
  this.msjExito = '';
  this.msjSinHorarios = '';
}

async onFechaChange() {
  this.horaSeleccionada = '';
  this.horariosDisponibles = [];
  this.msjSinHorarios = '';
  this.loadingHorarios = true;
  
  try {
    if (this.fechaSeleccionada) {
      await this.generarHorariosDisponibles();
    }
  } catch (error) {
    this.msjSinHorarios = 'Error al cargar horarios disponibles.';
  } finally {
    this.loadingHorarios = false;
  }
  
  this.msjError = '';
  this.msjExito = '';
}

  // generarFechasDisponibles(): string[] {
  //   const fechas: string[] = [];
  //   const hoy = new Date();
  //   for (let i = 0; i < 15; i++) {
  //     const fecha = new Date(hoy);
  //     fecha.setDate(hoy.getDate() + i);
  //     const dia = fecha.getDay();
  //     // Lunes a viernes (8:00 a 19:00), sábados (8:00 a 14:00)
  //     if ((dia >= 1 && dia <= 5) || dia === 6) {
  //       fechas.push(fecha.toISOString().split('T')[0]);
  //     }
  //   }
  //   return fechas;
  // }
generarFechasDisponibles(): string[] {
  const fechas: string[] = [];
  const hoy = new Date();
  for (let i = 0; i < 15; i++) {
    const fecha = new Date(hoy);
    fecha.setDate(hoy.getDate() + i);
    const dia = fecha.getDay();
    if (this.diasDisponibles.includes(dia)) {
      fechas.push(fecha.toISOString().split('T')[0]);
    }
  }
  return fechas;
}
  async generarHorariosDisponibles() {
    this.msjSinHorarios = '';
    this.horariosDisponibles = [];
    if (!this.fechaSeleccionada) return;
    const fecha = new Date(this.fechaSeleccionada);
    const dia = fecha.getDay();

    const disponibilidad = await this.supabaseService.getDisponibilidadEspecialistaPorEspecialidadYFecha(
    this.especialistaSeleccionado,
    this.especialidadSeleccionada,
    dia
  );

    let horarios: string[] = [];
     if (disponibilidad) {
    const inicio = disponibilidad.hora_inicio.slice(0, 5);
    const fin = disponibilidad.hora_fin.slice(0, 5);      
    let [h, m] = inicio.split(':').map(Number);
    const [hFin, mFin] = fin.split(':').map(Number);

    while (h < hFin || (h === hFin && m < mFin)) {
      const horaStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      horarios.push(horaStr);
      m += 30;
      if (m >= 60) {
        m = 0;
        h += 1;
      }
    }
    if (!horarios.includes(fin)) horarios.push(fin);
  }else {
    this.msjSinHorarios = 'El especialista no tiene disponibilidad para este día.';
    return;
  }
  const turnosOcupados = await this.supabaseService.getTurnosPorEspecialistaYFecha(
    this.especialistaSeleccionado,
    this.fechaSeleccionada,
    this.fechaSeleccionada
  );
  const ocupados = turnosOcupados
    .filter((t: any) => !['cancelado', 'rechazado'].includes(t.estado))
    .map((t: any) => t.hora.slice(0, 5));

  this.horariosDisponibles = horarios.filter(h => !ocupados.includes(h));
   if (this.horariosDisponibles.length === 0) {
    this.msjSinHorarios = 'No hay horarios disponibles para este día.';
  }
}

  async onSubmit() {
    if (this.isLoading) return;
    this.isLoading = true;
    this.msjError = '';
    this.msjExito = '';
    try {
      if (!this.especialidadSeleccionada || !this.especialistaSeleccionado || !this.fechaSeleccionada || !this.horaSeleccionada) {
        this.msjError = 'Completa todos los campos.';
        this.isLoading = false;
        return;
      }
      let pacienteId = this.pacienteId;
      if (this.rol === 'Paciente' && !pacienteId) {
        
        // pacienteId = await this.supabaseService.getUserIdByEmail(this.authService.getCurrentUserEmail());
      }

      console.log('Paciente ID:', pacienteId);
      console.log('Especialista ID:', this.especialistaSeleccionado);
      console.log('Especialidad ID:', this.especialidadSeleccionada);
      console.log('Fecha:', this.fechaSeleccionada, 'Hora:', this.horaSeleccionada);

      if (!pacienteId) {
        this.msjError = 'No se pudo obtener el ID del paciente.';
        this.isLoading = false;
        return;
      }

      await this.supabaseService.crearTurno({
        paciente_id: pacienteId,
        especialista_id: this.especialistaSeleccionado,
        especialidad_id: this.especialidadSeleccionada,
        fecha: this.fechaSeleccionada,
        hora: this.horaSeleccionada,
        estado: 'pendiente'
      });
      this.msjExito = '¡Turno solicitado con éxito!';
      this.onEspecialidadChange(); 
      if (this.fechaSeleccionada) {
  await this.generarHorariosDisponibles();
}
    } catch (error: any) {
      this.msjError = 'Error al solicitar turno: ' + error.message;
    } finally {
      this.isLoading = false;
    }
  }
}