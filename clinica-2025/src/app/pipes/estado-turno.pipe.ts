import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'estadoTurno',
  standalone: true
})
export class EstadoTurnoPipe implements PipeTransform {
  transform(estado: string): string {
    switch (estado) {
      case 'pendiente': return '<span style="color:#ff9800">Pendiente</span>';
      case 'aceptado': return '<span style="color:#1976d2">Aceptado</span>';
      case 'realizado': return '<span style="color:#388e3c">Realizado</span>';
      case 'cancelado': return '<span style="color:#e53935">Cancelado</span>';
      case 'rechazado': return '<span style="color:#b71c1c">Rechazado</span>';
      default: return estado;
    }
  }
}