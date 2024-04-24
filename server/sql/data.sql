--
-- Dumping data for table `fto_users`
--
INSERT INTO `fto_users` (`user_id`, `user_username`, `user_email`, `user_join_date`, `user_contribution_score`, `user_type`, `user_active`) 
VALUES
    (1, 'Admin101', 'doradi3xplorer@gmail.com', '2023-07-29 15:06:05', 0, 'BASIC', b'1')
;
ALTER TABLE `fto_users`
    MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Dumping data for table `fto_anime`
--
INSERT INTO `fto_anime` (`anime_id`, `parent_anime_id`, `mal_id`, `kitsu_id`, `canonical_title`) 
VALUES
    (1, NULL, 31964, 11469, 'Boku no Hero Academia'),
    (2, 1, 33486, 12268, 'Boku no Hero Academia 2nd Season')
;
ALTER TABLE `fto_anime`
    MODIFY `anime_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Dumping data for table `fto_episode`
--
INSERT INTO `fto_episode` (`episode_id`, `fto_anime_id`, `episode_no`, `mal_episode_id`, `kitsu_episode_id`, `episode_title`) 
VALUES
    (1, 1, 12, 12, 184533, 'All Might'),
    (2, 1, 13, 13, 184534, 'In Each of Our Hearts'),
    (3, 1, 7, 7, 184528, 'Deku vs. Kacchan'),
    (4, 2, 17, 17, 199279, 'Climax')
;
ALTER TABLE `fto_episode`
    MODIFY `episode_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Dumping data for table `fto_episode_comments`
--
INSERT INTO `fto_episode_comments` (`comment_id`, `fto_user_id`, `fto_episode_id`, `comment_parent_id`, `comment_date`, `comment_content`, `comment_likes`) 
VALUES
    (1, 1, 2, NULL, '2024-04-18 21:52:50', 'I\'m pretty sure the song by the names [Anguish Of The Quirkless (無個性の苦悩 Mukosei no kunō?)] plays when Cementos hides All Might\'s weakened state from the rest of the students.', '[{\"user_id\":3,\"is_like\":true},{\"user_id\":1,\"is_like\":true}]'),
    (2, 1, 2, NULL, '2024-04-18 22:43:34', 'I myself am pretty sure the song by the names [I Will Become a Hero! (ヒーローになるんだっ! Hīrō ni narunda!?)] while the students discuss standing outside the USJ what just happened in the USJ.', '[{\"user_id\":1,\"is_like\":true}]'),
    (3, 1, 2, 1, '2024-04-18 22:43:34', 'I agree', NULL),
    (4, 1, 2, NULL, '2024-04-18 22:43:34', 'I think this application will benefit greatly from having multiple languages for track type.', NULL)
