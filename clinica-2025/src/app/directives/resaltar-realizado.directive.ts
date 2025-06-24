import { Directive, ElementRef, Input, OnChanges, Renderer2, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appResaltarRealizado]',
  standalone: true
})
export class ResaltarRealizadoDirective implements OnChanges {
  @Input('appResaltarRealizado') estado: string = '';

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.estado === 'realizado') {
      this.renderer.setStyle(this.el.nativeElement, 'background', '#e8f5e9');
      this.renderer.setStyle(this.el.nativeElement, 'border', '2px solid #388e3c');
    }else if (this.estado === 'pendiente') { 
      this.renderer.setStyle(this.el.nativeElement, 'background', '#fff3e0');
      this.renderer.setStyle(this.el.nativeElement, 'border', '2px solid #f57c00');
    }else if (this.estado === 'cancelado' || this.estado === 'rechazado') {
      this.renderer.setStyle(this.el.nativeElement, 'background', '#ffebee');
      this.renderer.setStyle(this.el.nativeElement, 'border', '2px solid #d32f2f');
    } else if (this.estado === 'aceptado') {
      this.renderer.setStyle(this.el.nativeElement, 'background', '#e3f2fd');
      this.renderer.setStyle(this.el.nativeElement, 'border', '2px solid #1976d2');
    }
    else {
      this.renderer.removeStyle(this.el.nativeElement, 'background');
      this.renderer.removeStyle(this.el.nativeElement, 'border');
    }
  }
}