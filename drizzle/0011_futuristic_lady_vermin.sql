CREATE TABLE `builders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`logo` text,
	`foundedYear` int,
	`completedProjects` int DEFAULT 0,
	`ongoingProjects` int DEFAULT 0,
	`website` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `builders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `project_amenities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`icon` varchar(50),
	`category` varchar(100),
	`displayOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `project_amenities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `project_floor_plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`bhk` varchar(20) NOT NULL,
	`carpetArea` int,
	`builtUpArea` int,
	`price` decimal(15,2),
	`imageUrl` text,
	`imageKey` varchar(255),
	`displayOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `project_floor_plans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `project_images` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`imageUrl` text NOT NULL,
	`imageKey` varchar(255),
	`isCover` boolean NOT NULL DEFAULT false,
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
	`displayOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `project_videos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`builderId` int,
	`builderName` varchar(255) NOT NULL,
	`location` varchar(255) NOT NULL,
	`city` varchar(100) NOT NULL,
	`state` varchar(100) NOT NULL,
	`description` text NOT NULL,
	`highlights` text,
	`priceRange` varchar(100) NOT NULL,
	`minPrice` decimal(15,2),
	`maxPrice` decimal(15,2),
	`status` enum('Upcoming','Under Construction','Ready to Move','Completed') NOT NULL,
	`reraNumber` varchar(100),
	`launchDate` date,
	`possessionDate` date,
	`totalUnits` int,
	`availableUnits` int,
	`landArea` varchar(50),
	`towers` int,
	`floors` int,
	`configurations` varchar(255),
	`latitude` decimal(10,8),
	`longitude` decimal(11,8),
	`featured` boolean NOT NULL DEFAULT false,
	`badge` varchar(100),
	`customBadgeText` varchar(25),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
