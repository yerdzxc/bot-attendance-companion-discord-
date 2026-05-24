import { Body, Controller, Delete, Get, Post, Put, Query, Res, Header } from '@nestjs/common';
import { ExportService } from './export.service';
import { TimeSheetService } from '@app/time-sheet/time-sheet.service';
import { UserService } from '@app/user/user.service';
import { HolidayService } from '@app/holiday/holiday.service';
import { LeaveService } from '@app/leave/leave.service';
import { FastifyReply } from 'fastify';

@Controller()
export class ExportController {
  constructor(
    private readonly exportService: ExportService,
    private readonly timeSheetService: TimeSheetService,
    private readonly userService: UserService,
    private readonly holidayService: HolidayService,
    private readonly leaveService: LeaveService,
  ) {}

  @Get('export')
  @Header('Content-Type', 'text/html')
  async exportPage(): Promise<string> {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>KargaX Attendance Export</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; color: #333; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
  .card { background: white; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.1); padding: 32px; width: 100%; max-width: 480px; }
  h1 { font-size: 20px; margin-bottom: 4px; }
  p { color: #666; font-size: 14px; margin-bottom: 24px; }
  .form-group { margin-bottom: 16px; }
  label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: #444; }
  input, select { width: 100%; padding: 10px 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; outline: none; transition: border-color 0.2s; }
  input:focus, select:focus { border-color: #5865F2; }
  .row { display: flex; gap: 12px; }
  .row .form-group { flex: 1; }
  button { width: 100%; padding: 12px; background: #5865F2; color: white; border: none; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; transition: background 0.2s; margin-top: 8px; }
  button:hover { background: #4752C4; }
  button:disabled { background: #999; cursor: not-allowed; }
  .error { color: #d32f2f; font-size: 13px; margin-top: 8px; display: none; }
  .info { font-size: 12px; color: #888; margin-top: 16px; text-align: center; }
</style>
</head>
<body>
<div class="card">
  <h1>Attendance Export</h1>
  <p>Select date range and download CSV for Google Sheets</p>
  <form id="exportForm">
    <div class="row">
      <div class="form-group">
        <label for="from">From</label>
        <input type="date" id="from" required>
      </div>
      <div class="form-group">
        <label for="to">To</label>
        <input type="date" id="to" required>
      </div>
    </div>
    <div class="form-group">
      <label for="type">Type</label>
      <select id="type">
        <option value="employee">Employee</option>
        <option value="intern">Intern</option>
      </select>
    </div>
    <button type="submit" id="downloadBtn">Download CSV</button>
    <div class="error" id="errorMsg">Please select a valid date range.</div>
  </form>
  <div class="info">File will be in CSV format compatible with Google Sheets</div>
</div>
<script>
  document.getElementById('exportForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const from = document.getElementById('from').value;
    const to = document.getElementById('to').value;
    const type = document.getElementById('type').value;
    const error = document.getElementById('errorMsg');
    const btn = document.getElementById('downloadBtn');

    if (!from || !to) {
      error.style.display = 'block';
      return;
    }
    error.style.display = 'none';
    btn.disabled = true;
    btn.textContent = 'Downloading...';

    try {
      const response = await fetch('/api/export?from=' + from + '&to=' + to + '&type=' + type);
      if (!response.ok) throw new Error('Export failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'KargaX Attendance ' + from + ' to ' + to + '.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      error.textContent = 'Failed to export. Make sure you have network access to the API.';
      error.style.display = 'block';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Download CSV';
    }
  });

  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const fmt = (d) => d.toISOString().split('T')[0];
  document.getElementById('from').value = fmt(monday);
  document.getElementById('to').value = fmt(sunday);
</script>
</body>
</html>`;
  }

  @Get('api/export')
  async exportCsv(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('type') type: 'employee' | 'intern' = 'employee',
    @Res() res: FastifyReply,
  ) {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const fmt = (d: Date) => d.toISOString().split('T')[0];

    const fromDate = from || fmt(monday);
    const toDate = to || fmt(sunday);

    const csv = await this.exportService.generateCsv(fromDate, toDate, type);
    res.header('Content-Type', 'text/csv; charset=utf-8');
    res.header('Content-Disposition', `attachment; filename="KargaX Attendance ${fromDate} to ${toDate}.csv"`);
    res.send(csv);
  }

  @Get('api/export/data')
  async exportData(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('type') type: 'employee' | 'intern' = 'employee',
  ) {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const fmt = (d: Date) => d.toISOString().split('T')[0];

    const fromDate = from || fmt(monday);
    const toDate = to || fmt(sunday);

    return this.timeSheetService.getAttendanceRange(fromDate, toDate, type);
  }

  @Post('api/set-name')
  async setName(@Body() body: { discordId: string; username: string }): Promise<string> {
    return this.userService.setName(body.discordId, body.username);
  }

  @Post('api/set-rest-day')
  async setRestDay(@Body() body: { discordId: string; restDay: string | null }): Promise<string> {
    return this.userService.setRestDay(body.discordId, body.restDay);
  }

  @Get('api/holidays')
  async listHolidays() {
    return this.holidayService.list();
  }

  @Post('api/holidays')
  async upsertHoliday(@Body() body: { date: string; name: string }): Promise<string> {
    return this.holidayService.upsert(body.date, body.name);
  }

  @Delete('api/holidays')
  async removeHoliday(@Query('date') date: string): Promise<string> {
    return this.holidayService.remove(date);
  }

  @Get('api/leaves')
  async listLeaves(@Query('from') from?: string, @Query('to') to?: string) {
    return this.leaveService.list(from, to);
  }

  @Post('api/leaves')
  async upsertLeave(@Body() body: { discordId: string; date: string; type: string; note?: string }): Promise<string> {
    return this.leaveService.upsert(body.discordId, body.date, body.type, body.note);
  }

  @Delete('api/leaves')
  async removeLeave(@Query('discordId') discordId: string, @Query('date') date: string): Promise<string> {
    return this.leaveService.remove(discordId, date);
  }

  @Get('api/users/inactive')
  async listInactive(@Query('type') type?: 'employee' | 'intern') {
    return this.userService.listInactive(type);
  }

  @Post('api/users/set-active')
  async setActive(@Body() body: { discordId: string; active: boolean }): Promise<string> {
    return this.userService.setActive(body.discordId, body.active);
  }
}
