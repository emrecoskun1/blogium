import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule, RouterLink, BaseChartDirective],
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss']
})
export class StatsComponent implements OnInit {
  stats: any;
  loading = true;
  error: string | null = null;
  selectedPeriod: '7' | '30' | '90' = '30';

  // Line Chart - Views over time
  public viewsChartData: ChartData<'line'> = {
    labels: [],
    datasets: []
  };
  public viewsChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } }
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { font: { size: 11 } }
      }
    }
  };

  // Bar Chart - Engagement metrics
  public engagementChartData: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };
  public engagementChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: { font: { size: 12 } }
      }
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' }
      }
    }
  };

  // Doughnut Chart - Content distribution
  public contentChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: []
  };
  public contentChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: { font: { size: 12 }, padding: 15 }
      }
    }
  };

  public chartType: ChartType = 'line';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    this.error = null;

    this.http.get(`${environment.apiUrl}/stats`).subscribe({
      next: (data: any) => {
        this.stats = data;
        this.loading = false;
        this.prepareChartData();
      },
      error: (err) => {
        console.error('Stats error:', err);
        this.error = 'İstatistikler yüklenemedi. Lütfen giriş yaptığınızdan emin olun.';
        this.loading = false;
      }
    });
  }

  changePeriod(period: '7' | '30' | '90'): void {
    this.selectedPeriod = period;
    this.prepareChartData();
  }

  prepareChartData(): void {
    if (!this.stats?.dailyStats) return;

    const daysToShow = parseInt(this.selectedPeriod);
    const dailyStats = this.stats.dailyStats.slice(-daysToShow);

    // Views Chart
    this.viewsChartData = {
      labels: dailyStats.map((s: any) =>
        new Date(s.date).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' })
      ),
      datasets: [{
        label: 'Görüntüleme',
        data: dailyStats.map((s: any) => s.views),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    };

    // Engagement Chart
    this.engagementChartData = {
      labels: dailyStats.map((s: any) =>
        new Date(s.date).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' })
      ),
      datasets: [
        {
          label: 'Beğeni',
          data: dailyStats.map((s: any) => s.favorites),
          backgroundColor: '#ec4899',
          borderColor: '#ec4899',
          borderWidth: 1
        },
        {
          label: 'Yorum',
          data: dailyStats.map((s: any) => s.comments),
          backgroundColor: '#8b5cf6',
          borderColor: '#8b5cf6',
          borderWidth: 1
        }
      ]
    };

    // Content Distribution Chart
    const totalArticles = this.stats.summary.totalArticles;
    const publishedArticles = totalArticles;
    const draftArticles = 0; // Bu veriye ihtiyacınız varsa backend'den gelmeli

    this.contentChartData = {
      labels: ['Yayınlanan', 'Taslak', 'Planlanmış'],
      datasets: [{
        data: [publishedArticles, draftArticles, 0],
        backgroundColor: ['#10b981', '#f59e0b', '#6366f1'],
        borderWidth: 0
      }]
    };
  }

  getGrowthRate(current: number, previous: number): string {
    if (previous === 0) return '+100';
    const growth = ((current - previous) / previous * 100).toFixed(1);
    return growth.startsWith('-') ? growth : '+' + growth;
  }

  getEngagementRate(): string {
    if (!this.stats?.summary) return '0.0';
    const { totalViews, totalFavorites, totalComments } = this.stats.summary;
    if (totalViews === 0) return '0.0';
    return (((totalFavorites + totalComments) / totalViews) * 100).toFixed(1);
  }

  getAvgViewsPerArticle(): number {
    if (!this.stats?.summary || this.stats.summary.totalArticles === 0) return 0;
    return Math.round(this.stats.summary.totalViews / this.stats.summary.totalArticles);
  }

  public lineChartType: ChartType = 'line';
  public barChartType: ChartType = 'bar';
  public doughnutChartType: ChartType = 'doughnut';
}
