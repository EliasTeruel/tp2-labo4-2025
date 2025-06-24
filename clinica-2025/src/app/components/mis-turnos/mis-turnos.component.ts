// mis-turnos.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service'; // o como manejes el usuario
import { SupabaseService } from '../../services/supabase.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ResaltarPipe } from '../../pipes/resaltar.pipe';
import { NombreCompletoPipe } from '../../pipes/nombre-completo.pipe';
import { EstadoTurnoPipe } from '../../pipes/estado-turno.pipe';
import { ResaltarRealizadoDirective } from '../../directives/resaltar-realizado.directive';

@Component({
  selector: 'app-mis-turnos',
  standalone: true,
  imports: [ReactiveFormsModule, 
    CommonModule, 
    FormsModule,
    ResaltarPipe,
    NombreCompletoPipe,
    EstadoTurnoPipe,
    ResaltarRealizadoDirective
  ],
  templateUrl: './mis-turnos.component.html',
  styleUrls: ['./mis-turnos.component.scss']
})
export class MisTurnosComponent implements OnInit {
  rol: string = '';
  turnos: any[] = [];
  turnosFiltrados: any[] = [];
  especialidades: any[] = [];
  filtroEspecialidad: string | null = null;
  filtroUsuario: string | null = null;
  filtroUsuarios: any[] = [];
objectKeys = Object.keys;
historia = { altura: '', peso: '', temperatura: '', presion: '' };
camposDinamicos: { clave: string, valor: string }[] = [];
  modalAbierto = false;
  modalVerResena = false;
  modalTitulo = '';
  modalComentario = '';
  modalCalificacion: number | null = null;
  modalTipo: 'cancelar' | 'rechazar' | 'finalizar' | 'encuesta' | 'calificar' | null = null;
  modalTurno: any = null;
  modalResena = '';
historiaClinica: any[] = [];
busquedaGlobal: string = '';
datosDinamicosForm = {
  rango: 50,
  numero: null,
  apto: false
};
mensajeErrorHistoria: string = '';
confirmando: boolean = false;

  constructor(private authService: AuthService, private supabaseService: SupabaseService) { }

  async ngOnInit() {
    this.rol = this.authService.getRol() ?? '';
    if (this.rol === 'Paciente') {
      const email = this.authService.getCurrentUserEmail();
      if (!email) {
        this.turnos = [];
        this.filtroUsuarios = [];
        return;
      }
      const pacienteId = await this.supabaseService.getUserIdByEmail(email);
      if (!pacienteId) {
        this.turnos = [];
        this.filtroUsuarios = [];
        return;
      }
      this.turnos = await this.supabaseService.getTurnosPaciente(pacienteId);
      this.filtroUsuarios = this.turnos.map(t => t.usuarios)
        .filter((v, i, a) => a.findIndex(u => u.id === v.id) === i);
    } else if (this.rol === 'Especialista') {
      const email = this.authService.getCurrentUserEmail();
      if (!email) {
        this.turnos = [];
        this.filtroUsuarios = [];
        return;
      }
      const especialistaId = await this.supabaseService.getUserIdByEmail(email);
      this.especialidades = await this.supabaseService.getEspecialidadesDeEspecialista(especialistaId);
      if (!especialistaId) {
        this.turnos = [];
        this.filtroUsuarios = [];
        return;
      }
      this.turnos = await this.supabaseService.getTurnosEspecialista(especialistaId);
      this.filtroUsuarios = this.turnos.map(t => t.usuarios)
        .filter((v, i, a) => a.findIndex(u => u.id === v.id) === i);
    } else {
      this.especialidades = await this.supabaseService.getEspecialidades();
    }
    this.turnosFiltrados = this.turnos;

    for (let turno of this.turnos) {
  const historia = await this.supabaseService.getHistoriaClinicaPorTurno(turno.id);
  turno.historia_clinica = historia?.[0] || null;
}

  }


  filtrarPorEspecialidad(id: string) {
    this.filtroEspecialidad = id;
    this.filtrarTurnos();
  }
  filtrarPorUsuario(id: string) {
    this.filtroUsuario = id;
    this.filtrarTurnos();
  }
  // filtrarTurnos() {
  //   this.turnosFiltrados = this.turnos.filter(t =>
  //     (!this.filtroEspecialidad || t.especialidad_id === this.filtroEspecialidad) &&
  //     (!this.filtroUsuario || (this.rol === 'Paciente' ? t.especialista_id === this.filtroUsuario : t.paciente_id === this.filtroUsuario))
  //   );
  // }

