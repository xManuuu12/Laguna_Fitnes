import { Component, OnInit, ViewChild, AfterViewInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { VisitService } from '../../services/visit.service';
import { Visit } from '../../models/visit.interface';
import { StatusTemplateComponent, StatusType } from '../../components/status-template/status-template';

@Component({
  selector: 'app-visits',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatPaginatorModule,
    MatSnackBarModule,
    MatDatepickerModule,
    StatusTemplateComponent
  ],
  templateUrl: './visits.html',
  styleUrls: ['./visits.css']
})
export class VisitsComponent implements OnInit, AfterViewInit {
  private visitService = inject(VisitService);
  private snackBar = inject(MatSnackBar);
  private cd = inject(ChangeDetectorRef);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  status: StatusType = 'loading';
  visits: Visit[] = [];
  dataSource = new MatTableDataSource<Visit>([]);
  displayedColumns: string[] = ['codigo', 'miembro', 'membresia', 'fecha', 'entrada', 'estado'];
  
  selectedDate: Date = new Date();
  quickCode: string = '';
  isProcessing = false;

  stats = {
    hoy: 0,
    ultimaHora: 0,
    promedioDiario: 0
  };

  ngOnInit() {
    this.status = 'loading';
    this.loadVisits();
    this.loadTodayStats();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  onDateChange() {
    this.status = 'loading';
    this.loadVisits();
  }

  loadVisits() {
    const formattedDate = this.formatDate(this.selectedDate);
    this.visitService.getAllVisits(formattedDate).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.visits = response.data;
          this.dataSource.data = this.visits;
          this.cd.detectChanges();
          this.status = 'ok';
        } else {
          this.status = 'error';
        }
      },
      error: (error) => {
        console.error('Error al cargar historial:', error);
        this.status = 'error';
      }
    });
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  loadTodayStats() {
    this.visitService.getTodayStats().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.stats = response.data;
        } else {
          // Si no hay respuesta del backend, calculamos localmente
          this.calculateStatsLocally();
        }
      },
      error: () => this.calculateStatsLocally()
    });
  }

  private calculateStatsLocally() {
    const now = new Date();
    const hoyStr = now.toISOString().split('T')[0];
    this.stats.hoy = this.visits.filter(v => v.fecha_visita?.startsWith(hoyStr)).length;
    this.stats.ultimaHora = Math.floor(this.stats.hoy * 0.15); // Simulamos
    this.stats.promedioDiario = 50; // Ejemplo
  }

  confirmQuickVisit() {
    const socioId = parseInt(this.quickCode);
    if (isNaN(socioId)) {
      this.snackBar.open('Ingrese un código de socio válido (solo números)', 'Cerrar', { duration: 3000 });
      return;
    }

    this.isProcessing = true;
    
    // 1. Verificamos el estado de la membresía antes de intentar registrar
    this.visitService.checkMemberStatus(socioId).subscribe({
      next: (statusRes) => {
        if (statusRes.data.estado === 'vencido') {
           this.snackBar.open(`ACCESO DENEGADO: El socio #${socioId} tiene la membresía VENCIDA.`, 'Cerrar', { 
             duration: 6000, 
             panelClass: ['snackbar-error'] 
           });
           this.isProcessing = false;
           this.quickCode = '';
           return;
        }
        
        // 2. Procedemos a registrar la entrada solo si está activo
        this.registerEntrance(socioId);
      },
      error: (err: any) => {
        this.snackBar.open('Error: El socio no existe en el sistema', 'Cerrar', { duration: 3000 });
        this.isProcessing = false;
      }
    });
  }

  private registerEntrance(socioId: number) {
    this.visitService.registerVisit(socioId).subscribe({
      next: (response) => {
        this.snackBar.open('¡Acceso concedido! Entrada registrada.', 'Cerrar', { 
          duration: 3000,
          panelClass: ['snackbar-success']
        });
        this.quickCode = '';
        this.isProcessing = false;
        // Si la fecha seleccionada es hoy, recargamos la lista
        const hoy = this.formatDate(new Date());
        const seleccionada = this.formatDate(this.selectedDate);
        if (hoy === seleccionada) {
          this.loadVisits();
        }
        this.loadTodayStats();
      },
      error: (err: any) => {
        // Si el backend devuelve un error específico (ej. membresía vencida)
        const errorMessage = err.error?.message || 'Error al registrar la visita';
        this.snackBar.open(`No se pudo registrar: ${errorMessage}`, 'Cerrar', { 
          duration: 5000,
          panelClass: ['snackbar-error']
        });
        this.isProcessing = false;
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}

