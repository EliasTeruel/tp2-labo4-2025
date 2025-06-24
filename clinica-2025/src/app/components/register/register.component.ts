import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { SupabaseService } from '../../services/supabase.service';
import { environment } from '../../../environments/environment';
import { createClient, User } from '@supabase/supabase-js';
import { ActivatedRoute } from '@angular/router';
import { CaptchaDirective } from '../../directives/captcha.directive';
const supabase = createClient(environment.apiUrl, environment.publicAnonKey);

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, CaptchaDirective],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  firstName = '';
  lastName = '';
  userType = '';
  obraSocial = '';
  nuevaObraSocial = '';
  especialidadesSeleccionadas: string[] = [];
  nuevaEspecialidad = '';
  age: number | null = null;
  dni = '';
  email = '';
  password = '';
  selectedFile: File | null = null;
  isPaciente = false;
  isEspecialista = false;
  msjError = '';
  flagError = false;
  especialidades: any[] = [];
  obrasSociales: any[] = [];
  isLoading = false;
  userEmail = '';
  showModal = false;
  showVerifyEmailModal = false;
  captchaValid: boolean = false;
  captchaResult: boolean = false;
  captchaMessage = '';
  showCaptcha = false;
  firstNameError = '';
  lastNameError = '';
  ageError = '';
  dniError = '';
  emailError = '';
  passwordError = '';
  fileError = '';
  carnetFileError = '';
  successMessage: string | null = null;
  tempImageFile: File | null = null;
  mostrarCampoNuevaEspecialidad = false;
  tipoSeleccionado: string | null = null;
  carnetFile: File | null = null;
  bloquearSeleccionTipo = false;
  captchaDeshabilitado = false;
  selectedRol = '';
  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private dataService: DataService,
    private supabaseService: SupabaseService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.loadEspecialidades();
    this.loadObrasSociales();

    this.route.queryParams.subscribe(params => {
      if (params['rol']) {
        this.selectedRol = params['rol'];
        this.tipoSeleccionado = params['rol'];
        this.userType = params['rol'];
        this.bloquearSeleccionTipo = true;
        this.isPaciente = params['rol'] === 'Paciente';
        this.isEspecialista = params['rol'] === 'Especialista';
      }
    });
  }

  async loadEspecialidades() {
    try {
      this.especialidades = await this.dataService.getEspecialidades();
    } catch (error) {
      console.error('Error cargando especialidades', error);
    }
  }

  async loadObrasSociales() {
    try {
      this.obrasSociales = await this.dataService.getObrasSociales();
    } catch (error) {
      console.error('Error cargando obras sociales', error);
    }
  }

  onFileSelected(event: any, tipo: 'perfil' | 'carnet') {
    const file = event.target.files[0];
    if (file && !file.type.startsWith('image/')) {
      if (tipo === 'perfil') {
        this.selectedFile = null;
        this.fileError = 'El archivo debe ser una imagen.';
      } else {
        this.carnetFile = null;
        this.carnetFileError = 'El archivo debe ser una imagen.';
      }
      return;
    }
    if (tipo === 'perfil') {
      this.selectedFile = file;
      this.fileError = '';
    } else {
      this.carnetFile = file;
      this.carnetFileError = '';
    }
  }

  onUserTypeChange(event: any) {
    this.userType = event.target.value;
    this.isPaciente = this.userType === 'Paciente';
    this.isEspecialista = this.userType === 'Especialista';
  }

  onCheckboxChange(event: any) {
    const value = event.target.value;
    if (event.target.checked) {
      this.especialidadesSeleccionadas.push(value);
    } else {
      this.especialidadesSeleccionadas = this.especialidadesSeleccionadas.filter(e => e !== value);
    }
  }

  async agregarObraSocialNueva() {
    if (this.nuevaObraSocial && this.nuevaObraSocial.trim() !== '') {
      try {
        const result: any[] = await this.dataService.createObraSocial(this.nuevaObraSocial.trim(), '') ?? [];
        if (result && result.length > 0) {
          this.obrasSociales.push(result[0]);
          this.obraSocial = this.nuevaObraSocial.trim();
          this.flagError = false;
        } else {
          this.flagError = true;
          this.msjError = 'No se pudo guardar la obra social.';
        }
      } catch (error) {
        console.error('Error al crear obra social', error);
        this.flagError = true;
        this.msjError = 'No se pudo guardar la obra social.';
      }
    }
  }


  removerEspecialidad(especialidad: string) {
    const index = this.especialidadesSeleccionadas.indexOf(especialidad);
    if (index >= 0) {
      this.especialidadesSeleccionadas.splice(index, 1);
    }
  }

  async register() {

    this.isLoading = true;
    this.msjError = '';
    this.firstNameError = '';
    this.lastNameError = '';
    this.ageError = '';
    this.dniError = '';
    this.emailError = '';
    this.passwordError = '';
    this.fileError = '';

    if (!this.firstName.match(/^[a-zA-Z\s]+$/)) {
      this.firstNameError = 'El nombre es obligatorio y solo letras.';
      this.isLoading = false;
      return;
    }
    if (!this.lastName.match(/^[a-zA-Z\s]+$/)) {
      this.lastNameError = 'El apellido es obligatorio y solo letras.';
      this.isLoading = false;
      return;
    }
    if (!this.age || (this.isPaciente && (this.age < 1 || this.age > 99)) || (this.isEspecialista && (this.age < 18 || this.age > 75))) {
      this.ageError = this.isEspecialista
        ? 'La edad debe estar entre 18 y 75 años para especialistas.'
        : 'La edad debe estar entre 1 y 99 años para pacientes.';
      this.isLoading = false;
      return;
    }
    if (!this.dni.match(/^\d{7,10}$/)) {
      this.dniError = 'El DNI debe ser un número entre 7 y 10 dígitos.';
      this.isLoading = false;
      return;
    }

    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(this.email)) {
      this.emailError = 'Ingrese un correo electrónico válido.';
      this.isLoading = false;
      return;
    }
    if (!this.password || this.password.length < 6) {
      this.passwordError = 'La contraseña debe tener al menos 6 caracteres.';
      this.isLoading = false;
      return;
    }
    if (!this.selectedFile) {
      this.fileError = 'La imagen de perfil es obligatoria.';
      this.isLoading = false;
      return;
    }

    if (this.isPaciente) {
      if (!this.selectedFile) {
        this.fileError = 'La imagen de perfil es obligatoria.';
        this.isLoading = false;
        return;
      }
      if (!this.carnetFile) {
        this.carnetFileError = 'La imagen de carnet/obra social es obligatoria.';
        this.isLoading = false;
        return;
      }

    }


    if (!this.captchaValid && !this.captchaDeshabilitado) {
      this.msjError = 'Por favor completa el CAPTCHA';
      this.isLoading = false;
      return;
    }


    try {
      const { data, error } = await this.supabaseService.client.auth.signUp({
        email: this.email,
        password: this.password,
        options: {
          data: {
            name: this.firstName,
            apellido: this.lastName,
            age: this.age,
            dni: this.dni,
          }
        }
      });
      if (error) throw error;
      console.log('Respuesta de signUp:', data, error);

      let avatarUrl = null;
      let carnetUrl = null;
      if (this.selectedFile && data.user) {
        avatarUrl = await this.supabaseService.uploadProfileImage(this.selectedFile, data.user.id);
      }
      if (this.isPaciente && this.carnetFile && data.user) {
        carnetUrl = await this.supabaseService.uploadCarnetImage(this.carnetFile, data.user.id);
      }

      if (data.user) {
        await this.supabaseService.saveUserData(
          data.user,
          avatarUrl,
          {
            firstName: this.firstName,
            lastName: this.lastName,
            age: this.age!,
            dni: this.dni,
            email: this.email,
            obraSocial: this.obraSocial,
            userType: this.userType,
            especialidadesSeleccionadas: this.especialidadesSeleccionadas
          }
        );
      }
      localStorage.removeItem('UserMailRegistered');
      localStorage.removeItem('UserPWDRegisted');
      localStorage.setItem('UserMailRegistered', this.email);
      localStorage.setItem('UserPWDRegisted', this.password);
      this.successMessage = '¡Registro exitoso!';

      this.userEmail = this.email;
      this.showVerifyEmailModal = true;
      this.successMessage = '¡Registro exitoso! Por favor, valida tu correo.';


    } catch (error: any) {
      console.error('Error:', error);
      this.msjError = this.getErrorMessage(error);
    } finally {
      this.isLoading = false;
    }
    this.resetForm();
  }

  onCaptchaVerified(isValid: boolean) {
    this.captchaValid = isValid;
    if (isValid) {
      this.register(); 
    } else {
      this.msjError = 'Error en la verificación CAPTCHA';
    }
  }

  private getErrorMessage(error: any): string {
    if (error.message?.includes('Password')) {
      return 'La contraseña debe tener al menos 6 caracteres';
    }
    if (error.message?.includes('Unable to validate email')) {
      return 'El formato del correo electrónico es inválido';
    }
    if (error.message?.includes('insert or update on table')) {
      return 'Este correo ya está registrado';
    }
    if (error.message?.includes('The resource already exists')) {
      return 'Este correo ya está registrado';
    }
    if (error.message?.includes('For security purposes')) {
      return 'Muchos intentos, espere unos segundos antes de intentar nuevamente';
    }
    return 'Error al registrar. Intente nuevamente.';
  }

  closeVerifyEmailModal() {
    this.showVerifyEmailModal = false;
  }

  goToLogin() {
    this.showVerifyEmailModal = false;
    this.router.navigate(['/login']);
  }

  closeCaptchaModal() {
    this.showCaptcha = false;
  }

  onCaptchaSuccess() {
    this.captchaValid = true;
    this.closeCaptchaModal();
    this.register();
  }

  onDragStart(event: DragEvent): void {
    event.dataTransfer?.setData('text', 'dragging');
    const target = event.currentTarget as HTMLElement;
    target.classList.add('dragging');
  }

  onDragEnd(event: DragEvent): void {
    const target = event.currentTarget as HTMLElement;
    target.classList.remove('dragging');
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    const target = event.currentTarget as HTMLElement;
    target.classList.add('over-zone');
  }

  onDragLeave(event: DragEvent): void {
    const target = event.currentTarget as HTMLElement;
    target.classList.remove('over-zone');
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const data = event.dataTransfer?.getData('text');
    if (data === 'dragging') {
      this.captchaValid = true;
      const target = event.currentTarget as HTMLElement;
      target.classList.add('completed');
      this.closeCaptchaModal();
      this.register();
      this.captchaMessage = 'Verificación completada.';
    }
    const target = event.currentTarget as HTMLElement;
    target.classList.remove('over-zone');
  }

  async agregarEspecialidad() {
    if (this.nuevaEspecialidad.trim()) {
      try {
        this.flagError = false;
        const existe = this.especialidades.some(e => e.nombre.toLowerCase() === this.nuevaEspecialidad.trim().toLowerCase());
        if (existe) {
          this.flagError = true;
          this.msjError = 'La especialidad ya existe.';
          return;
        }
        const result: any[] = await this.dataService.createEspecialidad(this.nuevaEspecialidad.trim(), '') ?? [];
        if (result && result.length > 0) {
          this.especialidades.push(result[0]);
          this.especialidadesSeleccionadas.push(this.nuevaEspecialidad.trim());
          this.nuevaEspecialidad = '';
          this.mostrarCampoNuevaEspecialidad = false;
        } else {
          this.flagError = true;
          this.msjError = 'No se pudo guardar la especialidad.';
        }
      } catch (error) {
        console.error('Error al crear especialidad', error);
        this.flagError = true;
        this.msjError = 'No se pudo guardar la especialidad.';
      }
    } else {
      this.flagError = true;
      this.msjError = 'Por favor ingrese una especialidad válida.';
    }
  }

  cancelarAgregarEspecialidad() {
    this.nuevaEspecialidad = '';
    this.flagError = false;
    this.msjError = '';
    this.mostrarCampoNuevaEspecialidad = false;
  }
  seleccionarTipo(tipo: string) {
    this.tipoSeleccionado = tipo;

    this.userType = tipo;
    if (tipo === 'Paciente') {
      this.isPaciente = true;
      this.isEspecialista = false;
    } else if (tipo === 'Especialista') {
      this.isPaciente = false;
      this.isEspecialista = true;
    }
  }
  onValidateEmail() {
    this.showVerifyEmailModal = false;
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 2000);
  }

  resetForm() {
    this.firstName = '';
    this.lastName = '';
    this.userType = '';
    this.obraSocial = '';
    this.nuevaObraSocial = '';
    this.especialidadesSeleccionadas = [];
    this.nuevaEspecialidad = '';
    this.age = null;
    this.dni = '';
    this.email = '';
    this.password = '';
    this.selectedFile = null;
    this.msjError = '';
    this.flagError = false;
    this.firstNameError = '';
    this.lastNameError = '';
    this.ageError = '';
    this.dniError = '';
    this.emailError = '';
    this.passwordError = '';
    this.fileError = '';
    this.carnetFileError = '';
  }
}
