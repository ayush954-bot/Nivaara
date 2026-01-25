ALTER TABLE `properties` ADD `slug` varchar(255);--> statement-breakpoint
ALTER TABLE `properties` ADD CONSTRAINT `properties_slug_unique` UNIQUE(`slug`);