  mostrarNombre(turno: any) {
    return turno.usuarios ? `${turno.usuarios.nombre} ${turno.usuarios.apellido}` : '';
  }
  puedeCancelar(turno: any) {
    return this.rol === 'Paciente' && turno.estado === 'pendiente';
  }
  puedeRechazar(turno: any) {
    return this.rol === 'Especialista' && !['realizado', 'cancelado', 'rechazado'].includes(turno.estado);
  }
  puedeAceptar(turno: any) {
    return this.rol === 'Especialista' && !['realizado', 'aceptado', 'rechazado'].includes(turno.estado);
  }
  puedeFinalizar(turno: any) {
    return this.rol === 'Especialista' && turno.estado === 'aceptado';
  }
  puedeCompletarEncuesta(turno: any) {
    return this.rol === 'Paciente' && turno.estado === 'realizado' && turno.reseña && !turno.encuesta;
  }
  puedeCalificar(turno: any) {
    return this.rol === 'Paciente' && turno.estado === 'realizado' && !turno.calificacion;
  }

  async cancelarTurno(turno: any, comentario: string) {
    await this.supabaseService.cancelarTurno(turno.id, comentario);
  }

  async recargarTurnos() {
    await this.ngOnInit();
  }


  async aceptarTurno(turno: any) {
    await this.supabaseService.aceptarTurno(turno.id);
    await this.recargarTurnos();
  }



