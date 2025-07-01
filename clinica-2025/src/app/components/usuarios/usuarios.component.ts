import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { ResaltarDeshabilitadoDirective } from '../../directives/resaltar-deshabilitado.directive';
import { ChartConfiguration, ChartType } from 'chart.js';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { NgChartsModule } from 'ng2-charts';
import { FormsModule } from '@angular/forms';
import { ResaltarHistoriaDirective } from '../../directives/resaltar-historia.directive';
@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, ResaltarHistoriaDirective, ResaltarDeshabilitadoDirective, NgChartsModule],
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

  isLoading = false;
  errorMsg = '';
  turnosPorEspecialidad: any[] = [];
  barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [{ data: [], label: 'Turnos por especialidad' }]
  };
  barChartType: ChartType = 'bar';
  logIngresos: any[] = [];
  turnosPorDia: any[] = [];
  lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [{ data: [], label: 'Turnos por día' }]
  };

  turnosPorMedico: any[] = [];
  fechaDesde = '2025-06-01';
  fechaHasta = '2025-06-30';
  barMedicoChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [{ data: [], label: 'Turnos' }]
  };
  informeSeleccionado: string = 'seleccionar';
  mostrarInformes: boolean = true;


  constructor(private supabaseService: SupabaseService, private authService: AuthService, private router: Router) {}

  async ngOnInit() {
        await this.loadEspecialistas();
    await this.loadUsuarios();
    await this.cargarTurnosPorEspecialidad();
    await this.cargarLogIngresos();
    await this.cargarTurnosPorDia();
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



  ocultarInformes() {
    this.mostrarInformes = false;
    this.informeSeleccionado = 'seleccionar';
    this.mostrarInformes = true;
  }


  async cargarTurnosPorMedico(estado: string) {
    this.turnosPorMedico = await this.supabaseService.getTurnosPorMedicoYEstado(this.fechaDesde, this.fechaHasta, estado);
    this.barMedicoChartData = {
      labels: this.turnosPorMedico.map(e => e.medico),
      datasets: [{ data: this.turnosPorMedico.map(e => e.cantidad), label: 'Turnos' }]
    };

  }

  exportarTurnosPorMedicoExcel() {
    const ws = XLSX.utils.json_to_sheet(this.turnosPorMedico);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'TurnosPorMedico');
    XLSX.writeFile(wb, 'turnos-por-medico.xlsx');
  }

  exportarTurnosPorMedicoPDF() {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Médico', 'Cantidad']],
      body: this.turnosPorMedico.map(e => [e.medico, e.cantidad])
    });
    doc.save('turnos-por-medico.pdf');
  }

  async cargarTurnosPorDia() {
    this.turnosPorDia = await this.supabaseService.getTurnosPorDia();
    this.lineChartData.labels = this.turnosPorDia.map(e => e.fecha);
    this.lineChartData.datasets[0].data = this.turnosPorDia.map(e => e.cantidad);


  }

  exportarTurnosPorDiaExcel() {
    const ws = XLSX.utils.json_to_sheet(this.turnosPorDia);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'TurnosPorDia');
    XLSX.writeFile(wb, 'turnos-por-dia.xlsx');
  }

  exportarTurnosPorDiaPDF() {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Fecha', 'Cantidad']],
      body: this.turnosPorDia.map(e => [e.fecha, e.cantidad])
    });
    doc.save('turnos-por-dia.pdf');
  }
  async cargarLogIngresos() {
    this.logIngresos = await this.supabaseService.getLogIngresos();


  }

  exportarLogIngresosExcel() {
    const ws = XLSX.utils.json_to_sheet(this.logIngresos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'LogIngresos');
    XLSX.writeFile(wb, 'log-ingresos.xlsx');
  }

  exportarLogIngresosPDF() {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Usuario', 'Fecha y Hora']],
      body: this.logIngresos.map(l => [l.usuario_email, l.fecha_hora])
    });
    doc.save('log-ingresos.pdf');
  }


  async cargarTurnosPorEspecialidad() {
    this.turnosPorEspecialidad = await this.supabaseService.getTurnosPorEspecialidad();
    this.barChartData.labels = this.turnosPorEspecialidad.map(e => e.especialidad);
    this.barChartData.datasets[0].data = this.turnosPorEspecialidad.map(e => e.cantidad);


  }

  exportarTurnosEspecialidadExcel() {
    const ws = XLSX.utils.json_to_sheet(this.turnosPorEspecialidad);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'TurnosEspecialidad');
    XLSX.writeFile(wb, 'turnos-por-especialidad.xlsx');
  }

  exportarTurnosEspecialidadPDF() {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Especialidad', 'Cantidad']],
      body: this.turnosPorEspecialidad.map(e => [e.especialidad, e.cantidad])
    });
    doc.save('turnos-por-especialidad.pdf');
  }
  async loadUsuarios() {
    try {
      this.usuarios = await this.supabaseService.getUsuarios();
    } catch (e) {
      this.errorMsg = 'Error al cargar usuarios';
    }
  }
  async loadEspecialistas() {
    this.isLoading = true;
    this.errorMsg = '';
    try {
      this.especialistas = await this.supabaseService.getEspecialistas();
      console.log('Toggling validado for:', this.especialistas);
      this.especialistas = this.especialistas.map(esp => ({
        ...esp,
        verificado: !!esp.verificado,
      }));
      console.table(this.especialistas.map(e => ({
        nombre: e.nombre,
        apellido: e.apellido,
        verificado: e.verificado,
        tipo: typeof e.verificado
      })));
    } catch (e) {
      this.errorMsg = 'Error al cargar especialistas';
    } finally {
      this.isLoading = false;
    }
  }



  async toggleValidado(especialista: any) {
    try {
      await this.supabaseService.setEspecialistaValidado(especialista.id, !especialista.validado);
      especialista.validado = !especialista.validado;
    } catch (e) {
      this.errorMsg = 'No se pudo actualizar el estado';
    }
  }


  registrarUsuario(rol: string) {
    this.router.navigate(['/register'], { queryParams: { rol } });
  }

  // descargarExcelUsuarios() {
  //   const datos = this.usuarios.map(u => ({
  //     Nombre: u.nombre,
  //     Apellido: u.apellido,
  //     Email: u.email,
  //     Rol: u.rol,
  //   }));

  //   const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datos);
  //   const wb: XLSX.WorkBook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(wb, ws, 'Usuarios');

  //   const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  //   const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  //   saveAs(blob, 'usuarios.xlsx');
  // }



