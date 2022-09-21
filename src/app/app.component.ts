import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
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

  constructor(private dashboardService: AdminDashboardService) {}

  ngOnInit(): void {
    this.getTraces();
    this.getCpuUsage();
    this.getSystemHealth();
  }

  private getTraces(): void {
    this.dashboardService.getHttpTraces().subscribe(
      (res) => {
        console.log((res as { traces: Trace[] }).traces);
        this.processTraces((res as { traces: Trace[] }).traces);
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

  public onSelectTrace(trace: Trace): void {
    this.selectedTrace = trace;
    document.getElementById('trace-modal')?.click(); //Click hidden button to open modal
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
