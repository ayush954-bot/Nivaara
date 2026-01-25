CREATE TABLE `property_videos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`propertyId` int NOT NULL,
	`videoUrl` text NOT NULL,
	`videoType` enum('youtube','vimeo','virtual_tour','other') NOT NULL DEFAULT 'youtube',
	`displayOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `property_videos_id` PRIMARY KEY(`id`)
);
