-- 0000_init.sql — esquema inicial
-- MariaDB 10.6+ · utf8mb4 / utf8mb4_unicode_ci
--
-- `order` y `key` son palabras reservadas: van siempre entre acentos graves.
-- Ejecutable tal cual desde phpMyAdmin si `drizzle-kit migrate` fallara en el
-- hosting. Equivale a lo que genera `npm run db:generate` desde schema.ts.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE `profile` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `full_name` VARCHAR(120) NOT NULL,
  `headline` VARCHAR(180) NOT NULL,
  `summary` TEXT NOT NULL,
  `summary_short` VARCHAR(155) NOT NULL,
  `email` VARCHAR(160) NOT NULL,
  `phone` VARCHAR(40),
  `location` VARCHAR(120) NOT NULL,
  `availability` VARCHAR(120) NOT NULL,
  `avatar_url` VARCHAR(255),
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `variant` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug` VARCHAR(40) NOT NULL,
  `label` VARCHAR(60) NOT NULL,
  `headline` VARCHAR(180) NOT NULL,
  `summary` TEXT NOT NULL,
  `pdf_file_name_es` VARCHAR(120) NOT NULL,
  `pdf_file_name_en` VARCHAR(120) NOT NULL,
  `is_default` BOOLEAN NOT NULL DEFAULT FALSE,
  `order` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_variant_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `link` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `label` VARCHAR(60) NOT NULL,
  `url` VARCHAR(255) NOT NULL,
  `kind` ENUM('linkedin','github','web','email','phone') NOT NULL,
  `order` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `skill_group` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(80) NOT NULL,
  `order` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `skill` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `group_id` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(80) NOT NULL,
  `tier` ENUM('nucleo','solido','en_uso') NOT NULL,
  `evidence_url` VARCHAR(255),
  `order` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `ix_skill_group` (`group_id`,`order`),
  CONSTRAINT `fk_skill_group` FOREIGN KEY (`group_id`)
    REFERENCES `skill_group`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `experience` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `role` VARCHAR(120) NOT NULL,
  `company` VARCHAR(120) NOT NULL,
  `client` VARCHAR(120),
  `mode` ENUM('remoto','hibrido','presencial','paralelo') NOT NULL,
  `context` TEXT NOT NULL,
  `start_date` CHAR(7) NOT NULL,
  `end_date` CHAR(7),
  `order` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `ix_experience_order` (`order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `achievement` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `experience_id` BIGINT UNSIGNED NOT NULL,
  `text` TEXT NOT NULL,
  `metric_label` VARCHAR(80),
  `metric_value` VARCHAR(60),
  `is_approximate` BOOLEAN NOT NULL DEFAULT FALSE,
  `order` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `ix_achievement_exp` (`experience_id`,`order`),
  CONSTRAINT `fk_achievement_exp` FOREIGN KEY (`experience_id`)
    REFERENCES `experience`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `exp_tech` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `experience_id` BIGINT UNSIGNED NOT NULL,
  `tech` VARCHAR(60) NOT NULL,
  `order` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `ix_exptech_exp` (`experience_id`,`order`),
  CONSTRAINT `fk_exptech_exp` FOREIGN KEY (`experience_id`)
    REFERENCES `experience`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `project` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug` VARCHAR(80) NOT NULL,
  `title` VARCHAR(160) NOT NULL,
  `problem` TEXT NOT NULL,
  `decision` TEXT NOT NULL,
  `architecture` TEXT NOT NULL,
  `result` TEXT NOT NULL,
  `learning` TEXT NOT NULL,
  `cover_url` VARCHAR(255),
  `repo_url` VARCHAR(255),
  `live_url` VARCHAR(255),
  `is_confidential` BOOLEAN NOT NULL DEFAULT FALSE,
  `featured` BOOLEAN NOT NULL DEFAULT FALSE,
  `is_draft` BOOLEAN NOT NULL DEFAULT TRUE,
  `order` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_project_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `education` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `institution` VARCHAR(160) NOT NULL,
  `title` VARCHAR(160) NOT NULL,
  `level` VARCHAR(60) NOT NULL,
  `status` ENUM('en_curso','culminado','suspendido') NOT NULL,
  `start_date` CHAR(7) NOT NULL,
  `end_date` CHAR(7),
  `order` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `certification` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `institution` VARCHAR(160) NOT NULL,
  `name` VARCHAR(160) NOT NULL,
  `status` ENUM('en_curso','culminado') NOT NULL,
  `start_date` CHAR(7),
  `end_date` CHAR(7),
  `order` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `language` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(60) NOT NULL,
  `level` VARCHAR(20) NOT NULL,
  `reading` VARCHAR(20) NOT NULL,
  `writing` VARCHAR(20) NOT NULL,
  `speaking` VARCHAR(20) NOT NULL,
  `order` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `variant_rule` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `variant_id` BIGINT UNSIGNED NOT NULL,
  `entity_type` ENUM('profile','variant','experience','achievement','skill_group','skill','project','education','certification') NOT NULL,
  `entity_id` BIGINT UNSIGNED NOT NULL,
  `visible` BOOLEAN NOT NULL DEFAULT TRUE,
  `priority` INT,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_variant_rule` (`variant_id`,`entity_type`,`entity_id`),
  KEY `ix_rule_lookup` (`variant_id`,`entity_type`),
  CONSTRAINT `fk_rule_variant` FOREIGN KEY (`variant_id`)
    REFERENCES `variant`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sin clave foránea: `entity_id` es polimórfico. La integridad se sostiene
-- en la capa de aplicación y en la limpieza al borrar (ver actions.ts).
CREATE TABLE `translation` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `entity_type` ENUM('profile','variant','experience','achievement','skill_group','skill','project','education','certification') NOT NULL,
  `entity_id` BIGINT UNSIGNED NOT NULL,
  `field` VARCHAR(48) NOT NULL,
  `locale` CHAR(2) NOT NULL,
  `value` TEXT NOT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_translation` (`entity_type`,`entity_id`,`field`,`locale`),
  KEY `ix_translation_locale` (`locale`,`entity_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `event` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `type` ENUM('view','pdf_download','link_click','project_view','variant_switch','locale_switch') NOT NULL,
  `path` VARCHAR(255) NOT NULL,
  `variant_slug` VARCHAR(40),
  `locale` CHAR(2) NOT NULL DEFAULT 'es',
  `referrer` VARCHAR(255),
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ix_event_day` (`created_at`,`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `setting` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `key` VARCHAR(80) NOT NULL,
  `value` JSON NOT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_setting_key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `user` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(160) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `last_login` TIMESTAMP NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `audit_log` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `action` ENUM('create','update','delete','publish','login') NOT NULL,
  `entity` VARCHAR(48) NOT NULL,
  `entity_id` BIGINT UNSIGNED,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ix_audit_user` (`user_id`,`created_at`),
  CONSTRAINT `fk_audit_user` FOREIGN KEY (`user_id`)
    REFERENCES `user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
