import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { User } from '../models/auth.interface';

/**
 * Guard de autorización basado en el rol extraído del JWT.
 *
 * - Sin token válido (no autenticado) → redirige al login ('/').
 * - Autenticado y la ruta no declara `data.roles` → acceso permitido
 *   (basta con estar logueado; caso de dashboard, members, visits).
 * - Autenticado pero su rol no está en `data.roles` → redirige a /dashboard
 *   (pantalla accesible para todos los roles).
 *
 * Uso en las rutas:
 *   { path: 'settings', component: SettingsComponent,
 *     canActivate: [roleGuard], data: { roles: ['admin'] } }
 */
export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const role = authService.getRole();

  if (!role) {
    return router.createUrlTree(['/']);
  }

  const allowedRoles = route.data['roles'] as User['rol'][] | undefined;

  if (!allowedRoles || allowedRoles.includes(role)) {
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};
