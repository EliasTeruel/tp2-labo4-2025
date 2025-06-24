import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appResaltarHistoria]',
  standalone: true
})
export class ResaltarHistoriaDirective implements OnInit {
  @Input('appResaltarHistoria') tipo: 'vacia' | 'completa' = 'completa';

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit(): void {
    if (this.tipo === 'vacia') {
      this.renderer.setStyle(this.el.nativeElement, 'background', '#fff3cd');
      this.renderer.setStyle(this.el.nativeElement, 'color', '#856404');
      this.renderer.setStyle(this.el.nativeElement, 'padding', '8px 12px');
      this.renderer.setStyle(this.el.nativeElement, 'borderRadius', '6px');
    } else {
      this.renderer.setStyle(this.el.nativeElement, 'background', '#e3fcec');
      this.renderer.setStyle(this.el.nativeElement, 'border', '1.5px solid #34c759');
      this.renderer.setStyle(this.el.nativeElement, 'borderRadius', '6px');
      this.renderer.setStyle(this.el.nativeElement, 'padding', '10px 14px');
    }
  }
}