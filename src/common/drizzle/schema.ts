import { relations } from 'drizzle-orm'
import { boolean, foreignKey, integer, pgEnum, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

export const UserType = pgEnum('UserType', ['employee', 'intern'])

export const DiscordUser = pgTable('DiscordUser', {
	id: serial('id').notNull().primaryKey(),
	discordId: text('discordId').notNull().unique(),
	username: text('username').notNull(),
	discriminator: text('discriminator'),
	active: boolean('active').notNull().default(true),
	lastAccess: text('lastAccess'),
	type: UserType('type').notNull().default("employee"),
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

export const DiscordUserRelations = relations(DiscordUser, ({ many }) => ({
	timesheets: many(TimeSheet, {
		relationName: 'DiscordUserToTimeSheet'
	})
}));

export const TimeSheetRelations = relations(TimeSheet, ({ one }) => ({
	discordUser: one(DiscordUser, {
		relationName: 'DiscordUserToTimeSheet',
		fields: [TimeSheet.discordUserId],
		references: [DiscordUser.discordId]
	})
}));