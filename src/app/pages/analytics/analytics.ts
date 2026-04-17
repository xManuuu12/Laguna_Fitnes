import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { AnalyticsService, AnalyticsData } from '../../services/analytics.service';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatCardModule, BaseChartDirective],
  templateUrl: './analytics.html',
  styleUrls: ['./analytics.css']
})
export class AnalyticsComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);

  // Chart: Miembros Activos vs Inactivos (Pie)
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      }
    }
  };
  public pieChartData: ChartData<'pie', number[], string | string[]> = {
    labels: ['Activos', 'Inactivos'],
    datasets: [{
      data: [0, 0],
      backgroundColor: ['#4ade80', '#f87171']
    }]
  };
  public pieChartType: ChartType = 'pie';

  // Chart: Distribución de Membresías (Bar)
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      x: {},
      y: {
        min: 0
      }
    },
    plugins: {
      legend: {
        display: true,
      }
    }
  };
  public barChartType: ChartType = 'bar';
  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      { data: [], label: 'Miembros por Plan', backgroundColor: '#3b82f6' }
    ]
  };

  // Chart: Visitas últinos 7 días (Line)
  public lineChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Visitas Diarias',
        fill: true,
        tension: 0.5,
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.3)'
      }
    ]
  };
  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.analyticsService.getDashboardData().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const data = response.data;
          this.updateCharts(data);
        }
      },
      error: (err) => console.error('Error loading analytics data', err)
    });
  }

  updateCharts(data: AnalyticsData) {
    // Pie Chart
    this.pieChartData.datasets[0].data = [data.estados.activos, data.estados.inactivos];

    // Bar Chart
    this.barChartData.labels = data.distribucion.map(d => d.nombre);
    this.barChartData.datasets[0].data = data.distribucion.map(d => d.cantidad);

    // Line Chart
    const dates = Object.keys(data.visitas.ultimos7Dias).sort();
    this.lineChartData.labels = dates;
    this.lineChartData.datasets[0].data = dates.map(date => data.visitas.ultimos7Dias[date]);

    // Force chart update if necessary (sometimes required for standalone)
    // In ng2-charts 4+, it should be automatic if data object reference is kept but updated internally
    // or by replacing the whole data object.
    this.pieChartData = { ...this.pieChartData };
    this.barChartData = { ...this.barChartData };
    this.lineChartData = { ...this.lineChartData };
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
