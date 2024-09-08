CREATE TABLE `providers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`api_base` text NOT NULL,
	`api_key` text NOT NULL,
	`models` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `request_log` (
	`id` text PRIMARY KEY NOT NULL,
	`model_id` text NOT NULL,
	`request_time` integer NOT NULL,
	`latency` integer NOT NULL,
	`status_code` integer NOT NULL,
	`response` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
