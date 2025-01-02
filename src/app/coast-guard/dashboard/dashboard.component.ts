import { Component, inject, OnInit, signal } from '@angular/core';
import {
  Firestore,
  collection,
  where,
  getDocs,
  query,
  Query,
} from '@angular/fire/firestore';
import { AlertService } from '../../core/services/alert.service';
import { ReportService } from '../../core/services/report.service';
import { TrackingService } from '../../core/services/tracking.service';
import { Chart, registerables } from 'chart.js';
import { TrackingsChartComponent } from '../trackings/shared/trackings-chart/trackings-chart.component';

Chart.register(...registerables);
const Utils = {
  CHART_COLORS: {
    red: 'rgb(255, 99, 132)',
    orange: 'rgb(255, 159, 64)',
    yellow: 'rgb(255, 205, 86)',
    green: 'rgb(75, 192, 192)',
    blue: 'rgb(54, 162, 235)',
    purple: 'rgb(153, 102, 255)',
    grey: 'rgb(201, 203, 207)',
  },
};

@Component({
  selector: 'app-dashboard',
  imports: [TrackingsChartComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  alertsService = inject(AlertService);
  resolutionsService = inject(ReportService);
  adventuresService = inject(TrackingService);
  firestore = inject(Firestore);

  resolutionsTotalCount = signal<number | null>(null);

  alertsChartData: any = [];

  alertsChart: any;
  resolutionsChart: any;
  usersLineChart: any;
  years: number[] = [2023, 2024, 2025, 2026, 2027]; // List of selectable years
  selectedYear: number = new Date().getFullYear(); // Default to current year

  ngOnInit(): void {
    this.loadAlertsChartData();
    this.loadResolutionsChartData();
  }

  async loadResolutionsChartData() {
    const resolutionsCount = await this.getDocumentCount('reports');
    this.renderPieChart(
      ['Total Resolutions'],
      [resolutionsCount],
      this.resolutionsChart,
      'resolutionsChart'
    );
  }

  async loadAlertsChartData() {
    const alertsCount = await this.getDocumentCount('alerts');
    const unresolvedAlertsCount = await this.getDocumentCount(
      'alerts',
      query(
        collection(this.firestore, 'alerts'),
        where('isResolved', '==', false)
      )
    );
    const resolvedAlertsCount = await this.getDocumentCount(
      'alerts',
      query(
        collection(this.firestore, 'alerts'),
        where('isResolved', '==', true)
      )
    );
    this.renderPieChart(
      ['Total Alerts Recorded', 'Unresolved Alerts', 'Resolved Alerts'],
      [alertsCount, unresolvedAlertsCount, resolvedAlertsCount],
      this.alertsChart,
      'alertsChart'
    );
  }

  async getDocumentCount(collectionName: string, q?: Query) {
    try {
      let q1 = query(collection(this.firestore, collectionName));
      if (q) {
        q1 = q;
      }
      const querySnapshot = await getDocs(q1);
      const count = querySnapshot.size; // snapshot.size gives the number of documents

      return count;
    } catch (error) {
      console.error('Error getting document count:', error);
      return 0;
    }
  }

  renderPieChart(
    dataLabel: string[],
    data: number[],
    chart: any,
    name: string
  ) {
    chart = new Chart(name, {
      type: 'bar',
      data: {
        labels: dataLabel,
        datasets: [
          {
            label: 'Count',
            data: data,
            backgroundColor: [
              'rgb(255, 205, 86)',
              'rgb(54, 162, 235)',
              'rgb(153, 102, 255)',
              'rgb(255, 159, 64)',
              'rgb(255, 99, 132)',
              'rgb(75, 192, 192)',
            ],
          },
        ],
      },
    });
  }
}