;
ALTER TABLE `fto_episode_comments`
    MODIFY `comment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Dumping data for table `fto_track`
--
INSERT INTO `fto_track` (`track_id`, `fto_anime_id`, `track_name`, `artist_name`, `label_name`, `release_date`, `streaming_platform_links`, `fandom_webpage_link`, `fandom_image_link`, `embedded_yt_video_id`) 
VALUES
    (1, 1, 'You Say Run', 'Yûki Hayashi', 'Toho Animation Records', '2016-07-13', '{\"data\":{\"amazon_music\":\"B07VZ3WBQ1?trackAsin=B07W164Q6Q\",\"apple_music\":\"1475094797\",\"deezer\":\"1059340662\",\"shazam\":\"323892435\",\"spotify\":\"0hHc2igYYlSUyZdByauJmB\",\"youtube\":\"QwACoXnNcwg\",\"youtube_music\":\"QwACoXnNcwg\"}}', 'https://myheroacademia.fandom.com/wiki/My_Hero_Academia_Original_Soundtrack', 'https://static.wikia.nocookie.net/bokunoheroacademia/images/c/c6/My_Hero_Academia_Soundtrack.png', 'iYZIUtDAFIw'),
    (2, 1, 'HERO A', 'Yûki Hayashi', 'Toho Animation Records', '2016-07-13', '', 'https://myheroacademia.fandom.com/wiki/My_Hero_Academia_Original_Soundtrack?file=My_Hero_Academia_Soundtrack.png', 'https://static.wikia.nocookie.net/bokunoheroacademia/images/c/c6/My_Hero_Academia_Soundtrack.png', '8iET-Oyxopo'),
    (3, 1, 'Darkness Dominates The Heart', 'Yûki Hayashi', 'Toho Animation Records', NULL, '', 'https://myheroacademia.fandom.com/wiki/My_Hero_Academia_Original_Soundtrack?file=My_Hero_Academia_Soundtrack.png', NULL, 'QmORZhOpjrY'),
    (4, 1, 'Analysis', 'Yûki Hayashi', 'Toho Animation Records', '2016-07-13', '', 'https://myheroacademia.fandom.com/wiki/My_Hero_Academia_Original_Soundtrack?file=My_Hero_Academia_Soundtrack.png', 'https://static.wikia.nocookie.net/bokunoheroacademia/images/c/c6/My_Hero_Academia_Soundtrack.png', 'Nrw5wSCZPeA'),
    (5, 1, 'Rampaging Evil', 'Yûki Hayashi', 'Toho Animation Records', '2016-07-13', '', 'https://myheroacademia.fandom.com/wiki/My_Hero_Academia_Original_Soundtrack?file=My_Hero_Academia_Soundtrack.png', 'https://static.wikia.nocookie.net/bokunoheroacademia/images/c/c6/My_Hero_Academia_Soundtrack.png', 'YQ5jVlgdKMw'),
    (6, 1, 'Evil of Psychology', 'Yûki Hayashi', 'Toho Animation Records', '2016-07-13', '', 'https://myheroacademia.fandom.com/wiki/My_Hero_Academia_Original_Soundtrack?file=My_Hero_Academia_Soundtrack.png', 'https://static.wikia.nocookie.net/bokunoheroacademia/images/c/c6/My_Hero_Academia_Soundtrack.png', 'X9VDvMUNBhA'),
    (7, 1, 'My Hero Academia', 'Yûki Hayashi', 'Toho Animation Records', '2016-07-13', '', 'https://myheroacademia.fandom.com/wiki/My_Hero_Academia_Original_Soundtrack?file=My_Hero_Academia_Soundtrack.png', 'https://static.wikia.nocookie.net/bokunoheroacademia/images/c/c6/My_Hero_Academia_Soundtrack.png', '4jIXcSxBP7U'),
    (8, 1, 'Plus Ultra', 'Yûki Hayashi', 'Toho Animation Records', '2016-07-13', '', 'https://myheroacademia.fandom.com/wiki/My_Hero_Academia_Original_Soundtrack?file=My_Hero_Academia_Soundtrack.png', 'https://static.wikia.nocookie.net/bokunoheroacademia/images/c/c6/My_Hero_Academia_Soundtrack.png', 'FvPWLLzHrSA'),
    (9, 1, 'The Day', 'Porno Graffitti', 'Sony Music Entertainment Japan', '2016-05-26', '', 'https://myheroacademia.fandom.com/wiki/My_Hero_Academia_Original_Soundtrack?file=My_Hero_Academia_Soundtrack.png', 'https://static.wikia.nocookie.net/bokunoheroacademia/images/c/c6/My_Hero_Academia_Soundtrack.png', 'yu0HjPzFYnY'),
    (10, 1, 'HEROES!', 'Brian the Sun', 'Epic Records Japan', '2016-06-01', '', 'https://myheroacademia.fandom.com/wiki/My_Hero_Academia_Original_Soundtrack?file=My_Hero_Academia_Soundtrack.png', 'https://static.wikia.nocookie.net/bokunoheroacademia/images/c/c6/My_Hero_Academia_Soundtrack.png', 'YRU7MZWDmgg'),
    (11, 1, 'You Can Become A Hero', 'Yûki Hayashi', 'Toho Animation Records', '2016-07-13', '', 'https://myheroacademia.fandom.com/wiki/My_Hero_Academia_Original_Soundtrack?file=My_Hero_Academia_Soundtrack.png', 'https://static.wikia.nocookie.net/bokunoheroacademia/images/c/c6/My_Hero_Academia_Soundtrack.png', 'ZAukL8dyh6I'),
    (12, 2, 'Just Another Hero', 'Yūki Hayashi', 'Toho Animation Records', '2017-09-06', '{\"data\":{\"spotify\":\"5MVgPvxtIi1OQTguhaHqVf\"}}', 'https://myheroacademia.fandom.com/wiki/My_Hero_Academia_2nd_Original_Soundtrack', 'https://static.wikia.nocookie.net/bokunoheroacademia/images/3/30/My_Hero_Academia_2nd_Soundtrack.png', NULL)
;
ALTER TABLE `fto_track`
    MODIFY `track_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- Dumping data for table `fto_occurrence`
