import * as schema from '@app/common/drizzle/schema';
import { InferSelectModel } from 'drizzle-orm';

export type TimeSheetSelect = {
  username: string;
  timeIn: Date | null;
  timeOut: Date | null;
  timeTotal: string | null;
  visibleTotal: number | null;
  expectedTimeOut: Date | null;
  type: 'employee' | 'intern' | null;
};

//models
export type TimeSheetModel = InferSelectModel<typeof schema.TimeSheet>;
export type DiscordUserModel = InferSelectModel<typeof schema.DiscordUser>;
