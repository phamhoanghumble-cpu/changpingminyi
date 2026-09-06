CREATE TABLE `vote_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `votes` (
	`phone_hash` text PRIMARY KEY NOT NULL,
	`choice` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `materials` ADD `consent` integer DEFAULT 0 NOT NULL;