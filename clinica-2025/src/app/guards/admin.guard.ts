import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';

export const AdminGuard: CanActivateFn = async (route, state) => {
  const supabaseService = inject(SupabaseService);
  const router = inject(Router);

  const session = await supabaseService.getSession();
  const user = session?.user;
  if (!user) {
    router.navigate(['/login']);
    return false;
  }

  const { data, error } = await supabaseService.client
    .from('usuarios')
    .select('rol')
    .eq('auth_user_id', user.id)
    .maybeSingle();

  if (data?.rol === 'admin') {
    return true;
  } else {
    router.navigate(['/']);
    return false;
  }
};