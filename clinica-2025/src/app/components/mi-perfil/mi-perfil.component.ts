import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
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



}