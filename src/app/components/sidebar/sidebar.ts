import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class SidebarComponent {
  public authService = inject(AuthService);
  public isCollapsed = false;

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    
    // Disparar evento de redimensionamiento para que las gráficas se ajusten
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 300); // Esperar a que termine la animación (0.3s)
  }
}
