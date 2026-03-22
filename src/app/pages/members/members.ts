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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ChangeDetectorRef } from '@angular/core';
import { Member Service } from '../../services/member.service';
import { PaymentService } from '../../services/payment.service';
import { MembresiaService } from '../../services/membresia.service';
import { Member } from '../../models/member.interface';
import { Membresia } from '../../models/membresia.interface';
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
    MatSnackBarModule
  ],
  templateUrl: './members.html',
  styleUrls: ['./members.css']
})
export class MembersComponent implements OnInit, AfterViewInit {
  private memberService = inject(MemberService);
  private paymentService = inject(PaymentService);
  private membresiaService = inject(MembresiaService);
  private snackBar = inject(MatSnackBar);
  private cd = inject(ChangeDetectorRef);
  private dialog = inject(MatDialog);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  members: Member[] = [];
  membresias: any[] = [];
  dataSource = new MatTableDataSource<Member>([]);
  displayedColumns: string[] = ['miembro', 'contacto', 'membresia', 'vigencia', 'estado', 'acciones'];

  stats = {
    total: 0,
    activos: 0,
    inactivos: 0
  };

  ngOnInit() {
    this.loadMembresias();
    this.loadMembers();
  }

  loadMembresias() {
    this.membresiaService.getAllMembresias().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.membresias = response.data;
        }
      }
    });
  }

  getMembershipType(member: Member): string {
    // Si el backend ya incluye el objeto Membresia en el pago
    const lastPayment = member.Payments && member.Payments.length > 0 ? member.Payments[0] : null;
    
    if (lastPayment) {
      // 1. Intentar por el objeto Membresia si el backend lo incluyó (asumiendo que podría estar ahí)
      if ((lastPayment as any).Membresia?.nombre) {
        return (lastPayment as any).Membresia.nombre;
      }
      
      // 2. Intentar buscar en nuestra lista de membresías por id_membresia
      if (lastPayment.id_membresia) {
        const m = this.membresias.find(memb => memb.id_membresia === lastPayment.id_membresia);
        if (m) return m.nombre;
      }

      // 3. Si no hay ID, calcular por diferencia de días entre fecha_pago y fecha_vencimiento
      if (lastPayment.fecha_pago && lastPayment.fecha_vencimiento) {
        const start = new Date(lastPayment.fecha_pago);
        const end = new Date(lastPayment.fecha_vencimiento);
        const diffTime = end.getTime() - start.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 7) return 'Semanal';
        if (diffDays <= 31) return 'Mensual';
      }
      
      // 4. Lógica basada en la fecha de vencimiento comparada con hoy (lo que parece sugerir el JSON del usuario)
      // Si la fecha de vencimiento es exactamente 7 o 30 días después de hoy (asumiendo que hoy se cargó la lista)
      // O simplemente por la proximidad.
      if (lastPayment.fecha_vencimiento) {
        const end = new Date(lastPayment.fecha_vencimiento);
        const today = new Date();
        // Reset hours to compare only dates
        today.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        
        const diffTime = end.getTime() - today.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        
        // Si faltan entre 25 y 31 días, probablemente sea mensual
        // Si faltan entre 1 y 8 días, probablemente sea semanal
        if (diffDays > 0 && diffDays <= 8) return 'Semanal';
        if (diffDays > 8 && diffDays <= 31) return 'Mensual';
      }
    }

    return 'Mensual'; // Valor por defecto
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
        const { registrar_pago, id_membresia, metodo_pago, ...memberData } = result;
        
        this.memberService.createMember(memberData).subscribe({
          next: (response) => {
            if (registrar_pago && response.data?.id_miembro && id_membresia) {
              this.registerInitialPayment(response.data.id_miembro, id_membresia, metodo_pago);
            } else {
              this.snackBar.open('Miembro creado correctamente', 'Cerrar', { duration: 3000 });
              this.loadMembers();
            }
          },
          error: (err) => {
            console.error('Error creating member:', err);
            this.snackBar.open('Error al crear miembro', 'Cerrar', { duration: 3000 });
          }
        });
      }
    });
  }

  registerInitialPayment(id_miembro: number, id_membresia: number, metodo_pago: any) {
    this.membresiaService.getAllMembresias().subscribe(response => {
      const membresia = response.data?.find(m => m.id_membresia === id_membresia);
      if (membresia) {
        const fechaVencimiento = new Date();
        fechaVencimiento.setDate(fechaVencimiento.getDate() + membresia.duracion_dias);

        const payment: any = {
          id_miembro,
          id_membresia,
          monto: membresia.precio,
          metodo_pago,
          fecha_vencimiento: fechaVencimiento.toISOString().split('T')[0]
        };

        this.paymentService.createPayment(payment).subscribe({
          next: () => {
            this.snackBar.open('Miembro y pago inicial registrados', 'Cerrar', { duration: 3000 });
            this.loadMembers();
          },
          error: (err) => {
            console.error('Error creating initial payment:', err);
            this.snackBar.open('Miembro creado, pero error al registrar pago inicial', 'Cerrar', { duration: 3000 });
            this.loadMembers();
          }
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
          next: () => {
            this.snackBar.open('Miembro actualizado correctamente', 'Cerrar', { duration: 3000 });
            this.loadMembers();
          },
          error: (err) => {
            console.error('Error updating member:', err);
            this.snackBar.open('Error al actualizar miembro', 'Cerrar', { duration: 3000 });
          }
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
          next: () => {
            this.snackBar.open('Miembro eliminado correctamente', 'Cerrar', { duration: 3000 });
            this.loadMembers();
          },
          error: (err) => {
            console.error('Error deleting member:', err);
            this.snackBar.open('Error al eliminar miembro', 'Cerrar', { duration: 3000 });
          }
        });
      }
    });
  }
}
