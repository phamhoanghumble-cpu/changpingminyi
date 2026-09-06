CREATE TABLE `materials` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`location` text NOT NULL,
	`event_date` text NOT NULL,
	`created_at` text NOT NULL,
	`files` text NOT NULL,
	`file_count` integer NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL
);