  abrirCancelar(turno: any) {
    this.modalAbierto = true;
    this.modalTitulo = 'Cancelar turno';
    this.modalComentario = '';
    this.modalTipo = 'cancelar';
    this.modalTurno = turno;
  }
  abrirRechazar(turno: any) {
    this.modalAbierto = true;
    this.modalTitulo = 'Rechazar turno';
    this.modalComentario = '';
    this.modalTipo = 'rechazar';
    this.modalTurno = turno;
  }
  abrirFinalizar(turno: any) {
    this.modalAbierto = true;
    if (this.rol === 'Especialista') {
      this.modalTitulo = 'Finalizar turno, ingrese diagnóstico';
    } else {
      this.modalTitulo = 'Finalizar turno, ingrese reseña';
    }
    this.modalComentario = '';
    this.modalTipo = 'finalizar';
    this.modalTurno = turno;
  }
  abrirEncuesta(turno: any) {
    this.modalAbierto = true;
    this.modalTitulo = 'Completar encuesta';
    this.modalComentario = '';
    this.modalTipo = 'encuesta';
    this.modalTurno = turno;
  }
  abrirCalificar(turno: any) {
    this.modalAbierto = true;
    this.modalTitulo = 'Calificar atención';
    this.modalComentario = '';
    this.modalTipo = 'calificar';
    this.modalCalificacion = null;
    this.modalTurno = turno;
  }
  verResena(turno: any) {
    this.modalVerResena = true;
    this.modalResena = turno.resena;
  }
  cerrarModal() {
    this.modalAbierto = false;
    this.modalVerResena = false;
    this.modalComentario = '';
    this.modalCalificacion = null;
    this.modalTurno = null;
    this.modalTipo = null;
    this.modalResena = '';
      this.mensajeErrorHistoria = '';
  }
  async confirmarModal() {
    if (this.confirmando) return;
  this.confirmando = true;
  this.mensajeErrorHistoria = '';
    this.mensajeErrorHistoria = '';
    if (!this.modalTurno) {
    this.confirmando = false;
    return;
  }

  if (this.rol === 'Especialista' && this.modalTipo === 'finalizar') {
    if (
      !this.historia.altura ||
      !this.historia.peso ||
      !this.historia.temperatura ||
      !this.historia.presion
    ) {
      this.mensajeErrorHistoria = 'Todos los campos de historia clínica son obligatorios.';
      return;
    }
    if (
      this.datosDinamicosForm.rango === null ||
      this.datosDinamicosForm.rango === undefined ||
      this.datosDinamicosForm.numero === null ||
      this.datosDinamicosForm.numero === undefined ||
      this.datosDinamicosForm.numero === ''
    ) {
      this.mensajeErrorHistoria = 'Debes completar todos los datos dinámicos.';
      return;
    }
    for (let campo of this.camposDinamicos) {
      if (!campo.clave || !campo.valor) {
        this.mensajeErrorHistoria = 'Todos los campos dinámicos deben tener clave y valor.';
        return;
      }
    }
    await this.guardarHistoriaClinica();
    this.confirmando = false;
    this.cerrarModal();
    return;
  }


    if (this.modalTipo === 'cancelar' && this.modalComentario) {
      await this.supabaseService.cancelarTurno(this.modalTurno.id, this.modalComentario);
    }
    if (this.modalTipo === 'rechazar' && this.modalComentario) {
      await this.supabaseService.rechazarTurno(this.modalTurno.id, this.modalComentario);
    }
    if (this.modalTipo === 'finalizar' && this.modalComentario) {
      await this.supabaseService.finalizarTurno(this.modalTurno.id, this.modalComentario);
    }
    if (this.modalTipo === 'encuesta' && this.modalComentario) {
      await this.supabaseService.completarEncuesta(this.modalTurno.id, { respuesta: this.modalComentario });
    }
    if (this.modalTipo === 'calificar' && this.modalCalificacion) {
      await this.supabaseService.calificarAtencion(this.modalTurno.id, this.modalCalificacion, this.modalComentario || '');
    }
    await this.recargarTurnos();
    this.cerrarModal();
  }


async guardarHistoriaClinica() {
  if (!this.modalTurno) return;
  const datosDinamicos: any = {
    'Rango': this.datosDinamicosForm.rango,
    'Valor numérico': this.datosDinamicosForm.numero,
    'Apto físico': this.datosDinamicosForm.apto ? 'Sí' : 'No'
  };
  // this.camposDinamicos.forEach(c => {
  //   if (c.clave && c.valor) datosDinamicos[c.clave] = c.valor;
  // });

  await this.supabaseService.crearHistoriaClinica({
    paciente_id: this.modalTurno.paciente_id,
    especialista_id: this.modalTurno.especialista_id,
    turno_id: this.modalTurno.id,
    altura: this.historia.altura,
    peso: this.historia.peso,
    temperatura: this.historia.temperatura,
    presion: this.historia.presion,
    datos_dinamicos: datosDinamicos
  });

  await this.supabaseService.finalizarTurno(this.modalTurno.id, 'Atención finalizada');
  this.historia = { altura: '', peso: '', temperatura: '', presion: '' };
  this.datosDinamicosForm = { rango: 50, numero: null, apto: false };
  await this.recargarTurnos();
}

agregarCampoDinamico() {
  if (this.camposDinamicos.length < 3) {
    this.camposDinamicos.push({ clave: '', valor: '' });
  }
}

filtrarTurnos() {
  const texto = this.busquedaGlobal.trim().toLowerCase();

  this.turnosFiltrados = this.turnos.filter(t => {
    const filtroEspecialidad = !this.filtroEspecialidad || t.especialidad_id === this.filtroEspecialidad;
    const filtroUsuario = !this.filtroUsuario || (this.rol === 'Paciente' ? t.especialista_id === this.filtroUsuario : t.paciente_id === this.filtroUsuario);

    if (!texto) return filtroEspecialidad && filtroUsuario;

    let campos = [
      t.fecha,
      t.hora,
      t.estado,
      t.especialidades?.nombre,
      t.usuarios?.nombre,
      t.usuarios?.apellido,
      t.usuarios?.email,
      t.resena,
      t.comentario,
      t.calificacion?.toString()
    ];

    if (t.historia_clinica) {
      campos.push(
        t.historia_clinica.altura?.toString(),
        t.historia_clinica.peso?.toString(),
        t.historia_clinica.temperatura?.toString(),
        t.historia_clinica.presion
      );
      if (t.historia_clinica.datos_dinamicos) {
        Object.entries(t.historia_clinica.datos_dinamicos).forEach(([k, v]) => {
          campos.push(k, v?.toString());
        });
      }
    }

    return filtroEspecialidad && filtroUsuario && campos.some(campo =>
      campo && campo.toLowerCase().includes(texto)
    );
  });
}



}