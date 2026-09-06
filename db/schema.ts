import {sqliteTable,text,integer} from 'drizzle-orm/sqlite-core';
export const materials=sqliteTable('materials',{
 id:text('id').primaryKey(),title:text('title').notNull(),content:text('content').notNull(),location:text('location').notNull(),eventDate:text('event_date').notNull(),createdAt:text('created_at').notNull(),files:text('files').notNull(),fileCount:integer('file_count').notNull(),status:text('status').notNull().default('pending'),consent:integer('consent').notNull().default(0)
});
export const votes=sqliteTable('votes',{
 phoneHash:text('phone_hash').primaryKey(),choice:text('choice').notNull(),createdAt:text('created_at').notNull()
});
export const voteLimits=sqliteTable('vote_limits',{
 key:text('key').primaryKey(),count:integer('count').notNull().default(0)
});
