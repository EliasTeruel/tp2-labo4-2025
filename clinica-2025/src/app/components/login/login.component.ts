
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { SupabaseService } from '../../services/supabase.service';
import { trigger, transition, style, animate } from '@angular/animations';

const supabase = createClient(environment.apiUrl, environment.publicAnonKey);

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  animations: [
    trigger('slideInFromBottom', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(80px)' }),
        animate('800ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  userNotFound: boolean = false;
  errorMessage: string = '';
  isLoading: boolean = false;
  quickUsers: any[] = [];
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private supabaseService: SupabaseService
  ) {
    this.loginForm = this.fb.group({
      userMail: ['', [Validators.required, Validators.email]],
      userPWD: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async ngOnInit() {
    const UserMailRegistered = localStorage.getItem('UserMailRegistered');
    const UserPWDRegisted = localStorage.getItem('UserPWDRegisted');
    localStorage.removeItem('swapUserMail');
    if (UserMailRegistered && UserPWDRegisted) {
      this.loginForm.patchValue({
        userMail: UserMailRegistered,
        userPWD: UserPWDRegisted
      });
    }
    try {
      this.quickUsers = await this.supabaseService.getQuickLoginUsers();
    } catch (e) {
      console.error('Error cargando usuarios rápidos', e);
    }
  }

  get userMail() {
    return this.loginForm.get('userMail');
  }

  get userPWD() {
    return this.loginForm.get('userPWD');
  }

  async checkIfUserExists() {
    const email = this.userMail?.value;
    if (this.userMail?.valid) {
      try {
        const { data, error } = await supabase.auth.signInWithOtp({
          email,
          options: { shouldCreateUser: false }
        });

        this.userNotFound = !!error;
      } catch (error) {
        this.userNotFound = true;
      }
    }
  }

  quickLogin() {
    const savedUserMail = 'eliasteruel96@gmail.com';
    // const savedUserMail = localStorage.getItem('savedUserMail');
    if (savedUserMail) {
      this.loginForm.patchValue({
        userMail: savedUserMail,
        userPWD: '123456'
      });
    }
  }
  async login() {
    if (this.loginForm.invalid) {
      this.markAllAsTouched();
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;

    const { userMail, userPWD } = this.loginForm.value;
    console.log('Intentando login con:', userMail, userPWD);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: userMail,
        password: userPWD
      });
      console.log('Login error:', error);
      if (error) {
        this.handleLoginError(error);
      } else {
        const isEmailVerified = !!data.user?.email_confirmed_at;
        if (isEmailVerified) {
          await this.supabaseService.client
            .from('usuarios')
            .update({ verificado: true })
            .eq('email', userMail);
        }

        const { data: usuario, error: userError } = await this.supabaseService.client
          .from('usuarios')
          .select('rol, validado, verificado')
          .eq('email', userMail)
          .maybeSingle();

        if (userError) {
          this.errorMessage = 'Error al verificar usuario.';
          return;
        }
        if (usuario?.rol) {
          this.authService.setRol(usuario.rol);
        }
        console.log('Usuario rol:', usuario?.rol, usuario?.validado, 'Verificado:', usuario?.verificado);

        if (usuario?.rol === 'Especialista' && !usuario?.validado) {
          this.errorMessage = 'Tu cuenta de especialista aún no fue habilitada por un administrador.';
          console.log('Cuenta de especialista no habilitada.');
          await supabase.auth.signOut();
          return;
        }

        await this.updateLastLogin(data.user.id);
        this.authService.setUserInfo(userMail);
        await this.supabaseService.client
  .from('log_ingresos')
  .insert([{ usuario_email: userMail, fecha_hora: new Date().toISOString() }]);
        localStorage.setItem('savedUserMail', userMail);
        this.router.navigate(['/home']);
        localStorage.removeItem('UserMailRegistered');
        localStorage.removeItem('UserPWDRegisted');
      }
    } catch (error) {
      this.errorMessage = 'Error en el inicio de sesión. Inténtalo de nuevo.';
    } finally {
      this.isLoading = false;
    }
  }


  private async updateLastLogin(userId: string) {
    try {
      const { error } = await supabase
        .from('users-data')
        .update({ last_login: new Date().toISOString() })
        .eq('authId', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error actualizando last_login:', error);
    }
  }

  private markAllAsTouched() {
    Object.values(this.loginForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  private handleLoginError(error: any) {
    if (error.message.includes('Invalid login credentials')) {
      this.errorMessage = 'Contraseña o Email incorrecto.';
    } else if (error.message.includes('Email not confirmed')) {
      this.errorMessage = 'Por favor confirma tu correo electrónico primero.';
    } else {
      this.errorMessage = 'Error en el inicio de sesión. Inténtalo de nuevo.';
    }
  }

  register() {
    const userMail = this.userMail?.value;

    localStorage.setItem('swapUserMail', userMail);
    this.router.navigate(['/register']);
  }

  quickLoginUser(user: any) {
    const passwords: { [email: string]: string } = {
      'lisox99163@calorpg.com': '123123',
      'wigam24440@ethsms.com': '123123',
      'nagaf80799@cristout.com': '123123',
      'nodon51795@hosliy.com': '123123',
      'tetetef557@forcrack.com': '123123',
      'celiyob775@calorpg.com': '123123'
    };
    this.loginForm.patchValue({
      userMail: user.email,
      userPWD: passwords[user.email] || ''
    });
    this.login();
  }


}