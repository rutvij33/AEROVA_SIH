ALTER TABLE `airfareSnapshots` ADD `captureKey` varchar(96);--> statement-breakpoint
ALTER TABLE `airfareSnapshots` ADD CONSTRAINT `airfareSnapshots_captureKey_unique` UNIQUE(`captureKey`);