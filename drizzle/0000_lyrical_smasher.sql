CREATE TABLE `achievement` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`experience_id` bigint unsigned NOT NULL,
	`text` text NOT NULL,
	`metric_label` varchar(80),
	`metric_value` varchar(60),
	`is_approximate` boolean NOT NULL DEFAULT false,
	`order` int NOT NULL DEFAULT 0,
	CONSTRAINT `achievement_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `audit_log` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`action` enum('create','update','delete','publish','login') NOT NULL,
	`entity` varchar(48) NOT NULL,
	`entity_id` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `certification` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`institution` varchar(160) NOT NULL,
	`name` varchar(160) NOT NULL,
	`status` enum('en_curso','culminado') NOT NULL,
	`start_date` char(7),
	`end_date` char(7),
	`order` int NOT NULL DEFAULT 0,
	CONSTRAINT `certification_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `education` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`institution` varchar(160) NOT NULL,
	`title` varchar(160) NOT NULL,
	`level` varchar(60) NOT NULL,
	`status` enum('en_curso','culminado','suspendido') NOT NULL,
	`start_date` char(7) NOT NULL,
	`end_date` char(7),
	`order` int NOT NULL DEFAULT 0,
	CONSTRAINT `education_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `event` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`type` enum('view','pdf_download','link_click','project_view','variant_switch','locale_switch') NOT NULL,
	`path` varchar(255) NOT NULL,
	`variant_slug` varchar(40),
	`locale` char(2) NOT NULL DEFAULT 'es',
	`referrer` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `event_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `exp_tech` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`experience_id` bigint unsigned NOT NULL,
	`tech` varchar(60) NOT NULL,
	`order` int NOT NULL DEFAULT 0,
	CONSTRAINT `exp_tech_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `experience` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`role` varchar(120) NOT NULL,
	`company` varchar(120) NOT NULL,
	`client` varchar(120),
	`mode` enum('remoto','hibrido','presencial','paralelo') NOT NULL,
	`context` text NOT NULL,
	`start_date` char(7) NOT NULL,
	`end_date` char(7),
	`order` int NOT NULL DEFAULT 0,
	CONSTRAINT `experience_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `language` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`name` varchar(60) NOT NULL,
	`level` varchar(20) NOT NULL,
	`reading` varchar(20) NOT NULL,
	`writing` varchar(20) NOT NULL,
	`speaking` varchar(20) NOT NULL,
	`order` int NOT NULL DEFAULT 0,
	CONSTRAINT `language_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `link` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`label` varchar(60) NOT NULL,
	`url` varchar(255) NOT NULL,
	`kind` enum('linkedin','github','web','email','phone') NOT NULL,
	`order` int NOT NULL DEFAULT 0,
	CONSTRAINT `link_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `profile` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`full_name` varchar(120) NOT NULL,
	`headline` varchar(180) NOT NULL,
	`summary` text NOT NULL,
	`summary_short` varchar(155) NOT NULL,
	`email` varchar(160) NOT NULL,
	`phone` varchar(40),
	`location` varchar(120) NOT NULL,
	`availability` varchar(120) NOT NULL,
	`avatar_url` varchar(255),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `profile_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `project` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`slug` varchar(80) NOT NULL,
	`title` varchar(160) NOT NULL,
	`problem` text NOT NULL,
	`decision` text NOT NULL,
	`architecture` text NOT NULL,
	`result` text NOT NULL,
	`learning` text NOT NULL,
	`cover_url` varchar(255),
	`repo_url` varchar(255),
	`live_url` varchar(255),
	`is_confidential` boolean NOT NULL DEFAULT false,
	`featured` boolean NOT NULL DEFAULT false,
	`is_draft` boolean NOT NULL DEFAULT true,
	`order` int NOT NULL DEFAULT 0,
	CONSTRAINT `project_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_project_slug` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `setting` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`key` varchar(80) NOT NULL,
	`value` json NOT NULL,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `setting_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_setting_key` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `skill` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`group_id` bigint unsigned NOT NULL,
	`name` varchar(80) NOT NULL,
	`tier` enum('nucleo','solido','en_uso') NOT NULL,
	`evidence_url` varchar(255),
	`order` int NOT NULL DEFAULT 0,
	CONSTRAINT `skill_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `skill_group` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`name` varchar(80) NOT NULL,
	`order` int NOT NULL DEFAULT 0,
	CONSTRAINT `skill_group_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `translation` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`entity_type` enum('profile','variant','experience','achievement','skill_group','skill','project','education','certification') NOT NULL,
	`entity_id` bigint unsigned NOT NULL,
	`field` varchar(48) NOT NULL,
	`locale` char(2) NOT NULL,
	`value` text NOT NULL,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `translation_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_translation` UNIQUE(`entity_type`,`entity_id`,`field`,`locale`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`email` varchar(160) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`last_login` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_user_email` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `variant` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`slug` varchar(40) NOT NULL,
	`label` varchar(60) NOT NULL,
	`headline` varchar(180) NOT NULL,
	`summary` text NOT NULL,
	`pdf_file_name_es` varchar(120) NOT NULL,
	`pdf_file_name_en` varchar(120) NOT NULL,
	`is_default` boolean NOT NULL DEFAULT false,
	`order` int NOT NULL DEFAULT 0,
	CONSTRAINT `variant_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_variant_slug` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `variant_rule` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`variant_id` bigint unsigned NOT NULL,
	`entity_type` enum('profile','variant','experience','achievement','skill_group','skill','project','education','certification') NOT NULL,
	`entity_id` bigint unsigned NOT NULL,
	`visible` boolean NOT NULL DEFAULT true,
	`priority` int,
	CONSTRAINT `variant_rule_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_variant_rule` UNIQUE(`variant_id`,`entity_type`,`entity_id`)
);
--> statement-breakpoint
ALTER TABLE `achievement` ADD CONSTRAINT `achievement_experience_id_experience_id_fk` FOREIGN KEY (`experience_id`) REFERENCES `experience`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `audit_log` ADD CONSTRAINT `audit_log_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `exp_tech` ADD CONSTRAINT `exp_tech_experience_id_experience_id_fk` FOREIGN KEY (`experience_id`) REFERENCES `experience`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `skill` ADD CONSTRAINT `skill_group_id_skill_group_id_fk` FOREIGN KEY (`group_id`) REFERENCES `skill_group`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `variant_rule` ADD CONSTRAINT `variant_rule_variant_id_variant_id_fk` FOREIGN KEY (`variant_id`) REFERENCES `variant`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `ix_achievement_exp` ON `achievement` (`experience_id`,`order`);--> statement-breakpoint
CREATE INDEX `ix_audit_user` ON `audit_log` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `ix_event_day` ON `event` (`created_at`,`type`);--> statement-breakpoint
CREATE INDEX `ix_exptech_exp` ON `exp_tech` (`experience_id`,`order`);--> statement-breakpoint
CREATE INDEX `ix_experience_order` ON `experience` (`order`);--> statement-breakpoint
CREATE INDEX `ix_skill_group` ON `skill` (`group_id`,`order`);--> statement-breakpoint
CREATE INDEX `ix_translation_locale` ON `translation` (`locale`,`entity_type`);--> statement-breakpoint
CREATE INDEX `ix_rule_lookup` ON `variant_rule` (`variant_id`,`entity_type`);