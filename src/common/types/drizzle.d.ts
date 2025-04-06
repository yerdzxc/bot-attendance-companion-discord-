import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@app/common/drizzle/schema';

export type DrizzleService = NodePgDatabase<typeof schema>;
