/**
 * 一次性 D1 初始化 SQL（合并 drizzle/0000 + 0001 + 0002）
 * 命令：wrangler d1 execute jiancai-road --remote --file=./drizzle/init.sql
 */
CREATE TABLE IF NOT EXISTS `materials` (
  `id` text PRIMARY KEY NOT NULL,
  `title` text NOT NULL,
  `category` text NOT NULL DEFAULT 'uncategorized',
  `content` text NOT NULL,
  `location` text NOT NULL DEFAULT '',
  `event_date` text NOT NULL DEFAULT '',
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL DEFAULT '',
  `editor_id` text NOT NULL DEFAULT '',
  `files` text NOT NULL,
  `file_count` integer NOT NULL,
  `status` text NOT NULL DEFAULT 'pending',
  `consent` integer NOT NULL DEFAULT 0,
  `revisions` text NOT NULL DEFAULT '[]'
);
CREATE INDEX IF NOT EXISTS `materials_status_created_idx`
  ON `materials` (`status`, `created_at` DESC);
CREATE INDEX IF NOT EXISTS `materials_status_consent_created_idx`
  ON `materials` (`status`, `consent`, `created_at` DESC);

CREATE TABLE IF NOT EXISTS `vote_limits` (
  `key` text PRIMARY KEY NOT NULL,
  `count` integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS `votes` (
  `phone_hash` text PRIMARY KEY NOT NULL,
  `choice` text NOT NULL,
  `created_at` text NOT NULL
);

CREATE TABLE IF NOT EXISTS `material_replies` (
  `id` text PRIMARY KEY NOT NULL,
  `material_id` text NOT NULL,
  `source` text NOT NULL,
  `department` text NOT NULL DEFAULT '',
  `content` text NOT NULL,
  `files` text NOT NULL DEFAULT '[]',
  `created_at` text NOT NULL,
  `created_by` text NOT NULL DEFAULT '',
  FOREIGN KEY (`material_id`) REFERENCES `materials`(`id`) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS `material_replies_material_idx`
  ON `material_replies` (`material_id`, `created_at` DESC);

CREATE TABLE IF NOT EXISTS `material_revisions` (
  `id` text PRIMARY KEY NOT NULL,
  `material_id` text NOT NULL,
  `editor_id` text NOT NULL,
  `editor_label` text NOT NULL DEFAULT '',
  `field` text NOT NULL,
  `before` text NOT NULL,
  `after` text NOT NULL,
  `created_at` text NOT NULL,
  FOREIGN KEY (`material_id`) REFERENCES `materials`(`id`) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS `material_revisions_material_idx`
  ON `material_revisions` (`material_id`, `created_at` DESC);