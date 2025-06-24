import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { RegisterComponent } from './components/register/register.component';
import { AdminGuard } from './guards/admin.guard';
import { MisTurnosComponent } from './components/mis-turnos/mis-turnos.component';
import { pacienteGuardGuard } from './guards/paciente-guard.guard';
import { especialistaGuardGuard } from './guards/especialista-guard.guard';
import { TurnosComponent } from './components/turnos/turnos.component';
import { PacienteOAdminGuard } from './guards/paciente-oadmin.guard';
import { MiPerfilComponent } from './components/mi-perfil/mi-perfil.component';
import { PacientesComponent } from './components/pacientes/pacientes.component';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent, data: { animation: 'HomePage' } },
    { path: 'register', component: RegisterComponent, data: { animation: 'Register' } },
    { path: 'login', component: LoginComponent, data: { animation: 'Login' } },
    { path: 'mi-perfil', component: MiPerfilComponent, data: { animation: 'Perfil' } },
    {
    path: 'admin',
    canActivate: [AdminGuard],
    loadComponent: () => import('./components/admin-panel/admin-panel.component').then(m => m.AdminPanelComponent),
  data: { animation: 'AdminPanel' }},
  {
    path: 'mis-turnos/paciente',
    component: MisTurnosComponent,
    canActivate: [pacienteGuardGuard],
    data: { animation: 'MisTurnosPaciente' }
  },
  {
    path: 'mis-turnos/especialista',
    component: MisTurnosComponent,
    canActivate: [especialistaGuardGuard],
    data: { animation: 'MisTurnosEspecialista' }
  },
   {
    path: 'pacientes',
    component: PacientesComponent,
    canActivate: [especialistaGuardGuard],
    data: { animation: 'pacientes' }
  },
  {
  path: 'turnos',
  component: TurnosComponent,
  canActivate: [PacienteOAdminGuard] ,
    data: { animation: 'Turnos' }
},
{
    path: 'turnos-admin',
    canActivate: [AdminGuard],
    loadComponent: () => import('./components/turnos-admin/turnos-admin.component').then(m => m.TurnosAdminComponent),
    data: { animation: 'TurnosAdmin' }
  },
  {
    path: 'usuarios',
    canActivate: [AdminGuard],
    loadComponent: () => import('./components/usuarios/usuarios.component').then(m => m.UsuariosComponent),
    data: { animation: 'Usuarios' }
  },
];