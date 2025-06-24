import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nombreCompleto',
  standalone: true
})
export class NombreCompletoPipe implements PipeTransform {
  transform(usuario: any): string {
    if (!usuario) return '';
    return `${usuario.nombre} ${usuario.apellido}`;
  }
}