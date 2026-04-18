CREATE TABLE `api_keys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`keyHash` varchar(64) NOT NULL,
	`keyPrefix` varchar(12) NOT NULL,
	`label` varchar(255) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`lastUsedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `api_keys_id` PRIMARY KEY(`id`),
	CONSTRAINT `api_keys_keyHash_unique` UNIQUE(`keyHash`)
);
