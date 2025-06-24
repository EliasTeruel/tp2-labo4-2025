import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { SupabaseService } from '../../services/supabase.service';
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.scss'
})
export class NavComponent implements OnInit, OnDestroy {
  isMenuOpen = false;
  isLoggedIn = false;
  isAdmin = false;
  rol: string | null = null;
  email: string | null = null;
  private subscriptions: Subscription[] = [];

  constructor(private supabase: SupabaseService, private router: Router, private authService: AuthService) { }


 async ngOnInit() {
    this.subscriptions.push(
      this.authService.loggedIn$.subscribe(logged => this.isLoggedIn = logged)
    );
    this.subscriptions.push(
      this.authService.rol$.subscribe(rol => {
        this.rol = rol;
        this.isAdmin = rol === 'admin';
      })
    );

    this.subscriptions.push(
      this.supabase.authChanges.subscribe(async (session) => {
        const logged = !!session;
        this.authService.setLoggedIn(logged);
        if (logged) {
          const user = session?.user;
          if (user) {
            const { data } = await this.supabase.client
              .from('usuarios')
              .select('rol')
              .eq('auth_user_id', user.id)
              .maybeSingle();
            this.authService.setRol(data?.rol ?? null);
          }
        } else {
          this.authService.setRol(null);
        }
      })
    );

    this.email = this.authService.getCurrentUserEmail();
    this.isLoggedIn = !!this.email;
    this.rol = this.authService.getRol();
    this.isAdmin = this.rol === 'admin';
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  async logout() {
    await this.supabase.signOut();
    this.authService.clearUserInfo();
    this.router.navigate(['/login']);
  }
}