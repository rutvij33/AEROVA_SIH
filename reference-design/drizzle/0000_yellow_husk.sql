CREATE TABLE `airfareIndexBaselines` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scopeKey` varchar(64) NOT NULL,
	`currency` varchar(3) NOT NULL,
	`baseFareCents` int NOT NULL,
	`baseDate` varchar(10) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `airfareIndexBaselines_id` PRIMARY KEY(`id`),
	CONSTRAINT `airfareIndexBaselines_scopeKey_unique` UNIQUE(`scopeKey`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
