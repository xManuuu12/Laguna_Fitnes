import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'] 
})
export class DashboardComponent {
  // Datos simulados para las 4 tarjetas superiores
  stats = [
    { title: 'Miembros Activos', value: '1,245', trend: '+4.75%', isPositive: true, icon: 'people', iconClass: 'icon-blue' },
    { title: 'Visitas de Hoy', value: '342', trend: '+12.5%', isPositive: true, icon: 'play_arrow', iconClass: 'icon-green' },
    { title: 'Nuevas Membresías', value: '24', trend: '-1.0%', isPositive: false, icon: 'trending_up', iconClass: 'icon-yellow' },
    { title: 'Ingresos del Mes', value: '$45,200', trend: '+8.2%', isPositive: true, icon: 'calendar_today', iconClass: 'icon-purple' }
  ];

  // Datos simulados para la lista de visitas recientes
  recentVisits = [
    { name: 'Carlos López', plan: 'Mensualidad Pro', time: 'Hace 10 min', avatar: 'https://i.pravatar.cc/150?u=1' },
    { name: 'Maria Fernández', plan: 'Pase Diario', time: 'Hace 25 min', avatar: 'https://i.pravatar.cc/150?u=2' },
    { name: 'Juan Pérez', plan: 'Suscripción Anual', time: 'Hace 1 hora', avatar: 'https://i.pravatar.cc/150?u=3' },
    { name: 'Laura Gómez', plan: 'Mensualidad Pro', time: 'Hace 2 horas', avatar: 'https://i.pravatar.cc/150?u=4' }
  ];
}