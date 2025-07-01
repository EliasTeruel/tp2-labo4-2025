import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appAvatarError]',
  standalone: true
})
export class AvatarErrorDirective {
  constructor(private el: ElementRef<HTMLImageElement>) {}

  @HostListener('error')
  onError() {
    const img = this.el.nativeElement;
    img.src = '/default.png'; 
  }
}
