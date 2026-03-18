import { Component, OnInit, ViewChild, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { ChangeDetectorRef } from '@angular/core';
import { MemberService } from '../../services/member.service';
import { Member } from '../../models/member.interface';
import { MemberDialogComponent } from './member-dialog';
import { ConfirmDialogComponent } from './confirm-dialog';

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
    MatDialogModule,
    MatPaginatorModule,
  ],
  templateUrl: './members.html',
  styleUrls: ['./members.css']
})
export class MembersComponent implements OnInit, AfterViewInit {
  private memberService = inject(MemberService);
  private cd = inject(ChangeDetectorRef);
  private dialog = inject(MatDialog);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  members: Member[] = [];
  dataSource = new MatTableDataSource<Member>([]);
  displayedColumns: string[] = ['miembro', 'contacto', 'membresia', 'vigencia', 'estado', 'acciones'];

  stats = {
    total: 0,
    activos: 0,
    inactivos: 0
  };

  ngOnInit() {
    this.loadMembers();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  loadMembers() {
    this.memberService.getAllMembers().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.members = response.data;
          this.dataSource.data = this.members;
          this.calculateStats();
          this.cd.detectChanges();
        }
      },
      error: (error) => {
        console.error('Error loading members:', error);
        this.members = [];
        this.dataSource.data = [];
      }
    });
  }

  calculateStats() {
    this.stats.total = this.members.length;
    this.stats.activos = this.members.filter(m => m.estado === 'activo').length;
    this.stats.inactivos = this.members.filter(m => m.estado === 'vencido').length;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getInitials(member: Member): string {
    return `${member.nombre?.charAt(0)}${member.apellido?.charAt(0)}`.toUpperCase();
  }

  openAddMemberDialog() {
    const dialogRef = this.dialog.open(MemberDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.memberService.createMember(result).subscribe({
          next: () => this.loadMembers(),
          error: (err) => console.error('Error creating member:', err)
        });
      }
    });
  }

  openEditMemberDialog(member: Member) {
    const dialogRef = this.dialog.open(MemberDialogComponent, {
      width: '500px',
      data: { member }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && member.id_miembro) {
        this.memberService.updateMember(member.id_miembro, result).subscribe({
          next: () => this.loadMembers(),
          error: (err) => console.error('Error updating member:', err)
        });
      }
    });
  }

  deleteMember(member: Member) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmar Eliminación',
        message: `¿Estás seguro de que deseas eliminar a ${member.nombre} ${member.apellido}? Esta acción no se puede deshacer.`
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed && member.id_miembro) {
        this.memberService.deleteMember(member.id_miembro).subscribe({
          next: () => this.loadMembers(),
          error: (err) => console.error('Error deleting member:', err)
        });
      }
    });
  }
}
