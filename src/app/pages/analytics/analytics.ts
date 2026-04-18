import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule, MatSelectChange } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { AnalyticsService, AnalyticsData } from '../../services/analytics.service';
import { StatusTemplateComponent, StatusType } from '../../components/status-template/status-template';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    CommonModule, 
    MatIconModule, 
    MatButtonModule, 
    MatCardModule, 
    MatSelectModule, 
    MatFormFieldModule,
    BaseChartDirective,
    StatusTemplateComponent
  ],
  templateUrl: './analytics.html',
  styleUrls: ['./analytics.css']
})
export class AnalyticsComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);
  private cdr = inject(ChangeDetectorRef);

  status: StatusType = 'loading';
  private allData?: AnalyticsData;
  public selectedVisitFilter: string = 'ultimos7Dias';

  // Chart: Miembros Activos vs Inactivos (Pie)
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' }
    }
  };
  public pieChartData: ChartData<'pie', number[], string | string[]> = {
    labels: ['Activos', 'Inactivos'],
    datasets: [{ data: [0, 0], backgroundColor: ['#4ade80', '#f87171'] }]
  };
  public pieChartType: ChartType = 'pie';

  // Chart: Distribución de Membresías (Bar)
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { y: { min: 0 } },
    plugins: { legend: { display: false } }
  };
  public barChartType: ChartType = 'bar';
  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{ data: [], label: 'Miembros', backgroundColor: '#3b82f6' }]
  };

  // Chart: Visitas (Line)
  public lineChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Visitas',
        fill: true,
        tension: 0.4,
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        pointBackgroundColor: '#8b5cf6',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#8b5cf6'
      }
    ]
  };
  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
      x: { grid: { display: false } }
    },
    plugins: {
      legend: { display: false }
    }
  };

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.status = 'loading';
    this.analyticsService.getDashboardData().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.allData = response.data;
          this.updateCharts();
          this.cdr.detectChanges();
          this.status = 'ok';
        } else {
          this.status = 'error';
        }
      },
      error: (err) => {
        console.error('Error loading analytics data', err);
        this.status = 'error';
      }
    });
  }

  updateCharts() {
    if (!this.allData) return;

    // Pie Chart
    this.pieChartData.datasets[0].data = [this.allData.estados.activos, this.allData.estados.inactivos];
    this.pieChartData = { ...this.pieChartData };

    // Bar Chart
    this.barChartData.labels = this.allData.distribucion.map(d => d.nombre);
    this.barChartData.datasets[0].data = this.allData.distribucion.map(d => d.cantidad);
    this.barChartData = { ...this.barChartData };

    // Line Chart (Visitas)
    this.updateVisitChart();
  }

  updateVisitChart() {
    if (!this.allData) return;

    let sourceData: { [key: string]: number } = {};
    let labelSuffix = '';

    switch (this.selectedVisitFilter) {
      case 'porDiaSemana':
        // Mapeo de números a nombres de días
        const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        Object.keys(this.allData.visitas.porDiaSemana).forEach(key => {
          sourceData[dias[parseInt(key)]] = this.allData!.visitas.porDiaSemana[key];
        });
        labelSuffix = ' (Promedio por día)';
        break;
      case 'porSemana':
        sourceData = this.allData.visitas.porSemana;
        labelSuffix = ' (Por semana)';
        break;
      case 'porMes':
        sourceData = this.allData.visitas.porMes;
        labelSuffix = ' (Por mes)';
        break;
      default:
        sourceData = this.allData.visitas.ultimos7Dias;
        labelSuffix = ' (Últimos 7 días)';
    }

    const labels = Object.keys(sourceData).sort();
    this.lineChartData.labels = labels;
    this.lineChartData.datasets[0].data = labels.map(l => sourceData[l]);
    this.lineChartData.datasets[0].label = `Visitas${labelSuffix}`;
    this.lineChartData = { ...this.lineChartData };
    this.cdr.detectChanges();
  }

  onFilterChange(event: any) {
    this.selectedVisitFilter = event.target.value;
    this.updateVisitChart();
  }

  onMatFilterChange(event: MatSelectChange) {
    this.selectedVisitFilter = event.value;
    this.updateVisitChart();
  }

  exportData() {
    this.analyticsService.exportToExcel().subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Reporte_Analytics_${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }
}
