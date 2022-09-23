import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Chart, ChartItem, registerables } from 'chart.js';
import { SystemCpu } from './interfaces/system-cpu';
import { SystemHealth } from './interfaces/system-health';
import { AdminDashboardService } from './services/admin-dashboard/admin-dashboard.service';

type Trace = {
  timestamp: string;
  principal: unknown;
  session: unknown;
  request: {
    method: string;
    uri: string;
    remoteAddress: unknown;
    headers: { origin: string; ['user-agent']: string };
  };
  response: {
    status: number;
    headers: {
      ['Date']: string;
      ['Content-Type']: string;
      ['Access-Control-Allow-Origin']: string;
    };
  };
  timeTaken: number;
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  public traceList: Trace[] = [];
  public selectedTrace!: Trace;
  public systemHealth: SystemHealth = {} as SystemHealth;
  public systemCpu: SystemCpu = {} as SystemCpu;
  public processUpTime = '';
  public http200Traces: Trace[] = [];
  public http400Traces: Trace[] = [];
  public http404Traces: Trace[] = [];
  public http500Traces: Trace[] = [];
  public httpDefaultTraces: Trace[] = [];
  public timestamp = 0;
  public barChart!: Chart;
  public pieChart!: Chart;
  public readonly pageSize = 10;
  public page = 1;

  constructor(private dashboardService: AdminDashboardService) {}

  ngOnInit(): void {
    this.getTraces();
    this.getCpuUsage();
    this.getSystemHealth();
    this.getProcessUpTime(true);
  }

  private initializeBarChart(): void {
    if (this.barChart) this.barChart.destroy();
    Chart.register(...registerables);
    const barChartElement = document.getElementById('barChart');
    this.barChart = new Chart(<ChartItem>barChartElement, {
      type: 'bar',
      data: {
        labels: ['200', '404', '400', '500'],
        datasets: [
          {
            data: [
              this.http200Traces.length,
              this.http404Traces.length,
              this.http400Traces.length,
              this.http500Traces.length,
            ],
            backgroundColor: [
              'rgb(40, 167, 69)',
              'rgb(0, 123, 255)',
              'rgb(253, 126, 20)',
              'rgb(220, 53, 69)',
            ],
            borderColor: [
              'rgb(40, 167, 69)',
              'rgb(0, 123, 255)',
              'rgb(253, 126, 20)',
              'rgb(220, 53, 69)',
            ],
            borderWidth: 3,
          },
        ],
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: [
              `Last 100 Requests as of ${new Date().toLocaleDateString(
                'en-US'
              )}`,
            ],
          },
          legend: { display: false },
        },
        scales: {
          x: {
            min: 0,
          },
        },
      },
    });
  }

  private initializePieChart(): void {
    if (this.pieChart) this.pieChart.destroy();
    Chart.register(...registerables);

    const pieChartElement = document.getElementById('pieChart');
    this.pieChart = new Chart(<ChartItem>pieChartElement, {
      type: 'pie',
      data: {
        labels: ['200', '404', '400', '500'],
        datasets: [
          {
            data: [
              this.http200Traces.length,
              this.http404Traces.length,
              this.http400Traces.length,
              this.http500Traces.length,
            ],
            backgroundColor: [
              'rgb(40, 167, 69)',
              'rgb(0, 123, 255)',
              'rgb(253, 126, 20)',
              'rgb(220, 53, 69)',
            ],
            borderColor: [
              'rgb(40, 167, 69)',
              'rgb(0, 123, 255)',
              'rgb(253, 126, 20)',
              'rgb(220, 53, 69)',
            ],
            borderWidth: 3,
          },
        ],
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: [
              `Last 100 Requests as of ${new Date().toLocaleDateString(
                'en-US'
              )}`,
            ],
          },
          legend: { display: true },
        },
      },
    });
  }

  public onSelectTrace(trace: Trace): void {
    this.selectedTrace = trace;
    document.getElementById('trace-modal')?.click(); //Click hidden button to open modal
  }

  private getTraces(): void {
    this.dashboardService.getHttpTraces().subscribe(
      (res) => {
        console.log((res as { traces: Trace[] }).traces);
        this.processTraces((res as { traces: Trace[] }).traces);
        this.initializeBarChart();
        this.initializePieChart();
      },
      (error: HttpErrorResponse) => {
        console.error(error.message);
      }
    );
  }

  private getCpuUsage(): void {
    this.dashboardService.getSystemCpu().subscribe(
      (res: SystemCpu) => {
        console.log(res);
        this.systemCpu = res;
      },
      (error: HttpErrorResponse) => {
        console.error(error.message);
      }
    );
  }

  private getSystemHealth(): void {
    this.dashboardService.getSystemHealth().subscribe(
      (res: SystemHealth) => {
        console.log(res);
        this.systemHealth = res;
        this.formatBytes();
      },
      (error: HttpErrorResponse) => {
        console.error(error.message);
      }
    );
  }

  public onRefreshData(): void {
    this.resetArrays();
    this.getTraces();
    this.getCpuUsage();
    this.getSystemHealth();
    this.getProcessUpTime(false);
  }

  private resetArrays(): void {
    this.http200Traces = [];
    this.http400Traces = [];
    this.http404Traces = [];
    this.http500Traces = [];
    this.httpDefaultTraces = [];
  }

  private getProcessUpTime(isUpdateTime: boolean): void {
    this.dashboardService.getProcessUptime().subscribe(
      (res) => {
        console.log(res);
        this.timestamp = Math.round(
          (res as { measurements: { value: number }[] }).measurements[0].value
        );
        this.processUpTime = this.formatUpTime(this.timestamp);
        if (isUpdateTime) this.updateTime();
      },
      (error: HttpErrorResponse) => {
        console.error(error.message);
      }
    );
  }

  private processTraces(traces: Trace[]): void {
    this.traceList = traces;
    this.traceList?.forEach((trace) => {
      switch (trace.response.status) {
        case 200:
          this.http200Traces?.push(trace);
          break;
        case 400:
          this.http400Traces?.push(trace);
          break;
        case 404:
          this.http404Traces?.push(trace);
          break;
        case 500:
          this.http500Traces?.push(trace);
          break;
        default:
          this.httpDefaultTraces?.push(trace);
      }
    });
  }

  private updateTime(): void {
    setInterval(() => {
      ++this.timestamp;
      this.processUpTime = this.formatUpTime(this.timestamp);
    }, 1000);
  }

  private formatUpTime(timestamp: number): string {
    const hours = Math.floor(timestamp / 60 / 60);
    const minutes = Math.floor(timestamp / 60) - hours * 60;
    const seconds = timestamp % 60;
    return `${hours.toString().padStart(2, '0')}h ${minutes
      .toString()
      .padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
  }

  private formatBytes(): void {
    const bytes = this.systemHealth.components.diskSpace.details.free;
    if (bytes === 0) {
      this.systemHealth.components.diskSpace.details.free = '0 Bytes';
      return;
    }

    const k = 1024;
    const dm = 2 < 0 ? 0 : 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes as number) / Math.log(k));
    this.systemHealth.components.diskSpace.details.free =
      parseFloat(((bytes as number) / Math.pow(k, i)).toFixed(dm)) +
      ' ' +
      sizes[i];
  }
}
