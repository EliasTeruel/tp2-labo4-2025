import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class PacienteOAdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}
  canActivate(): boolean {
    const rol = this.authService.getRol();
    if (rol === 'Paciente' || rol === 'admin') return true;
    this.router.navigate(['/login']);
    return false;
  }
}