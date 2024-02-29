
CREATE DATABASE IF NOT EXISTS `findthatost_db` 
DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `findthatost_db`;

CREATE TABLE `fto_anime` (
    `anime_id` int(11) NOT NULL AUTO_INCREMENT,
    `parent_anime_id` int(11) DEFAULT NULL,
    `mal_id` int(11) NOT NULL,
    `kitsu_id` int(11) DEFAULT NULL,
    `canonical_title` varchar(128) NOT NULL,
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
    `episode_title` varchar(256) NULL DEFAULT,
    PRIMARY KEY (`episode_id`),
    FOREIGN KEY (`fto_anime_id`) REFERENCES `fto_anime` (`anime_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `fto_track` (
    `track_id` int(11) NOT NULL AUTO_INCREMENT,
    `track_name` varchar(255) NOT NULL,
    `artist_name` varchar(255) DEFAULT NULL,
    `label_name` varchar(255) DEFAULT NULL,
    `release_date` date DEFAULT NULL,
    `streaming_platform_links` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
    `fandom_ost_link` varchar(2048) DEFAULT NULL,
    `fandom_image_link` varchar(2048) DEFAULT NULL,
    `embedded_yt_video_id` varchar(2048) DEFAULT NULL,
    PRIMARY KEY (`track_id`),
    UNIQUE KEY (`track_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `fto_occurrence` (
    `occurrence_id` int(11) NOT NULL AUTO_INCREMENT,
    `fto_episode_id` int(11) NOT NULL,
    `fto_track_id` int(11) NOT NULL,
    `track_type` enum('OP','ED','IM','BGM') NOT NULL,
    `scene_description` varchar(250) DEFAULT NULL,
    PRIMARY KEY (`occurrence_id`),
    UNIQUE KEY (`occurrence_id`),
    FOREIGN KEY (`fto_track_id`) REFERENCES `fto_track` (`track_id`),
    FOREIGN KEY (`fto_episode_id`) REFERENCES `fto_episode` (`episode_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;