import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { ChangeDetectorRef } from '@angular/core';
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
  ],
  templateUrl: './members.html',
  styleUrls: ['./members.css']
})
export class MembersComponent implements OnInit {
  private memberService = inject(MemberService);
  private cd = inject(ChangeDetectorRef);

  members: Member[] = [];
  filteredMembers = new MatTableDataSource<Member>([]);
  displayedColumns: string[] = ['miembro', 'contacto', 'membresia', 'vigencia', 'estado', 'acciones'];

  stats = {
    total: 0,
    activos: 0,
    inactivos: 0
  };

  ngOnInit() {
    this.loadMembers();
  }

  loadMembers() {
  this.memberService.getAllMembers().subscribe({
    next: (response) => {
      if (response.success && response.data) {
        this.members = response.data;
        this.calculateStats();

        this.cd.detectChanges(); // 🔥 clave
      }
    },
    error: (error) => {
      console.error('Error loading members:', error);
      this.members = [];
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

    this.members = this.members.filter(member =>
      member.nombre?.toLowerCase().includes(filterValue) ||
      member.apellido?.toLowerCase().includes(filterValue) ||
      member.telefono?.toLowerCase().includes(filterValue)
    );
  }

  getInitials(member: Member): string {
    return `${member.nombre?.charAt(0)}${member.apellido?.charAt(0)}`.toUpperCase();
  }
}
