import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ultimosTurnos',
  standalone: true
})
export class UltimosTurnosPipe implements PipeTransform {

  transform(turnos: any[]): string {
    if (!turnos || turnos.length === 0) return 'Sin turnos';
    return turnos.map(t => new Date(t.fecha).toLocaleDateString()).join(', ');
  }

}
