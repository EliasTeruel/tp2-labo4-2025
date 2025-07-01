import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { ResaltarDeshabilitadoDirective } from '../../directives/resaltar-deshabilitado.directive';
import { ChartConfiguration, ChartType } from 'chart.js';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { NgChartsModule } from 'ng2-charts';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, ResaltarDeshabilitadoDirective, NgChartsModule, FormsModule],
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.scss'
})
export class AdminPanelComponent implements OnInit {
  especialistas: any[] = [];
  isLoading = false;
  errorMsg = '';
  usuarios: any[] = [];
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




  constructor(private supabaseService: SupabaseService, private router: Router,) { }

  async ngOnInit() {
    await this.loadEspecialistas();
    await this.loadUsuarios();
    await this.cargarTurnosPorEspecialidad();
    await this.cargarLogIngresos();
    await this.cargarTurnosPorDia();
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

  descargarExcelUsuarios() {
    const datos = this.usuarios.map(u => ({
      Nombre: u.nombre,
      Apellido: u.apellido,
      Email: u.email,
      Rol: u.rol,
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datos);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Usuarios');

    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'usuarios.xlsx');
  }


}