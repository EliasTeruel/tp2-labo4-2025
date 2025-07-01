import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatoHora',
  standalone: true
})
export class FormatoHoraPipe implements PipeTransform {
transform(value: string): string {
    if (!value) return '';
    const [hora, minuto] = value.slice(0, 5).split(':');
    return `${hora.padStart(2, '0')}:${minuto.padStart(2, '0')}`;
  }
}
