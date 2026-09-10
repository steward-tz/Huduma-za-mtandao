CREATE TABLE `adminActions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`adminUserId` int NOT NULL,
	`targetUserId` int,
	`action` varchar(100) NOT NULL,
	`details` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `adminActions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `announcements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`message` text NOT NULL,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `announcements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(180) NOT NULL,
	`message` text NOT NULL,
	`isRead` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `serviceUsage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`serviceSlug` varchar(100) NOT NULL,
	`serviceName` varchar(180) NOT NULL,
	`tokensUsed` int NOT NULL,
	`reference` varchar(40) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `serviceUsage_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(100) NOT NULL,
	`name` varchar(180) NOT NULL,
	`description` text NOT NULL,
	`icon` varchar(80) NOT NULL,
	`tokenCost` int NOT NULL DEFAULT 2,
	`isFree` int NOT NULL DEFAULT 0,
	`isLocked` int NOT NULL DEFAULT 0,
	`category` varchar(100) NOT NULL,
	`actionUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `services_id` PRIMARY KEY(`id`),
	CONSTRAINT `services_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `tokenTransactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` varchar(40) NOT NULL,
	`amount` int NOT NULL,
	`serviceSlug` varchar(100),
	`description` text NOT NULL,
	`reference` varchar(40) NOT NULL,
	`balanceAfter` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tokenTransactions_id` PRIMARY KEY(`id`),
	CONSTRAINT `tokenTransactions_reference_unique` UNIQUE(`reference`)
);
--> statement-breakpoint
CREATE TABLE `tutorialVideos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(180) NOT NULL,
	`description` text NOT NULL,
	`videoUrl` text NOT NULL,
	`tokenCost` int NOT NULL DEFAULT 2,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tutorialVideos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `serviceRuns` MODIFY COLUMN `status` varchar(40) NOT NULL DEFAULT 'Imekamilika';--> statement-breakpoint
ALTER TABLE `serviceRuns` ADD `userId` int;--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(32);--> statement-breakpoint
ALTER TABLE `users` ADD `verificationStatus` enum('pending','approved','rejected','blocked') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `tokenBalance` int DEFAULT 0 NOT NULL;