ALTER TABLE `projects` ADD `listingSource` enum('staff','public') DEFAULT 'staff' NOT NULL;--> statement-breakpoint
ALTER TABLE `projects` ADD `listingStatus` enum('published','pending_review','rejected') DEFAULT 'published' NOT NULL;--> statement-breakpoint
ALTER TABLE `projects` ADD `submitterPhone` varchar(20);--> statement-breakpoint
ALTER TABLE `projects` ADD `submitterName` varchar(255);--> statement-breakpoint
ALTER TABLE `projects` ADD `rejectionReason` text;--> statement-breakpoint
ALTER TABLE `properties` ADD `listingSource` enum('staff','public') DEFAULT 'staff' NOT NULL;--> statement-breakpoint
ALTER TABLE `properties` ADD `listingStatus` enum('published','pending_review','rejected') DEFAULT 'published' NOT NULL;--> statement-breakpoint
ALTER TABLE `properties` ADD `submitterPhone` varchar(20);--> statement-breakpoint
ALTER TABLE `properties` ADD `submitterName` varchar(255);--> statement-breakpoint
ALTER TABLE `properties` ADD `rejectionReason` text;