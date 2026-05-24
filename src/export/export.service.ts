import { Injectable } from '@nestjs/common';
import { TimeSheetService } from '@app/time-sheet/time-sheet.service';
import * as moment from 'moment';

@Injectable()
export class ExportService {
  constructor(private readonly timeSheetService: TimeSheetService) {}

  async generateCsv(from: string, to: string, type: 'employee' | 'intern' = 'employee'): Promise<string> {
    const { records, users } = await this.timeSheetService.getAttendanceRange(from, to, type);

    const start = moment(from);
    const end = moment(to);
    const dates: string[] = [];
    const current = start.clone();
    while (current.diff(end) <= 0) {
      dates.push(current.format('YYYY-MM-DD'));
      current.add(1, 'day');
    }

    const dayLabels: string[] = [];
    for (const date of dates) {
      dayLabels.push(moment(date).format('dddd'));
    }

    const dateDisplay: string[] = [];
    for (const date of dates) {
      dateDisplay.push(moment(date).format('MMM D, YYYY'));
    }

    const recordMap = new Map<string, Map<string, { timeIn: string; timeOut: string }>>();
    for (const r of records) {
      if (!recordMap.has(r.discordUserId)) {
        recordMap.set(r.discordUserId, new Map());
      }
      const userDates = recordMap.get(r.discordUserId)!;
      const dateKey = r.signatureDate || '';
      const timeIn = r.timeIn ? moment(r.timeIn).format('HH:mm') : '';
      const timeOut = r.timeOut ? moment(r.timeOut).format('HH:mm') : '';
      userDates.set(dateKey, { timeIn, timeOut });
    }

    const rows: string[][] = [];
    const header1: string[] = ['NAMES', ''];
    const header2: string[] = ['SURNAME', 'GIVEN NAME'];
    const dayRow: string[] = ['', ''];

    for (let i = 0; i < dates.length; i++) {
      header1.push(dateDisplay[i], '');
      header2.push('Time in', 'Time out');
      dayRow.push(dayLabels[i], '');
    }

    rows.push(header1, header2, dayRow);

    for (const user of users) {
      let surname = '';
      let givenName = user.username;
      const commaIdx = user.username.indexOf(',');
      if (commaIdx > -1) {
        surname = user.username.substring(0, commaIdx).trim();
        givenName = user.username.substring(commaIdx + 1).trim();
      } else {
        const spaceIdx = user.username.indexOf(' ');
        if (spaceIdx > -1) {
          surname = user.username.substring(0, spaceIdx).trim();
          givenName = user.username.substring(spaceIdx + 1).trim();
        }
      }
      const row: string[] = [surname, givenName];
      const userDates = recordMap.get(user.discordId) || new Map();

      for (const date of dates) {
        const entry = userDates.get(date);
        if (entry) {
          row.push(entry.timeIn, entry.timeOut);
        } else {
          row.push('', '');
        }
      }
      rows.push(row);
    }

    return '\uFEFF' + rows.map(r => r.map(cell => this.escapeCsv(cell)).join(',')).join('\r\n');
  }

  private escapeCsv(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }
}