async descargarExcelUsuariosCompleto() {
  try {
    const [usuarios, turnos, historias] = await Promise.all([
      this.supabaseService.getUsuariosConRelaciones(),
      this.supabaseService.getTurnosClinica(),
      this.supabaseService.getTodasLasHistoriasClinicas()
    ]);

 
    const datosUsuarios = usuarios.map(u => {
      const especialidades = u.usuario_especialidad?.map((e: any) => e.especialidades?.nombre).join(', ') || '';
      const obraSocial = Array.isArray(u.obras_sociales)
  ? (u.obras_sociales[0] as any)?.nombre || ''
  : (u.obras_sociales as any)?.nombre || '';
      return {
        Nombre: u.nombre,
        Apellido: u.apellido,
        Email: u.email,
        Edad: u.edad,
        DNI: u.dni,
        Rol: u.rol,
        Validado: u.validado ? 'Sí' : 'No',
        Verificado: u.verificado ? 'Sí' : 'No',
        'Obra Social': obraSocial,
        Especialidades: especialidades
      };
    });


    const datosTurnos = turnos.map(t => ({
      Fecha: t.fecha,
      Hora: t.hora,
      Estado: t.estado,
      Especialidad: t.especialidades?.nombre || '',
      Especialista: `${t.usuarios?.nombre || ''} ${t.usuarios?.apellido || ''}`,
      PacienteNombre: `${t.pacientes?.nombre || ''} ${t.pacientes?.apellido || ''}`.trim(),
    }));




const datosHistoria = historias.map(h => ({
  PacienteNombre: `${h.pacientes?.nombre || ''} ${h.pacientes?.apellido || ''}`.trim(),
  EspecialistaNombre: `${h.especialistas?.nombre || ''} ${h.especialistas?.apellido || ''}`.trim(),
  FechaAtencion: h.fecha_atencion,
  Altura: h.altura,
  Peso: h.peso,
  Temperatura: h.temperatura,
  Presion: h.presion,
  DatosDinamicos: h.datos_dinamicos ? JSON.stringify(h.datos_dinamicos) : ''
}));





    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    const wsUsuarios: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datosUsuarios);
    const wsTurnos: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datosTurnos);
    const wsHistoria: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datosHistoria);

    XLSX.utils.book_append_sheet(wb, wsUsuarios, 'Usuarios');
    XLSX.utils.book_append_sheet(wb, wsTurnos, 'Turnos');
    XLSX.utils.book_append_sheet(wb, wsHistoria, 'Historia Clínica');


    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'datos_completos.xlsx');
  } catch (error) {
    console.error('Error al generar Excel completo:', error);
  }
}

async descargarExcelTurnosPaciente(paciente: any) {
  try {
    const turnos = await this.supabaseService.getTurnosPorPaciente(paciente.id);

    const datos = turnos.map(t => {
      const especialista = Array.isArray(t.especialistas) ? t.especialistas[0] : t.especialistas;
const especialidad = Array.isArray(t.especialidades) ? t.especialidades[0] : t.especialidades;

      return {
        Fecha: t.fecha,
        Hora: t.hora,
        Estado: t.estado,
        Especialidad: especialidad?.nombre || '',
        Especialista: especialista?.nombre || ''
      };
    });

    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'TurnosPaciente');

    const nombreArchivo = `turnos_${paciente.nombre}_${paciente.apellido}.xlsx`;
    XLSX.writeFile(wb, nombreArchivo);
  } catch (error) {
    console.error('Error al exportar turnos del paciente:', error);
  }
}



}