--
INSERT INTO `fto_occurrence` (`occurrence_id`, `fto_episode_id`, `fto_track_id`, `track_type`, `scene_description`) 
VALUES
    (1, 1, 1, 'BGM', 'The monster Nomu attacks Katsuki, but the young hero is saved when All Might takes the brunt of Nomu\'s attack.'),
    (2, 1, 3, 'BGM', 'Izuku Midoriya reflects on All Might\'s condition as he begins to fight the League of villains at the USJ.'),
    (3, 1, 4, 'BGM', 'Class 1-A students back-up All might against Shigaraki and the league of villains'),
    (4, 1, 5, 'BGM', 'Nomu regenerates from Todoroki\'s ice and is ordered to attack Bakugo to free Kurogiri. '),
    (5, 1, 6, 'BGM', 'Tomura Shigaragi taunts All Might\'s   on the hypocrisy of using violence to save others.'),
    (6, 1, 7, 'BGM', 'After All Might arrives he begins to beat up all of the common thugs the League of Villains hired to attack UA.'),
    (7, 1, 8, 'BGM', 'All might arrives at the U.S.J. to stop the League of Villains.'),
    (8, 1, 9, 'OP', 'Opening for My Hero Academia Episode 12'),
    (9, 1, 10, 'ED', 'Ending for My Hero Academia Episode 12'),
    (10, 2, 1, 'BGM', 'The UA Pro teachers arrive just in time to help All Might and the rest of the Class 1A students'),
    (11, 2, 7, 'BGM', 'Shigaraki escapes with the help of Kurogiri and Class 1A students reflect on the event\'s that just occurred at the USJ.'),
    (12, 2, 11, 'BGM', 'All Might and Izuku lay in the hospital after the events that occurred at the USJ.'),
    (13, 2, 9, 'OP', 'Opening for My Hero Academia Episode 13'),
    (14, 2, 10, 'ED', 'Ending for My Hero Academia Episode 13'),
    (15, 4, 12, 'BGM', 'Endeavour arrives in time to save heroes from nomu attack, and proceeds to incinerate its head\'s cells to prevent regeneration.')
;
ALTER TABLE `fto_occurrence`
    MODIFY `occurrence_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- Dumping data for table `fto_request_submissions`
--
INSERT INTO `fto_request_submissions` (`request_submission_id`, `request_date`, `submission_type`, `request_id`, `fto_user_id`, `fto_track_id`, `fto_occurrence_id`)
VALUES
    (1, '2024-03-21 21:52:50', 'TRACK_ADD', 1, 1, 1, 1),
    (2, '2024-03-21 21:52:51', 'TRACK_ADD', 2, 1, 2, 3),
    (3, '2024-03-21 21:52:52', 'TRACK_ADD', 3, 1, 3, 1),
    (4, '2024-03-21 21:52:53', 'TRACK_ADD', 4, 1, 4, 1),
    (5, '2024-03-21 21:52:54', 'TRACK_ADD', 5, 1, 5, 1),
    (6, '2024-03-21 21:52:55', 'TRACK_ADD', 6, 1, 6, 1),
    (7, '2024-03-21 21:52:56', 'TRACK_ADD', 7, 1, 7, 1),
    (8, '2024-03-21 21:52:57', 'TRACK_ADD', 8, 1, 8, 1),
    (9, '2024-03-21 21:52:58', 'TRACK_ADD', 9, 1, 9, 1),
    (10, '2024-03-21 21:52:58', 'TRACK_ADD', 10, 1, 10, 1),
    (11, '2024-03-21 21:53:01', 'TRACK_ADD_PRE', 1, 1, 1, 2),
    (12, '2024-03-21 21:53:02', 'TRACK_ADD_PRE', 2, 1, 7, 2),
    (13, '2024-03-21 21:53:03', 'TRACK_ADD_PRE', 3, 1, 9, 2),
    (14, '2024-03-21 21:53:04', 'TRACK_ADD_PRE', 4, 1, 10, 2),
    (15, '2024-04-21 23:55:25', 'TRACK_ADD', 11, 1, 12, 15)
;
ALTER TABLE `fto_request_submissions`
    MODIFY `request_submission_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;
    
