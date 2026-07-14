import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { LoginComponent } from './pages/login/login';
import { MembersComponent } from './pages/members/members';
import { VisitsComponent } from './pages/visits/visits';
import { SettingsComponent } from './pages/settings/settings';
import { SidebarComponent } from './components/sidebar/sidebar';
import { AnalyticsComponent } from './pages/analytics/analytics';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    component: LoginComponent
  },
  {
    path: '',
    component: SidebarComponent,
    // El shell requiere estar autenticado; sin token el guard redirige al login.
    canActivate: [roleGuard],
    children: [
      // Accesibles para admin y recepcion (sin restricción de rol).
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'members',
        component: MembersComponent
      },
      {
        path: 'visits',
        component: VisitsComponent
      },
      // Solo admin.
      {
        path: 'analytics',
        component: AnalyticsComponent,
        canActivate: [roleGuard],
        data: { roles: ['admin'] }
      },
      {
        path: 'settings',
        component: SettingsComponent,
        canActivate: [roleGuard],
        data: { roles: ['admin'] }
      }
    ]
  }
];