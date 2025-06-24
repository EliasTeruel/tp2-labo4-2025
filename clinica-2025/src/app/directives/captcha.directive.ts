import { Directive, Output, EventEmitter, Input, HostListener, ElementRef, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appCaptcha]',
  standalone: true
})
export class CaptchaDirective {
  @Input() disabled: boolean = false;
  // @Output('captchaVerified') verified = new EventEmitter<boolean>();
    @Output() captchaVerified = new EventEmitter<boolean>();
  
  private captchaModal!: HTMLElement;
  private isDragging = false;
  private startX = 0;
  private startY = 0;
  private offsetX = 0;
  private offsetY = 0;
  private dragElement!: HTMLElement;
  private dropZone!: HTMLElement;
  

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('click') onClick() {
    if (!this.disabled) {
      this.showCaptcha();
    }
  }

  showCaptcha() {
  this.captchaModal = this.renderer.createElement('div');
  this.renderer.addClass(this.captchaModal, 'captcha-modal');

  const content = this.renderer.createElement('div');
  this.renderer.addClass(content, 'captcha-content');

  const closeBtn = this.renderer.createElement('span');
  this.renderer.addClass(closeBtn, 'close');
  this.renderer.setProperty(closeBtn, 'innerHTML', '&times;');
  this.renderer.listen(closeBtn, 'click', () => this.closeCaptcha());

  const title = this.renderer.createElement('h3');
  this.renderer.setProperty(title, 'textContent', 'Verifica que no eres un robot');

  const description = this.renderer.createElement('p');
  this.renderer.setProperty(description, 'textContent', 'Arrastra el círculo al área indicada');

  const container = this.renderer.createElement('div');
  this.renderer.addClass(container, 'captcha-container');

  this.dragElement = this.renderer.createElement('div');
  this.renderer.addClass(this.dragElement, 'drag-circle');
  this.renderer.setProperty(this.dragElement, 'textContent', '🔵');

  this.dropZone = this.renderer.createElement('div');
  this.renderer.addClass(this.dropZone, 'drop-zone');
  this.renderer.setProperty(this.dropZone, 'textContent', 'Suelta aquí');

  const message = this.renderer.createElement('div');
  this.renderer.addClass(message, 'captcha-message');

  this.renderer.appendChild(container, this.dragElement);
  this.renderer.appendChild(container, this.dropZone);

  this.renderer.appendChild(content, closeBtn); 
  this.renderer.appendChild(content, title);
  this.renderer.appendChild(content, description);
  this.renderer.appendChild(content, container);
  this.renderer.appendChild(content, message);

  this.renderer.appendChild(this.captchaModal, content);
  this.renderer.appendChild(document.body, this.captchaModal);

  this.setupDragEvents();
}


  // showCaptcha() {
  //   this.captchaModal = this.renderer.createElement('div');
  //   this.renderer.addClass(this.captchaModal, 'captcha-modal');
    
  //   const content = `
  //     <div class="captcha-content">
  //     <span class="close" (click)="closeCaptcha()">&times;</span>
  //       <h3>Verifica que no eres un robot</h3>
  //       <p>Arrastra el círculo al área indicada</p>
        
  //       <div class="captcha-container">
  //         <div class="drag-circle" #dragCircle>🔵</div>
  //         <div class="drop-zone">Suelta aquí</div>
  //       </div>
        
  //       <div class="captcha-message"></div>
  //     </div>
  //   `;
  //   this.renderer.setProperty(this.captchaModal, 'innerHTML', content);
  //   this.renderer.appendChild(document.body, this.captchaModal);
  //   this.dragElement = this.captchaModal.querySelector('.drag-circle') as HTMLElement;
  //   this.dropZone = this.captchaModal.querySelector('.drop-zone') as HTMLElement;
  //   this.setupDragEvents();
  // }

  private setupDragEvents() {
    this.dragElement = this.captchaModal.querySelector('.drag-circle') as HTMLElement;
    this.dropZone = this.captchaModal.querySelector('.drop-zone') as HTMLElement;
    this.renderer.listen(this.dragElement, 'mousedown', (e) => this.startDrag(e));
    this.renderer.listen(document, 'mousemove', (e) => this.drag(e));
    this.renderer.listen(document, 'mouseup', () => this.endDrag());

    this.renderer.listen(this.dropZone, 'mouseover', () => {
      if (this.isDragging) {
        this.renderer.addClass(this.dropZone, 'highlight');
      }
    });
    
    this.renderer.listen(this.dropZone, 'mouseout', () => {
      this.renderer.removeClass(this.dropZone, 'highlight');
    });

       
  
  }

  private startDrag(e: MouseEvent) {
    this.isDragging = true;
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.renderer.addClass(this.dragElement, 'dragging');
    e.preventDefault();
  }

  private drag(e: MouseEvent) {
    if (!this.isDragging) return;
    
    this.offsetX = e.clientX - this.startX;
    this.offsetY = e.clientY - this.startY;
    this.renderer.setStyle(this.dragElement, 'transform', `translate(${this.offsetX}px, ${this.offsetY}px)`);
    const dropRect = this.dropZone.getBoundingClientRect();
    const dragRect = this.dragElement.getBoundingClientRect();
    
    if (
      dragRect.right > dropRect.left &&
      dragRect.left < dropRect.right &&
      dragRect.bottom > dropRect.top &&
      dragRect.top < dropRect.bottom
    ) {
      this.renderer.addClass(this.dropZone, 'active');
    } else {
      this.renderer.removeClass(this.dropZone, 'active');
    }
  }

  private endDrag() {
    if (!this.isDragging) return;
    
    this.isDragging = false;
    this.renderer.removeClass(this.dragElement, 'dragging');
    
    const dropRect = this.dropZone.getBoundingClientRect();
    const dragRect = this.dragElement.getBoundingClientRect();
    
    if (
      dragRect.right > dropRect.left &&
      dragRect.left < dropRect.right &&
      dragRect.bottom > dropRect.top &&
      dragRect.top < dropRect.bottom
    ) {
      this.renderer.addClass(this.dropZone, 'success');
      const message = this.captchaModal.querySelector('.captcha-message') as HTMLElement;
      this.renderer.setProperty(message, 'textContent', '¡Verificación completada!');
      
      setTimeout(() => {
        this.captchaVerified.emit(true);
        this.closeCaptcha();
      }, 500);
    } else {
      this.renderer.setStyle(this.dragElement, 'transform', 'translate(0, 0)');
      this.renderer.removeClass(this.dropZone, 'active');
      this.renderer.removeClass(this.dropZone, 'highlight');
    }
  }

  private closeCaptcha() {
    if (this.captchaModal) {
      this.renderer.removeChild(document.body, this.captchaModal);
    }
  }
}