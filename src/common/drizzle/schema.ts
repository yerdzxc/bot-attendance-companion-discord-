import { relations } from 'drizzle-orm'
import { boolean, doublePrecision, foreignKey, integer, pgEnum, pgTable, serial, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'

export const UserType = pgEnum('UserType', ['employee', 'intern'])

export const LeaveType = pgEnum('LeaveType', ['SL', 'VL', 'EL', 'BDL', 'OB'])

export const OvertimeType = pgEnum('OvertimeType', ['pre', 'post', 'rd', 'holiday'])

export const OvertimeStatus = pgEnum('OvertimeStatus', ['pending', 'approved', 'rejected'])

export const DiscordUser = pgTable('DiscordUser', {
	id: serial('id').notNull().primaryKey(),
	discordId: text('discordId').notNull().unique(),
	username: text('username').notNull(),
	discriminator: text('discriminator'),
	active: boolean('active').notNull().default(true),
	lastAccess: text('lastAccess'),
	type: UserType('type').notNull().default("employee"),
	restDay: text('restDay'),
	position: text('position'),
	created_at: timestamp('created_at', { precision: 3 }).notNull().defaultNow(),
	updated_at: timestamp('updated_at', { precision: 3 })
});

export const TimeSheet = pgTable('TimeSheet', {
	id: serial('id').notNull().primaryKey(),
	discordUserId: text('discordUserId').notNull(),
	username: text('username').notNull(),
	timeIn: timestamp('timeIn', { precision: 3 }).notNull(),
	timeOut: timestamp('timeOut', { precision: 3 }),
	timeTotal: text('timeTotal'),
	visibleTotal: integer('visibleTotal'),
	signatureDate: text('signatureDate'),
	expectedTimeOut: timestamp('expectedTimeOut', { precision: 3 }),
	late: boolean('late').notNull(),
	created_at: timestamp('created_at', { precision: 3 }).notNull().defaultNow(),
	updated_at: timestamp('updated_at', { precision: 3 })
}, (TimeSheet) => ({
	'TimeSheet_discordUser_fkey': foreignKey({
		name: 'TimeSheet_discordUser_fkey',
		columns: [TimeSheet.discordUserId],
		foreignColumns: [DiscordUser.discordId]
	})
		.onDelete('cascade')
		.onUpdate('cascade')
}));

export const Leave = pgTable('Leave', {
	id: serial('id').notNull().primaryKey(),
	discordUserId: text('discordUserId').notNull(),
	date: text('date').notNull(),
	type: LeaveType('type').notNull(),
	note: text('note'),
	created_at: timestamp('created_at', { precision: 3 }).notNull().defaultNow(),
	updated_at: timestamp('updated_at', { precision: 3 })
}, (Leave) => ({
	'Leave_discordUser_fkey': foreignKey({
		name: 'Leave_discordUser_fkey',
		columns: [Leave.discordUserId],
		foreignColumns: [DiscordUser.discordId]
	})
		.onDelete('cascade')
		.onUpdate('cascade'),
	'Leave_discordUserId_date_unique_idx': uniqueIndex('Leave_discordUserId_date_key')
		.on(Leave.discordUserId, Leave.date)
}));

export const Holiday = pgTable('Holiday', {
	id: serial('id').notNull().primaryKey(),
	date: text('date').notNull().unique(),
	name: text('name').notNull(),
	recurring: boolean('recurring').notNull(),
	created_at: timestamp('created_at', { precision: 3 }).notNull().defaultNow()
});

export const ActivityLog = pgTable('ActivityLog', {
	id: serial('id').notNull().primaryKey(),
	action: text('action').notNull(),
	targetId: text('targetId'),
	detail: text('detail'),
	created_at: timestamp('created_at', { precision: 3 }).notNull().defaultNow()
});

export const OvertimeRequest = pgTable('OvertimeRequest', {
	id: serial('id').notNull().primaryKey(),
	discordUserId: text('discordUserId').notNull(),
	date: text('date').notNull(),
	hours: doublePrecision('hours').notNull(),
	type: OvertimeType('type').notNull(),
	status: OvertimeStatus('status').notNull().default("pending"),
	note: text('note'),
	created_at: timestamp('created_at', { precision: 3 }).notNull().defaultNow(),
	updated_at: timestamp('updated_at', { precision: 3 })
});

export const DiscordUserRelations = relations(DiscordUser, ({ many }) => ({
	timesheets: many(TimeSheet, {
		relationName: 'DiscordUserToTimeSheet'
	}),
	leaves: many(Leave, {
		relationName: 'DiscordUserToLeave'
	})
}));

export const TimeSheetRelations = relations(TimeSheet, ({ one }) => ({
	discordUser: one(DiscordUser, {
		relationName: 'DiscordUserToTimeSheet',
		fields: [TimeSheet.discordUserId],
		references: [DiscordUser.discordId]
	})
}));

export const LeaveRelations = relations(Leave, ({ one }) => ({
	discordUser: one(DiscordUser, {
		relationName: 'DiscordUserToLeave',
		fields: [Leave.discordUserId],
		references: [DiscordUser.discordId]
	})
}));