import { Directive, ElementRef, Input, OnChanges, Renderer2, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appResaltarDeshabilitado]',
  standalone: true
})
export class ResaltarDeshabilitadoDirective implements OnChanges {
  @Input('appResaltarDeshabilitado') deshabilitado: boolean = false;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.deshabilitado) {
      this.renderer.setStyle(this.el.nativeElement, 'background', '#f5f5f5');
      this.renderer.setStyle(this.el.nativeElement, 'opacity', '0.7');
          this.renderer.setStyle(this.el.nativeElement, 'border', '2px solid red');
    } else {
      this.renderer.removeStyle(this.el.nativeElement, 'background');
      this.renderer.removeStyle(this.el.nativeElement, 'opacity');
      this.renderer.removeStyle(this.el.nativeElement, 'border');
    }
  }
}