import { Component } from '@angular/core';
import { SystemCpu } from './interfaces/system-cpu';
import { SystemHealth } from './interfaces/system-health';
import { AdminDashboardService } from './services/admin-dashboard/admin-dashboard.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  public traceList: unknown[] = [];
  public selectTrace: unknown;
  public systemHealth: SystemHealth = {} as SystemHealth;
  public systemCpu: SystemCpu = {} as SystemCpu;
  public processUpTime = '';
  public http200Traces: unknown[] = [];
  public http240Traces: unknown[] = [];
  public http404Traces: unknown[] = [];
  public http500Traces: unknown[] = [];
  public httpDefaultTraces: unknown[] = [];

  // constructor(private dashboardService: AdminDashboardService) {}

  // private getTraces(): void {
  //   this.dashboardService.getHttpTraces().subscribe((res: unknown) => {
  //     console.log(res);
  //   });
  // }
}
