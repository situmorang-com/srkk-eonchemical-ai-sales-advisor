CREATE TABLE `account_product_history` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`product_id` text NOT NULL,
	`volume_kg` real NOT NULL,
	`total_value` real NOT NULL,
	`purchase_date` text NOT NULL,
	`is_recurring` integer DEFAULT false NOT NULL,
	`notes` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `aph_account_idx` ON `account_product_history` (`account_id`);--> statement-breakpoint
CREATE INDEX `aph_product_idx` ON `account_product_history` (`product_id`);--> statement-breakpoint
CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`industry_id` text NOT NULL,
	`assigned_user_id` text,
	`country` text DEFAULT 'Australia' NOT NULL,
	`state` text,
	`city` text,
	`annual_revenue` real,
	`employee_count` integer,
	`website` text,
	`status` text DEFAULT 'active' NOT NULL,
	`tier` text DEFAULT 'standard' NOT NULL,
	`tags` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`industry_id`) REFERENCES `industries`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`assigned_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `activities` (
	`id` text PRIMARY KEY NOT NULL,
	`opportunity_id` text,
	`account_id` text,
	`user_id` text,
	`type` text NOT NULL,
	`subject` text NOT NULL,
	`description` text,
	`outcome` text,
	`activity_date` text NOT NULL,
	`duration_minutes` integer,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`opportunity_id`) REFERENCES `opportunities`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `act_opportunity_idx` ON `activities` (`opportunity_id`);--> statement-breakpoint
CREATE INDEX `act_account_idx` ON `activities` (`account_id`);--> statement-breakpoint
CREATE TABLE `industries` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`code` text NOT NULL,
	`description` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `industries_code_unique` ON `industries` (`code`);--> statement-breakpoint
CREATE TABLE `notes` (
	`id` text PRIMARY KEY NOT NULL,
	`opportunity_id` text,
	`account_id` text,
	`user_id` text,
	`content` text NOT NULL,
	`is_pinned` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`opportunity_id`) REFERENCES `opportunities`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `opportunities` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`assigned_user_id` text,
	`stage_id` text NOT NULL,
	`primary_product_id` text,
	`name` text NOT NULL,
	`value` real NOT NULL,
	`currency` text DEFAULT 'AUD' NOT NULL,
	`close_date` text NOT NULL,
	`problem_statement` text,
	`use_case` text,
	`competitor_notes` text,
	`lost_reason` text,
	`is_stalled` integer DEFAULT false NOT NULL,
	`stalled_days` integer DEFAULT 0 NOT NULL,
	`risk_level` text DEFAULT 'low' NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`assigned_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`stage_id`) REFERENCES `opportunity_stages`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`primary_product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `opp_account_idx` ON `opportunities` (`account_id`);--> statement-breakpoint
CREATE INDEX `opp_user_idx` ON `opportunities` (`assigned_user_id`);--> statement-breakpoint
CREATE INDEX `opp_stage_idx` ON `opportunities` (`stage_id`);--> statement-breakpoint
CREATE TABLE `opportunity_stages` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`code` text NOT NULL,
	`order` integer NOT NULL,
	`probability` real NOT NULL,
	`description` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `opportunity_stages_code_unique` ON `opportunity_stages` (`code`);--> statement-breakpoint
CREATE TABLE `product_families` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`code` text NOT NULL,
	`description` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `product_families_code_unique` ON `product_families` (`code`);--> statement-breakpoint
CREATE TABLE `product_industry_fit` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`industry_id` text NOT NULL,
	`fit_score` real NOT NULL,
	`use_case` text,
	`notes` text,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`industry_id`) REFERENCES `industries`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `pif_product_industry_idx` ON `product_industry_fit` (`product_id`,`industry_id`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`family_id` text NOT NULL,
	`name` text NOT NULL,
	`sku` text NOT NULL,
	`description` text,
	`unit_price` real NOT NULL,
	`uom` text DEFAULT 'kg' NOT NULL,
	`primary_use_case` text,
	`key_benefits` text,
	`typical_volume_kg` real,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`family_id`) REFERENCES `product_families`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_sku_unique` ON `products` (`sku`);--> statement-breakpoint
CREATE TABLE `recommendations` (
	`id` text PRIMARY KEY NOT NULL,
	`opportunity_id` text,
	`account_id` text,
	`primary_product_id` text,
	`upsell_product_id` text,
	`cross_sell_product_id` text,
	`confidence_score` real NOT NULL,
	`industry_fit_score` real NOT NULL,
	`similar_account_score` real NOT NULL,
	`affinity_score` real NOT NULL,
	`use_case_fit_score` real NOT NULL,
	`primary_reasoning` text NOT NULL,
	`upsell_reasoning` text,
	`cross_sell_reasoning` text,
	`next_best_action` text NOT NULL,
	`action_reasoning` text,
	`is_adopted` integer DEFAULT false,
	`generated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`opportunity_id`) REFERENCES `opportunities`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`primary_product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`upsell_product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`cross_sell_product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `rec_opportunity_idx` ON `recommendations` (`opportunity_id`);--> statement-breakpoint
CREATE INDEX `rec_account_idx` ON `recommendations` (`account_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`role` text DEFAULT 'sales_rep' NOT NULL,
	`avatar_url` text,
	`territory` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);