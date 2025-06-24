import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'resaltar',
  standalone: true
})
export class ResaltarPipe implements PipeTransform {
  transform(value: string, busqueda: string): string {
    if (!busqueda) return value;
    const re = new RegExp(`(${busqueda})`, 'gi');
    return value ? value.replace(re, `<mark>$1</mark>`) : value;
  }
}