import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { LoginComponent } from './pages/login/login';
import { MembersComponent } from './pages/members/members';
import { VisitsComponent } from './pages/visits/visits';
import { SettingsComponent } from './pages/settings/settings';
import { SidebarComponent } from './components/sidebar/sidebar';
import { AnalyticsComponent } from './pages/analytics/analytics';

export const routes: Routes = [
  {
    path: '',
    component: LoginComponent
  },
  {
    path: '',
    component: SidebarComponent,
    children: [
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
      {
        path: 'analytics',
        component: AnalyticsComponent
      },
      {
        path: 'settings',
        component: SettingsComponent
      }
    ]
  }
];