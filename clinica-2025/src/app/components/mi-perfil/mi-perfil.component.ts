import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AvatarErrorDirective } from '../../directives/avatar-error.directive';

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, AvatarErrorDirective,],
  templateUrl: './mi-perfil.component.html',
  styleUrl: './mi-perfil.component.scss'
})
export class MiPerfilComponent implements OnInit {
  usuario: any = null;
  especialidades: any[] = [];
   especialidadSeleccionada: any = null;
  disponibilidad: any[] = [];
  dias = ['domingo','Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  horariosPorDia: { [dia: number]: { activo: boolean, inicio: string, fin: string } } = {};
historiaClinica: any[] = [];
objectKeys = Object.keys;

  constructor(private supabaseService: SupabaseService, private authService: AuthService) {}

  async ngOnInit() {
    const email = this.authService.getCurrentUserEmail();
    if (email) {
      this.usuario = await this.supabaseService.getUsuarioByEmail(email);
      if (this.usuario.rol === 'Especialista') {
        this.especialidades = await this.supabaseService.getEspecialidadesDeEspecialista(this.usuario.id);
      if (this.especialidades.length > 0) {
          this.seleccionarEspecialidad(this.especialidades[0]);
        }
      }
if (this.usuario.rol === 'Paciente') {
        this.historiaClinica = await this.supabaseService.getHistoriaClinicaPorPaciente(this.usuario.id);
      }
    }
  }
    async seleccionarEspecialidad(esp: any) {
    this.especialidadSeleccionada = esp;
    this.disponibilidad = await this.supabaseService.getDisponibilidadEspecialistaPorEspecialidad(this.usuario.id, esp.id);
    this.horariosPorDia = {};
    for (let i = 0; i < 7; i++) {
      const disp = this.disponibilidad.find(d => d.dia === i);
      this.horariosPorDia[i] = {
      activo: !!disp,
      inicio: disp ? disp.hora_inicio.slice(0, 5) : '', 
      fin: disp ? disp.hora_fin.slice(0, 5) : ''        
    };
    }
  }
 async guardarDia(dia: number) {
    const h = this.horariosPorDia[dia];
    if (h.activo && h.inicio && h.fin) {
      await this.supabaseService.setDisponibilidadEspecialista(
        this.usuario.id,
        this.especialidadSeleccionada.id,
        dia,
        h.inicio,
        h.fin
      );
    } else if (!h.activo) {
      await this.supabaseService.eliminarDisponibilidadEspecialista(
        this.usuario.id,
        this.especialidadSeleccionada.id,
        dia
      );
    }
    await this.seleccionarEspecialidad(this.especialidadSeleccionada);
  }

getHorariosParaDia(i: number): string[] {

  let horarios: string[] = [];
  if (i >= 1 && i <= 5) {
    for (let h = 8; h < 19; h++) {
      horarios.push(`${h.toString().padStart(2, '0')}:00`);
      horarios.push(`${h.toString().padStart(2, '0')}:30`);
    }
    horarios.push('19:00');
  } else if (i === 6) {
    for (let h = 8; h < 14; h++) {
      horarios.push(`${h.toString().padStart(2, '0')}:00`);
      horarios.push(`${h.toString().padStart(2, '0')}:30`);
    }
    horarios.push('14:00');
  }
  return horarios;
}

generarPDFHistoriaClinica() {
  if (!this.especialidadSeleccionada) {
    alert('Seleccioná una especialidad para filtrar la historia clínica.');
    return;
  }

  const atencionesFiltradas = this.historiaClinica.filter(atencion => 
    atencion.especialidad_id === this.especialidadSeleccionada.id
  );

  if (atencionesFiltradas.length === 0) {
    alert('No hay atenciones para la especialidad seleccionada.');
    return;
  }

  const doc = new jsPDF();


  const logoUrl = '/favicon.ico'; 
  const img = new Image();
  img.src = logoUrl;
  img.onload = () => {
    doc.addImage(img, 'ico', 10, 10, 50, 20);

    doc.setFontSize(18);
    doc.text('Informe de Historia Clínica', 70, 20);

    const fechaHoy = new Date().toLocaleDateString();
    doc.setFontSize(11);
    doc.text(`Fecha de emisión: ${fechaHoy}`, 70, 28);

    const startY = 40;

    const columnas = [
      { header: 'Fecha', dataKey: 'fecha' },
      { header: 'Altura (cm)', dataKey: 'altura' },
      { header: 'Peso (kg)', dataKey: 'peso' },
      { header: 'Temperatura (°C)', dataKey: 'temperatura' },
      { header: 'Presión', dataKey: 'presion' },
      { header: 'Datos adicionales', dataKey: 'datos_dinamicos' },
    ];

    const filas = atencionesFiltradas.map(a => ({
      fecha: new Date(a.fecha_atencion).toLocaleDateString(),
      altura: a.altura,
      peso: a.peso,
      temperatura: a.temperatura,
      presion: a.presion,
      datos_dinamicos: a.datos_dinamicos ? 
        Object.entries(a.datos_dinamicos).map(([k,v]) => `${k}: ${v}`).join(', ') : ''
    }));

    autoTable(doc, {
      startY,
      columns: columnas,
      body: filas,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [25, 118, 210] },
      margin: { left: 10, right: 10 },
    });

    doc.save(`Historia_Clinica_${this.usuario.nombre}_${this.especialidadSeleccionada.nombre}.pdf`);
  };

  img.onerror = () => {
    alert('Error al cargar el logo para el PDF.');
  };
}


}