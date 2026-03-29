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
import { VisitService } from '../../services/visit.service';
import { Visit } from '../../models/visit.interface';

@Component({
  selector: 'app-visits',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatPaginatorModule,
    MatSnackBarModule
  ],
  templateUrl: './visits.html',
  styleUrls: ['./visits.css']
})
export class VisitsComponent implements OnInit, AfterViewInit {
  private visitService = inject(VisitService);
  private snackBar = inject(MatSnackBar);
  private cd = inject(ChangeDetectorRef);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  visits: Visit[] = [];
  dataSource = new MatTableDataSource<Visit>([]);
  displayedColumns: string[] = ['codigo', 'miembro', 'membresia', 'fecha', 'entrada', 'estado'];
  
  todayDate = new Date();
  quickCode: string = '';
  isProcessing = false;

  stats = {
    hoy: 0,
    ultimaHora: 0,
    promedioDiario: 0
  };

  ngOnInit() {
    this.loadVisits();
    this.loadTodayStats();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  loadVisits() {
    this.visitService.getAllVisits().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.visits = response.data;
          this.dataSource.data = this.visits;
          this.cd.detectChanges();
        }
      },
      error: (error) => console.error('Error al cargar historial:', error)
    });
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
    
    // 1. Verificamos el estado de la membresía antes de registrar la entrada
    this.visitService.checkMemberStatus(socioId).subscribe({
      next: (statusRes) => {
        if (statusRes.data.estado === 'vencido') {
           this.snackBar.open(`¡ALERTA! El socio #${socioId} tiene la membresía VENCIDA.`, 'Entendido', { 
             duration: 5000, 
             panelClass: ['snackbar-error'] 
           });
        }
        
        // 2. Procedemos a registrar la entrada independientemente del aviso
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
        this.snackBar.open('¡Acceso concedido! Entrada registrada.', 'Cerrar', { duration: 3000 });
        this.quickCode = '';
        this.isProcessing = false;
        this.loadVisits();
        this.loadTodayStats();
      },
      error: (err: any) => {
        this.snackBar.open('Error al registrar la visita en el servidor', 'Cerrar', { duration: 3000 });
        this.isProcessing = false;
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
