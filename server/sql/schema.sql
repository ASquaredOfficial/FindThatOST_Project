
CREATE DATABASE IF NOT EXISTS `findthatost_db` 
DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `findthatost_db`;

CREATE TABLE `fto_users` (
    `user_id` int(11) NOT NULL AUTO_INCREMENT,
    `user_username` varchar(30) NOT NULL,
    `user_email` varchar(320) DEFAULT NULL,
    `user_join_date` datetime NOT NULL DEFAULT current_timestamp(),
    `user_contribution_score` int(11) NOT NULL DEFAULT 0,
    `user_type` enum('BASIC','ADMIN') NOT NULL DEFAULT 'BASIC',
    `user_active` bit(1) NOT NULL DEFAULT b'1',
    PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `fto_anime` (
    `anime_id` int(11) NOT NULL AUTO_INCREMENT,
    `parent_anime_id` int(11) DEFAULT NULL,
    `mal_id` int(11) NOT NULL,  /*MyAnimeList Anime ID*/
    `kitsu_id` int(11) DEFAULT NULL,
    `canonical_title` varchar(128) NOT NULL, /*MyAnimeList Canonical Title*/
    PRIMARY KEY (`anime_id`),
    UNIQUE KEY (`mal_id`),
    FOREIGN KEY (`parent_anime_id`) REFERENCES `fto_anime` (`anime_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `fto_episode` (
    `episode_id` int(11) NOT NULL AUTO_INCREMENT,
    `fto_anime_id` int(11) NOT NULL,
    `episode_no` int(11) NOT NULL,
    `mal_episode_id` int(11) DEFAULT NULL,
    `kitsu_episode_id` int(11) DEFAULT NULL,
    `episode_title` varchar(256) DEFAULT NULL,
    PRIMARY KEY (`episode_id`),
    FOREIGN KEY (`fto_anime_id`) REFERENCES `fto_anime` (`anime_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `fto_episode_comments` (
    `comment_id` int(11) NOT NULL AUTO_INCREMENT,
    `fto_user_id` int(11) NOT NULL,
    `fto_episode_id` int(11) NOT NULL,
    `comment_parent_id` int(11) DEFAULT NULL,
    `comment_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `comment_content` text NOT NULL,
    PRIMARY KEY (`comment_id`),
    FOREIGN KEY (`comment_parent_id`) REFERENCES `fto_episode_comments` (`comment_id`),
    FOREIGN KEY (`fto_episode_id`) REFERENCES `fto_episode` (`episode_id`),
    FOREIGN KEY (`fto_user_id`) REFERENCES `fto_users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `fto_track` (
    `track_id` int(11) NOT NULL AUTO_INCREMENT,
    `fto_anime_id` int(11) NOT NULL,
    `track_name` varchar(255) NOT NULL,
    `artist_name` varchar(255) DEFAULT NULL,
    `label_name` varchar(255) DEFAULT NULL,
    `release_date` date DEFAULT NULL,
    `streaming_platform_links` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
    `fandom_webpage_link` varchar(2048) DEFAULT NULL,
    `fandom_image_link` varchar(2048) DEFAULT NULL,
    `embedded_yt_video_id` varchar(2048) DEFAULT NULL,
    PRIMARY KEY (`track_id`),
    FOREIGN KEY (`fto_anime_id`) REFERENCES `fto_anime` (`anime_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `fto_occurrence` (
    `occurrence_id` int(11) NOT NULL AUTO_INCREMENT,
    `fto_episode_id` int(11) NOT NULL,
    `fto_track_id` int(11) NOT NULL,
    `track_type` enum('OP','ED','IM','BGM') NOT NULL,
    `scene_description` varchar(250) DEFAULT NULL,
    PRIMARY KEY (`occurrence_id`),
    FOREIGN KEY (`fto_track_id`) REFERENCES `fto_track` (`track_id`),
    FOREIGN KEY (`fto_episode_id`) REFERENCES `fto_episode` (`episode_id`),
    CONSTRAINT `unique_episode_id_track_id` UNIQUE (`fto_episode_id`, `fto_track_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `fto_request_submissions` (
    /*Only request that have been accepted are added to this table*/
    `request_submission_id` int(11) NOT NULL AUTO_INCREMENT,
    `request_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `submission_type` enum('TRACK_ADD','TRACK_ADD_PRE','TRACK_EDIT','TRACK_REMOVE') NOT NULL,
    `request_id` int(11) NOT NULL,
    `fto_user_id` int(11) NOT NULL,
    `fto_track_id` int(11) NOT NULL,
    `fto_occurrence_id` int(11) NOT NULL,
    PRIMARY KEY (`request_submission_id`),
    FOREIGN KEY (`fto_user_id`) REFERENCES `fto_users` (`user_id`),
    FOREIGN KEY (`fto_track_id`) REFERENCES `fto_track` (`track_id`),
    FOREIGN KEY (`fto_occurrence_id`) REFERENCES `fto_occurrence` (`occurrence_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `fto_request_track_add` (
    `request_track_add_id` int(11) NOT NULL AUTO_INCREMENT,
    `request_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `request_state` enum('PENDING','ACCEPTED','REJECTED') NOT NULL DEFAULT 'ACCEPTED',
    `request_rejection_reason` varchar(200) DEFAULT NULL,
    `fto_user_id` int(11) NOT NULL,
    `fto_anime_id` int(11) NOT NULL,
    `fto_episode_id` int(11) NOT NULL,
    `track_type` enum('OP','ED','IM','BGM') DEFAULT NULL,
    `scene_description` varchar(250) DEFAULT NULL,
    `track_name` varchar(255) DEFAULT NULL,
    `artist_name` varchar(255) DEFAULT NULL,
    `label_name` varchar(255) DEFAULT NULL,
    `release_date` date DEFAULT NULL,
    `streaming_platform_links` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
    `fandom_image_link` varchar(2048) DEFAULT NULL,
    `fandom_webpage_link` varchar(2048) DEFAULT NULL,
    `embedded_yt_video_id` varchar(11) DEFAULT NULL,
    PRIMARY KEY (`request_track_add_id`),
    FOREIGN KEY (`fto_user_id`) REFERENCES `fto_users` (`user_id`),
    FOREIGN KEY (`fto_anime_id`) REFERENCES `fto_anime` (`anime_id`),
    FOREIGN KEY (`fto_episode_id`) REFERENCES `fto_episode` (`episode_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `fto_request_track_edit` (
    `request_track_edit_id` int(11) NOT NULL AUTO_INCREMENT,
    `request_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `request_state` enum('PENDING','ACCEPTED','REJECTED') NOT NULL DEFAULT 'ACCEPTED',
    `request_rejection_reason` varchar(200) DEFAULT NULL,
    `fto_user_id` int(11) NOT NULL,
    `fto_track_id` int(11) NOT NULL,
    `fto_occurrence_id` int(11) NOT NULL,
    `track_type` enum('OP','ED','IM','BGM') DEFAULT NULL,
    `scene_description` varchar(250) DEFAULT NULL,
    `track_name` varchar(255) DEFAULT NULL,
    `artist_name` varchar(255) DEFAULT NULL,
    `label_name` varchar(255) DEFAULT NULL,
    `release_date` date DEFAULT NULL,
    `streaming_platform_links` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
    `fandom_image_link` varchar(2048) DEFAULT NULL,
    `fandom_webpage_link` varchar(2048) DEFAULT NULL,
    `embedded_yt_video_id` varchar(11) DEFAULT NULL,
    `track_edit_reason` varchar(200) NOT NULL,
    PRIMARY KEY (`request_track_edit_id`),
    FOREIGN KEY (`fto_user_id`) REFERENCES `fto_users` (`user_id`),
    FOREIGN KEY (`fto_occurrence_id`) REFERENCES `fto_occurrence` (`occurrence_id`),
    FOREIGN KEY (`fto_track_id`) REFERENCES `fto_track` (`track_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `fto_request_track_remove_from_episode` (
    `request_track_remove_id` int(11) NOT NULL AUTO_INCREMENT,
    `request_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `request_state` enum('PENDING','ACCEPTED','REJECTED') NOT NULL DEFAULT 'ACCEPTED',
    `request_rejection_reason` varchar(200) DEFAULT NULL,
    `fto_user_id` int(11) NOT NULL,
    `fto_track_id` int(11) NOT NULL,
    `fto_occurrence_id` int(11) NOT NULL,
    `track_remove_reason` varchar(200) NOT NULL,
    PRIMARY KEY (`request_track_remove_id`),
    FOREIGN KEY (`fto_user_id`) REFERENCES `fto_users` (`user_id`),
    FOREIGN KEY (`fto_track_id`) REFERENCES `fto_track` (`track_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `fto_request_track_add_preexisting` (
    `request_track_add_id` int(11) NOT NULL AUTO_INCREMENT,
    `request_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `request_state` enum('PENDING','ACCEPTED','REJECTED') NOT NULL DEFAULT 'ACCEPTED',
    `request_rejection_reason` varchar(200) DEFAULT NULL,
    `fto_user_id` int(11) NOT NULL,
    `fto_episode_id` int(11) NOT NULL,
    `fto_track_id` int(11) NOT NULL,
    `track_type` enum('OP','ED','IM','BGM') DEFAULT NULL,
    `scene_description` varchar(250) DEFAULT NULL,
    PRIMARY KEY (`request_track_add_id`),
    FOREIGN KEY (`fto_user_id`) REFERENCES `fto_users` (`user_id`),
    FOREIGN KEY (`fto_track_id`) REFERENCES `fto_track` (`track_id`),
    FOREIGN KEY (`fto_episode_id`) REFERENCES `fto_episode` (`episode_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