--
-- Dumping data for table `fto_request_track_add`
--
INSERT INTO `fto_request_track_add` (`request_track_add_id`, `request_date`, `request_state`, `request_rejection_reason`, `fto_user_id`, `fto_anime_id`, `fto_episode_id`, `track_type`, `scene_description`, `track_name`, `artist_name`, `label_name`, `release_date`, `streaming_platform_links`, `fandom_image_link`, `fandom_webpage_link`, `embedded_yt_video_id`) 
VALUES
    (1, '2024-03-21 21:52:57', 'ACCEPTED', NULL, 1, 1, 1, 'BGM', 'The monster Nomu attacks Katsuki, but the young hero is saved when All Might takes the brunt of Nomu\'s attack.', 'You Say Run', 'Yûki Hayashi', 'Toho Animation Records', '2016-07-13', '{\"data\":{\"amazon_music\":\"B07VZ3WBQ1?trackAsin=B07W164Q6Q\",\"apple_music\":\"1475094797\",\"deezer\":\"1059340662\",\"shazam\":\"323892435\",\"spotify\":\"0hHc2igYYlSUyZdByauJmB\",\"youtube\":\"QwACoXnNcwg\",\"youtube_music\":\"QwACoXnNcwg\"}}', 'https://static.wikia.nocookie.net/bokunoheroacademia/images/c/c6/My_Hero_Academia_Soundtrack.png', 'https://myheroacademia.fandom.com/wiki/My_Hero_Academia_Original_Soundtrack', 'iYZIUtDAFIw'),
    (2, '2024-03-21 21:52:57', 'ACCEPTED', NULL, 1, 1, 2, 'BGM', 'Bakugo blasts deku with his stored sweat in the mock battle', 'HERO A', 'Yûki Hayashi', 'Toho Animation Records', '2016-07-13', '', 'https://static.wikia.nocookie.net/bokunoheroacademia/images/c/c6/My_Hero_Academia_Soundtrack.png', 'https://myheroacademia.fandom.com/wiki/My_Hero_Academia_Original_Soundtrack', 'iYZIUtDAFIw'),
    (3, '2024-03-21 21:52:57', 'ACCEPTED', NULL, 1, 1, 1, 'BGM', 'Izuku Midoriya reflects on All Might\'s condition as he begins to fight the League of villains at the USJ.', 'Darkness Dominates The Heart', 'Yûki Hayashi', 'Toho Animation Records', NULL, '', 'https://myheroacademia.fandom.com/wiki/My_Hero_Academia_Original_Soundtrack?file=My_Hero_Academia_Soundtrack.png', NULL, 'QmORZhOpjrY'),
    (4, '2024-03-21 21:52:57', 'ACCEPTED', NULL, 1, 1, 1, 'BGM', 'Class 1-A students back-up All might against Shigaraki and the league of villains', 'Analysis', 'Yûki Hayashi', 'Toho Animation Records', '2016-07-13', '', 'https://myheroacademia.fandom.com/wiki/My_Hero_Academia_Original_Soundtrack?file=My_Hero_Academia_Soundtrack.png', 'https://static.wikia.nocookie.net/bokunoheroacademia/images/c/c6/My_Hero_Academia_Soundtrack.png', 'Nrw5wSCZPeA'),
    (5, '2024-03-21 21:52:57', 'ACCEPTED', NULL, 1, 1, 1, 'BGM', 'Nomu regenerates from Todoroki\'s ice and is ordered to attack Bakugo to free Kurogiri. ', 'Rampaging Evil', 'Yûki Hayashi', 'Toho Animation Records', '2016-07-13', '', 'https://myheroacademia.fandom.com/wiki/My_Hero_Academia_Original_Soundtrack?file=My_Hero_Academia_Soundtrack.png', 'https://static.wikia.nocookie.net/bokunoheroacademia/images/c/c6/My_Hero_Academia_Soundtrack.png', 'YQ5jVlgdKMw'),
    (6, '2024-03-21 21:52:57', 'ACCEPTED', NULL, 1, 1, 1, 'BGM', 'Tomura Shigaragi taunts All Might\'s   on the hypocrisy of using violence to save others.', 'Evil of Psychology', 'Yûki Hayashi', 'Toho Animation Records', '2016-07-13', '', 'https://myheroacademia.fandom.com/wiki/My_Hero_Academia_Original_Soundtrack?file=My_Hero_Academia_Soundtrack.png', 'https://static.wikia.nocookie.net/bokunoheroacademia/images/c/c6/My_Hero_Academia_Soundtrack.png', 'X9VDvMUNBhA'),
    (7, '2024-03-21 21:52:57', 'ACCEPTED', NULL, 1, 1, 1, 'BGM', 'After All Might arrives he begins to beat up all of the common thugs the League of Villains hired to attack UA.', 'My Hero Academia', 'Yûki Hayashi', 'Toho Animation Records', '2016-07-13', '', 'https://myheroacademia.fandom.com/wiki/My_Hero_Academia_Original_Soundtrack?file=My_Hero_Academia_Soundtrack.png', 'https://static.wikia.nocookie.net/bokunoheroacademia/images/c/c6/My_Hero_Academia_Soundtrack.png', '4jIXcSxBP7U'),
    (8, '2024-03-21 21:52:57', 'ACCEPTED', NULL, 1, 1, 1, 'BGM', 'All might arrives at the U.S.J. to stop the League of Villains.', 'Plus Ultra', 'Yûki Hayashi', 'Toho Animation Records', '2016-07-13', '', 'https://myheroacademia.fandom.com/wiki/My_Hero_Academia_Original_Soundtrack?file=My_Hero_Academia_Soundtrack.png', 'https://static.wikia.nocookie.net/bokunoheroacademia/images/c/c6/My_Hero_Academia_Soundtrack.png', 'FvPWLLzHrSA'),
    (9, '2024-03-21 21:52:57', 'ACCEPTED', NULL, 1, 1, 1, 'OP', 'Opening for My Hero Academia Episode 12', 'The Day', 'Porno Graffitti', 'Sony Music Entertainment Japan', '2016-05-26', '', 'https://myheroacademia.fandom.com/wiki/My_Hero_Academia_Original_Soundtrack?file=My_Hero_Academia_Soundtrack.png', 'https://static.wikia.nocookie.net/bokunoheroacademia/images/c/c6/My_Hero_Academia_Soundtrack.png', 'yu0HjPzFYnY'),
    (10, '2024-03-21 21:52:57', 'ACCEPTED', NULL, 1, 1, 1, 'ED', 'Ending for My Hero Academia Episode 12', 'HEROES!', 'Brian the Sun', 'Epic Records Japan', '2016-06-01', '', 'https://myheroacademia.fandom.com/wiki/My_Hero_Academia_Original_Soundtrack?file=My_Hero_Academia_Soundtrack.png', 'https://static.wikia.nocookie.net/bokunoheroacademia/images/c/c6/My_Hero_Academia_Soundtrack.png', 'YRU7MZWDmgg'),
    (11, '2024-04-21 23:55:25', 'ACCEPTED', NULL, 1, 2, 4, 'BGM', 'Endeavour arrives in time to save heroes from nomu attack, and proceeds to incinerate its head\'s cells to prevent regeneration.', 'Just Another Hero', 'Yūki Hayashi', 'Toho Animation Records', '2017-09-06', '{\"data\":{\"spotify\":\"5MVgPvxtIi1OQTguhaHqVf\"}}', 'https://static.wikia.nocookie.net/bokunoheroacademia/images/3/30/My_Hero_Academia_2nd_Soundtrack.png', 'https://myheroacademia.fandom.com/wiki/My_Hero_Academia_2nd_Original_Soundtrack', NULL)

