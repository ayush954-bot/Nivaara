CREATE TABLE `listing_edits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`listingType` enum('property','project') NOT NULL,
	`listingId` int NOT NULL,
	`listingTitle` varchar(255),
	`submitterPhone` varchar(20) NOT NULL,
	`changedFields` text,
	`editedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `listing_edits_id` PRIMARY KEY(`id`)
);
