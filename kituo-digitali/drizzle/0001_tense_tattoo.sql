CREATE TABLE `serviceRuns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`serviceSlug` varchar(100) NOT NULL,
	`serviceName` varchar(150) NOT NULL,
	`brief` text NOT NULL,
	`credits` int NOT NULL,
	`status` varchar(40) NOT NULL DEFAULT 'Complete',
	`reference` varchar(32) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `serviceRuns_id` PRIMARY KEY(`id`),
	CONSTRAINT `serviceRuns_reference_unique` UNIQUE(`reference`)
);
