import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { SidebarComponent } from '../../components/sidebar/sidebar';
import { MemberService } from '../../services/member.service';
import { Member } from '../../models/member.interface';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatChipsModule,
    SidebarComponent
  ],
  templateUrl: './members.html',
  styleUrls: ['./members.css']
})
export class MembersComponent implements OnInit {
  private memberService = inject(MemberService);
  
  members: Member[] = [];
  filteredMembers = new MatTableDataSource<Member>([]);
  displayedColumns: string[] = ['miembro', 'contacto', 'membresia', 'vigencia', 'estado', 'acciones'];
  
  stats = {
    total: 5,
    activos: 3,
    inactivos: 2
  };

  ngOnInit() {
    this.loadMembers();
  }

  loadMembers() {
    this.memberService.getAllMembers().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.members = response.data;
          this.filteredMembers.data = this.members;
          this.calculateStats();
        }
      },
      error: (error) => {
        console.error('Error loading members:', error);
      }
    });
  }

  calculateStats() {
    this.stats.total = this.members.length;
    this.stats.activos = this.members.filter(m => m.estado === 'activo').length;
    this.stats.inactivos = this.members.filter(m => m.estado === 'vencido').length;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredMembers.data = this.members.filter(member => 
      member.nombre?.toLowerCase().includes(filterValue) || 
      member.apellido?.toLowerCase().includes(filterValue) ||
      member.telefono?.toLowerCase().includes(filterValue)
    );
  }

  getInitials(member: Member): string {
    return `${member.nombre?.charAt(0)}${member.apellido?.charAt(0)}`.toUpperCase();
  }
}
