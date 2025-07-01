import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatoFecha',
  standalone: true
})
export class FotrmatoFechaPipe implements PipeTransform {
transform(value: string | Date): string {
    if (!value) return '';
    const fecha = new Date(value);
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = fecha.toLocaleDateString('es-AR', { month: 'long' });
    return `${dia} de ${mes.charAt(0).toUpperCase() + mes.slice(1)}`;
  }
}
