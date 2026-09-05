CREATE TABLE `airfareObservations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`snapshotId` int NOT NULL,
	`offerId` varchar(96) NOT NULL,
	`routeKey` varchar(32) NOT NULL,
	`origin` varchar(3) NOT NULL,
	`destination` varchar(3) NOT NULL,
	`airline` varchar(160) NOT NULL,
	`amountCents` int NOT NULL,
	`currency` varchar(3) NOT NULL,
	`stops` int NOT NULL,
	`departureDate` varchar(10) NOT NULL,
	`capturedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `airfareObservations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `airfareSnapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`routeKey` varchar(32) NOT NULL,
	`departureDate` varchar(10) NOT NULL,
	`currency` varchar(3) NOT NULL,
	`environment` varchar(8) NOT NULL,
	`networkMedianFareCents` int NOT NULL,
	`networkIndexValue` int NOT NULL,
	`observationsCount` int NOT NULL,
	`successfulRoutes` int NOT NULL,
	`failedRoutes` int NOT NULL,
	`capturedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `airfareSnapshots_id` PRIMARY KEY(`id`)
);
