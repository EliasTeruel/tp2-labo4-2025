import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appResaltarPacientes]',
  standalone: true
})
export class ResaltarPacientesDirective {

 @Input() ResaltarPacientes = '#1976d2';

  constructor(private el: ElementRef) {}

  @HostListener('mouseenter') onMouseEnter() {
    this.el.nativeElement.style.boxShadow = `0 0 6px ${this.ResaltarPacientes}`;
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.el.nativeElement.style.boxShadow = 'none';
  }
}