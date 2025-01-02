import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  Firestore,
  Timestamp,
  getDocs,
  collection,
} from '@angular/fire/firestore';
import { Chart } from 'chart.js';
import { TrackingService } from '../../../../core/services/tracking.service';
import { FormsModule } from '@angular/forms';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-trackings-chart',
  imports: [FormsModule, NgFor],
  templateUrl: './trackings-chart.component.html',
  styleUrl: './trackings-chart.component.scss',
})
export class TrackingsChartComponent implements OnInit {
  private firestore = inject(Firestore);
  private trackingService = inject(TrackingService);
  private destroyRef = inject(DestroyRef);
  adventuresChart: any;

  years: number[] = [2023, 2024, 2025, 2026, 2027];

  selectedYear: number = new Date().getFullYear();
  adventureSubscription: any;

  ngOnInit(): void {
    this.loadAdventuresChartData();
  }

  loadAdventuresChartData() {
    this.adventureSubscription = this.trackingService
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((adventures) => {
        this.selectedYear = Number(this.selectedYear);
        const startDate = Timestamp.fromDate(
          new Date(`${this.selectedYear}-01-01`)
        );
        const endDate = Timestamp.fromDate(
          new Date(`${this.selectedYear + 1}-01-01`)
        );

        const dateFilteredAdventures = adventures.filter((adventure) => {
          return (
            adventure['createdAt'] >= startDate &&
            adventure['createdAt'] < endDate
          );
        });

        const monthlyAdventureCount = new Array(12).fill(0);

        dateFilteredAdventures.forEach((data) => {
          if (data['createdAt']) {
            const startDate = data['createdAt'].toDate();
            const month = new Date(startDate).getMonth();
            monthlyAdventureCount[month]++;
          }
        });

        const months = Array(12).fill(0);
        const onGoing = [...months];
        const completed = [...months];
        const total = [...months];
        dateFilteredAdventures.forEach((adventure) => {
          const createdAt = adventure['createdAt'].toDate();
          const month = createdAt.getMonth();

          total[month]++;
          if (adventure['onGoing']) {
            onGoing[month]++;
          } else {
            completed[month]++;
          }
        });
        this.renderAdventuresLineChart({ onGoing, completed, total });
      });
  }

  async onYearChange() {
    this.loadAdventuresChartData();
  }

  async getMonthlyAdventuresData(): Promise<{
    onGoing: number[];
    completed: number[];
    total: number[];
  }> {
    const months = Array(12).fill(0);
    const onGoing = [...months];
    const completed = [...months];
    const total = [...months];

    const adventuresSnapshot = await getDocs(
      collection(this.firestore, 'adventures')
    );

    adventuresSnapshot.forEach((doc) => {
      const data = doc.data();
      const createdAt = data['startDate'].toDate();
      const month = createdAt.getMonth();

      total[month]++;
      if (data['onGoing']) {
        onGoing[month]++;
      } else {
        completed[month]++;
      }
    });

    return { onGoing, completed, total };
  }

  renderAdventuresLineChart(monthlyData: {
    onGoing: number[];
    completed: number[];
    total: number[];
  }) {
    if (this.adventuresChart) {
      this.adventuresChart.destroy();
    }
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    this.adventuresChart = new Chart('adventuresChart', {
      type: 'line',
      data: {
        labels: months,
        datasets: [
          {
            label: 'Total',
            data: monthlyData.total,
            borderColor: 'blue',
            backgroundColor: 'rgba(0, 0, 255, 0.2)',
          },
          {
            label: 'Ongoing',
            data: monthlyData.onGoing,
            borderColor: 'green',
            backgroundColor: 'rgba(0, 255, 0, 0.2)',
          },
          {
            label: 'Completed',
            data: monthlyData.completed,
            borderColor: 'red',
            backgroundColor: 'rgba(255, 0, 0, 0.2)',
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Trackings',
            font: {
              size: 32,
              family: 'Arial',
              weight: 'bold',
            },
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Months',
            },
          },
          y: {
            title: {
              display: true,
              text: 'Count',
            },
          },
        },
      },
    });
  }
}
