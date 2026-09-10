CREATE TABLE `advertisements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(180) NOT NULL,
	`description` text NOT NULL,
	`imageUrl` text,
	`linkUrl` text,
	`startAt` timestamp,
	`endAt` timestamp,
	`status` varchar(30) NOT NULL DEFAULT 'draft',
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `advertisements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `appearanceSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`websiteName` varchar(180) NOT NULL DEFAULT 'HUDUMA ZA MTANDAONI',
	`primaryColor` varchar(20) NOT NULL DEFAULT '#18b969',
	`secondaryColor` varchar(20) NOT NULL DEFAULT '#071a36',
	`backgroundColor` varchar(20) NOT NULL DEFAULT '#071a36',
	`textColor` varchar(20) NOT NULL DEFAULT '#ffffff',
	`borderRadius` int NOT NULL DEFAULT 12,
	`logoUrl` text,
	`faviconUrl` text,
	`darkMode` int NOT NULL DEFAULT 1,
	`updatedBy` int,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `appearanceSettings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `languages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(10) NOT NULL,
	`name` varchar(80) NOT NULL,
	`isActive` int NOT NULL DEFAULT 1,
	CONSTRAINT `languages_id` PRIMARY KEY(`id`),
	CONSTRAINT `languages_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`senderId` int NOT NULL,
	`recipientId` int,
	`subject` varchar(180) NOT NULL,
	`body` text NOT NULL,
	`isBroadcast` int NOT NULL DEFAULT 0,
	`isRead` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `permissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(100) NOT NULL,
	`name` varchar(120) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `permissions_id` PRIMARY KEY(`id`),
	CONSTRAINT `permissions_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `rolePermissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`roleId` int NOT NULL,
	`permissionId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `rolePermissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(50) NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `roles_id` PRIMARY KEY(`id`),
	CONSTRAINT `roles_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `systemSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`settingKey` varchar(120) NOT NULL,
	`settingValue` text NOT NULL,
	`updatedBy` int,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `systemSettings_id` PRIMARY KEY(`id`),
	CONSTRAINT `systemSettings_settingKey_unique` UNIQUE(`settingKey`)
);
--> statement-breakpoint
CREATE TABLE `userPermissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`permissionId` int NOT NULL,
	`grantedBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `userPermissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('super_admin','admin','moderator','support','user') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `adminActions` ADD `reason` text NOT NULL;--> statement-breakpoint
ALTER TABLE `adminActions` ADD `ipAddress` varchar(64);--> statement-breakpoint
ALTER TABLE `adminActions` ADD `userAgent` text;--> statement-breakpoint
ALTER TABLE `services` ADD `sortOrder` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `tokenTransactions` ADD `operatorId` int;--> statement-breakpoint
ALTER TABLE `tokenTransactions` ADD `status` varchar(30) DEFAULT 'successful' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `firstName` varchar(80);--> statement-breakpoint
ALTER TABLE `users` ADD `lastName` varchar(80);--> statement-breakpoint
ALTER TABLE `users` ADD `pinHash` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `accountStatus` enum('active','pending','blocked','deleted') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `language` varchar(10) DEFAULT 'sw' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `failedLoginAttempts` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `lockedUntil` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `pinChangedAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `deletedAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_phone_unique` UNIQUE(`phone`);