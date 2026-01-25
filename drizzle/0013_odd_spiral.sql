CREATE TABLE `project_amenities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`icon` varchar(50),
	`displayOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `project_amenities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `project_floor_plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`bedrooms` int NOT NULL,
	`bathrooms` int NOT NULL,
	`area` int NOT NULL,
	`price` decimal(15,2) NOT NULL,
	`imageUrl` text,
	`displayOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `project_floor_plans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `project_images` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`imageUrl` text NOT NULL,
	`caption` varchar(255),
	`displayOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `project_images_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `project_videos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`videoUrl` text NOT NULL,
	`videoType` enum('youtube','vimeo','virtual_tour','other') NOT NULL DEFAULT 'youtube',
	`title` varchar(255),
	`displayOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `project_videos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`builderName` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`location` varchar(255) NOT NULL,
	`city` varchar(100) NOT NULL,
	`latitude` decimal(10,8),
	`longitude` decimal(11,8),
	`status` enum('Upcoming','Under Construction','Ready to Move') NOT NULL,
	`priceRange` varchar(100) NOT NULL,
	`minPrice` decimal(15,2),
	`maxPrice` decimal(15,2),
	`configurations` varchar(255),
	`reraNumber` varchar(100),
	`possessionDate` date,
	`totalUnits` int,
	`towers` int,
	`floors` int,
	`coverImage` text,
	`videoUrl` text,
	`brochureUrl` text,
	`featured` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
