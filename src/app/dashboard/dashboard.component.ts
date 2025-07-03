import { Component, OnInit } from '@angular/core';
import { DashboardService, DashboardSummary } from '../services/dashboard.service';
import { Chart, registerables } from 'chart.js'; // Importa Chart e registerables para usar os tipos de gráfico

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  summaryData: DashboardSummary | null = null;
  loading: boolean = true;
  error: string | null = null;

  // Variáveis para guardar as instâncias dos gráficos
  farmByStateChart: Chart | undefined;
  culturesSummaryChart: Chart | undefined;
  areaBySoilUseChart: Chart | undefined;

  constructor(private dashboardService: DashboardService) {
    Chart.register(...registerables); // Registra todos os tipos de gráfico, escalas etc.
  }

  ngOnInit(): void {
    this.fetchDashboardSummary();
  }

  fetchDashboardSummary(): void {
    this.loading = true;
    this.error = null;
    this.dashboardService.getDashboardSummary().subscribe({
      next: (data) => {
        this.summaryData = data;
        this.loading = false;
        this.renderCharts(); // Renderiza os gráficos após carregar os dados
      },
      error: (err) => {
        console.error('Error fetching dashboard summary:', err);
        this.error = 'Failed to load dashboard data. Please try again.';
        this.loading = false;
      }
    });
  }

  renderCharts(): void {
    if (!this.summaryData) return;

    // Destroi gráficos existentes para evitar duplicidade ao recarregar dados
    if (this.farmByStateChart) this.farmByStateChart.destroy();
    if (this.culturesSummaryChart) this.culturesSummaryChart.destroy();
    if (this.areaBySoilUseChart) this.areaBySoilUseChart.destroy();

    // Chart 1: Farms by State (Bar Chart)
    const farmsByStateCtx = document.getElementById('farmsByStateChart') as HTMLCanvasElement;
    if (farmsByStateCtx) {
      this.farmByStateChart = new Chart(farmsByStateCtx, {
        type: 'bar',
        data: {
          labels: Object.keys(this.summaryData.farms_by_state),
          datasets: [{
            label: 'Number of Farms',
            data: Object.values(this.summaryData.farms_by_state),
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Number of Farms'
              }
            },
            x: {
              title: {
                display: true,
                text: 'State'
              }
            }
          },
          plugins: {
            title: {
              display: true,
              text: 'Farms by State'
            }
          }
        }
      });
    }

    // Chart 2: Cultures Summary (Pie Chart)
    const culturesSummaryCtx = document.getElementById('culturesSummaryChart') as HTMLCanvasElement;
    if (culturesSummaryCtx) {
      this.culturesSummaryChart = new Chart(culturesSummaryCtx, {
        type: 'pie',
        data: {
          labels: Object.keys(this.summaryData.cultures_summary),
          datasets: [{
            label: 'Number of Occurrences',
            data: Object.values(this.summaryData.cultures_summary),
            backgroundColor: [
              'rgba(255, 99, 132, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(75, 192, 192, 0.6)',
              'rgba(153, 102, 255, 0.6)',
              'rgba(255, 159, 64, 0.6)'
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Cultures Summary'
            }
          }
        }
      });
    }

    // Chart 3: Area by Soil Use (Doughnut Chart)
    const areaBySoilUseCtx = document.getElementById('areaBySoilUseChart') as HTMLCanvasElement;
    if (areaBySoilUseCtx) {
      this.areaBySoilUseChart = new Chart(areaBySoilUseCtx, {
        type: 'doughnut',
        data: {
          labels: ['Agricultural Area', 'Vegetation Area'],
          datasets: [{
            label: 'Area in Hectares',
            data: [this.summaryData.area_by_soil_use.agricultural, this.summaryData.area_by_soil_use.vegetation],
            backgroundColor: [
              'rgba(255, 159, 64, 0.6)', // Laranja para agrícola
              'rgba(75, 192, 192, 0.6)'  // Azul-verde para vegetação
            ],
            borderColor: [
              'rgba(255, 159, 64, 1)',
              'rgba(75, 192, 192, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Area by Soil Use'
            }
          }
        }
      });
    }
  }
}