;
ALTER TABLE `fto_request_track_add`
    MODIFY `request_track_add_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Dumping data for table `fto_request_track_add_preexisting`
--
INSERT INTO `fto_request_track_add_preexisting` (`request_track_add_id`, `request_date`, `request_state`, `request_rejection_reason`, `fto_user_id`, `fto_episode_id`, `fto_track_id`, `track_type`, `scene_description`) 
VALUES
    (1, '2024-03-21 21:53:01', 'ACCEPTED', NULL, 1, 2, 1, 'BGM', 'The UA Pro teachers arrive just in time to help All Might and the rest of the Class 1A students'),
    (2, '2024-03-21 21:53:02', 'ACCEPTED', NULL, 1, 2, 7, 'BGM', 'Shigaraki escapes with the help of Kurogiri and Class 1A students reflect on the event\'s that just occurred at the USJ.'),
    (3, '2024-03-21 21:53:03', 'ACCEPTED', NULL, 1, 2, 9, 'OP', 'Opening for My Hero Academia Episode 13'),
    (4, '2024-03-21 21:53:04', 'ACCEPTED', NULL, 1, 2, 10, 'ED', 'Ending for My Hero Academia Episode 13')
;
ALTER TABLE `fto_request_track_add_preexisting`
    MODIFY `request_track_add_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
