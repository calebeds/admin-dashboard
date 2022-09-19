import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SystemCpu } from 'src/app/interfaces/system-cpu';
import { SystemHealth } from 'src/app/interfaces/system-health';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AdminDashboardService {
  private SERVER_URL = environment.serverUlr;

  constructor(private http: HttpClient) {}

  public getHttpTraces(): Observable<unknown> {
    return this.http.get<unknown>(`${this.SERVER_URL}/httptrace`);
  }

  public getSystemHealth(): Observable<SystemHealth> {
    return this.http.get<SystemHealth>(`${this.SERVER_URL}/health`);
  }

  public getSystemCpu(): Observable<SystemCpu> {
    return this.http.get<SystemCpu>(
      `${this.SERVER_URL}/metrics/system.cup.count`
    );
  }

  public getProcessUptime(): Observable<unknown> {
    return this.http.get<unknown>(`${this.SERVER_URL}/metrics/process.uptime`);
  }
}
