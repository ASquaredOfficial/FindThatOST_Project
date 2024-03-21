--
-- Dumping data for table `fto_anime`
--
INSERT INTO `fto_users` (`user_id`, `user_username`, `user_email`, `user_join_date`, `user_contribution_score`, `user_type`, `user_active`) VALUES
    (1, 'Admin101', 'doradi3xplorer@gmail.com', '2023-07-29 15:06:05', 0, 'BASIC', b'1');

ALTER TABLE `fto_users`
    MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Dumping data for table `fto_anime`
--
INSERT INTO `fto_anime` (`anime_id`, `parent_anime_id`, `mal_id`, `kitsu_id`, `canonical_title`) VALUES
    (1, NULL, 31964, 11469, 'Boku no Hero Academia');

ALTER TABLE `fto_anime`
  MODIFY `anime_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Dumping data for table `fto_episode`
--
INSERT INTO `fto_episode` (`episode_id`, `fto_anime_id`, `episode_no`, `mal_episode_id`, `kitsu_episode_id`, `episode_title`) VALUES
    (1, 1, 12, 12, 18453, 'All Might'),
    (2, 1, 13, 13, 184534, 'In Each of Our Hearts');

ALTER TABLE `fto_episode`
    MODIFY `episode_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Dumping data for table `fto_track`
--
INSERT INTO `fto_track` (`track_id`, `track_name`, `artist_name`, `label_name`, `release_date`, `streaming_platform_links`, `fandom_webpage_link`, `fandom_image_link`, `embedded_yt_video_id`) VALUES
    (1, 'You Say Run', 'Yûki Hayashi', 'Toho Animation Records', '2016-07-13', '{\"data\":{\n\"youtube\":\"QwACoXnNcwg\",\n\"youtube_music\":\"QwACoXnNcwg\",\n\"spotify\":\"0hHc2igYYlSUyZdByauJmB\",\n\"shazam\":\"323892435\",\n\"apple_music\":\"1475094797\",\n\"amazon_music\":\"B07VZ3WBQ1?trackAsin=B07W164Q6Q\",\n\"backup_links\":{\n	\"youtube\":\"QwACoXnNcwg\",\n    \"spotify\":\"0hHc2igYYlSUyZdByauJmB\",\n    \"shazam\":\"323892435\",\n    \"apple_music\":\"1475094797\",\n    \"amazon_music\":\"B07VZ3WBQ1?trackAsin=B07W164Q6Q\"}\n}}', 'https://myheroacademia.fandom.com/wiki/My_Hero_Academia_Original_Soundtrack?file=My_Hero_Academia_Soundtrack.png', NULL, 'iYZIUtDAFIw'),
    (2, 'HERO A', 'Yûki Hayashi', 'Toho Animation Records', '2016-07-13', '{\"data\":{\"youtube\":\"https:\\/\\/youtu.be\\/QwACoXnNcwg\",\"youtube_music\":\"https:\\/\\/music.youtube.com\\/watch?v=QwACoXnNcwg\",\"spotify\":\"https:\\/\\/open.spotify.com\\/track\\/0hHc2igYYlSUyZdByauJmB\",\"shazam\":\"https:\\/\\/www.shazam.com\\/track\\/323892435\",\"apple_music\":\"https:\\/\\/music.apple.com\\/song\\/1475094797\",\"amazon_music\":\"https:\\/\\/music.amazon.com\\/albums\\/B07VZ3WBQ1?trackAsin=B07W164Q6Q\",\"non_basic\":[{\"url\":\"https:\\/\\/www.deezer.com\\/en\\/track\\/1059340662\"}]}}', 'https://myheroacademia.fandom.com/wiki/My_Hero_Academia_Original_Soundtrack?file=My_Hero_Academia_Soundtrack.png', 'https://static.wikia.nocookie.net/bokunoheroacademia/images/c/c6/My_Hero_Academia_Soundtrack.png', '8iET-Oyxopo'),
    (3, 'Darkness Dominates The Heart', 'Yûki Hayashi', 'Toho Animation Records', NULL, '{\"data\":{\"youtube\":\"https:\\/\\/youtu.be\\/QwACoXnNcwg\",\"youtube_music\":\"https:\\/\\/music.youtube.com\\/watch?v=QwACoXnNcwg\",\"spotify\":\"https:\\/\\/open.spotify.com\\/track\\/0hHc2igYYlSUyZdByauJmB\",\"shazam\":\"https:\\/\\/www.shazam.com\\/track\\/323892435\",\"apple_music\":\"https:\\/\\/music.apple.com\\/song\\/1475094797\",\"amazon_music\":\"https:\\/\\/music.amazon.com\\/albums\\/B07VZ3WBQ1?trackAsin=B07W164Q6Q\",\"non_basic\":[{\"url\":\"https:\\/\\/www.deezer.com\\/en\\/track\\/1059340662\"}]}}', 'https://myheroacademia.fandom.com/wiki/My_Hero_Academia_Original_Soundtrack?file=My_Hero_Academia_Soundtrack.png', NULL, 'QmORZhOpjrY'),
    (4, 'Analysis', 'Yûki Hayashi', 'Toho Animation Records', '2016-07-13', '', 'https://myheroacademia.fandom.com/wiki/My_Hero_Academia_Original_Soundtrack?file=My_Hero_Academia_Soundtrack.png', 'https://static.wikia.nocookie.net/bokunoheroacademia/images/c/c6/My_Hero_Academia_Soundtrack.png', 'Nrw5wSCZPeA'),
    (5, 'Rampaging Evil', 'Yûki Hayashi', 'Toho Animation Records', '2016-07-13', '', 'https://myheroacademia.fandom.com/wiki/My_Hero_Academia_Original_Soundtrack?file=My_Hero_Academia_Soundtrack.png', 'https://static.wikia.nocookie.net/bokunoheroacademia/images/c/c6/My_Hero_Academia_Soundtrack.png', 'YQ5jVlgdKMw'),
    (6, 'Evil of Psychology', 'Yûki Hayashi', 'Toho Animation Records', '2016-07-13', '', 'https://myheroacademia.fandom.com/wiki/My_Hero_Academia_Original_Soundtrack?file=My_Hero_Academia_Soundtrack.png', 'https://static.wikia.nocookie.net/bokunoheroacademia/images/c/c6/My_Hero_Academia_Soundtrack.png', 'X9VDvMUNBhA'),
    (7, 'My Hero Academia', 'Yûki Hayashi', 'Toho Animation Records', '2016-07-13', '', 'https://myheroacademia.fandom.com/wiki/My_Hero_Academia_Original_Soundtrack?file=My_Hero_Academia_Soundtrack.png', 'https://static.wikia.nocookie.net/bokunoheroacademia/images/c/c6/My_Hero_Academia_Soundtrack.png', '4jIXcSxBP7U'),
    (8, 'Plus Ultra', 'Yûki Hayashi', 'Toho Animation Records', '2016-07-13', '', 'https://myheroacademia.fandom.com/wiki/My_Hero_Academia_Original_Soundtrack?file=My_Hero_Academia_Soundtrack.png', 'https://static.wikia.nocookie.net/bokunoheroacademia/images/c/c6/My_Hero_Academia_Soundtrack.png', 'FvPWLLzHrSA'),
    (9, 'The Day', 'Porno Graffitti', 'Sony Music Entertainment Japan', '2016-05-26', '', 'https://myheroacademia.fandom.com/wiki/My_Hero_Academia_Original_Soundtrack?file=My_Hero_Academia_Soundtrack.png', 'https://static.wikia.nocookie.net/bokunoheroacademia/images/c/c6/My_Hero_Academia_Soundtrack.png', 'yu0HjPzFYnY'),
    (10, 'HEROES!', 'Brian the Sun', 'Epic Records Japan', '2016-06-01', '{\"data\":{ \"youtube\":\"QwACoXnNcwg\", \"youtube_music\":\"QwACoXnNcwg\", \"spotify\":\"0hHc2igYYlSUyZdByauJmB\", \"shazam\":\"323892435\", \"apple_music\":\"1475094797\", \"amazon_music\":\"B07VZ3WBQ1?trackAsin=B07W164Q6Q\", \"backup_links\":{ 	\"youtube\":\"QwACoXnNcwg\",     \"spotify\":\"0hHc2igYYlSUyZdByauJmB\",     \"shazam\":\"323892435\",     \"apple_music\":\"1475094797\",     \"amazon_music\":\"B07VZ3WBQ1?trackAsin=B07W164Q6Q\"} }}', 'https://myheroacademia.fandom.com/wiki/My_Hero_Academia_Original_Soundtrack?file=My_Hero_Academia_Soundtrack.png', 'https://static.wikia.nocookie.net/bokunoheroacademia/images/c/c6/My_Hero_Academia_Soundtrack.png', 'YRU7MZWDmgg'),
    (11, 'You Can Become A Hero', 'Yûki Hayashi', 'Toho Animation Records', '2016-07-13', '', 'https://myheroacademia.fandom.com/wiki/My_Hero_Academia_Original_Soundtrack?file=My_Hero_Academia_Soundtrack.png', 'https://static.wikia.nocookie.net/bokunoheroacademia/images/c/c6/My_Hero_Academia_Soundtrack.png', 'ZAukL8dyh6I');

ALTER TABLE `fto_track`
    MODIFY `track_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- Dumping data for table `fto_occurrence`
--
INSERT INTO `fto_occurrence` (`occurrence_id`, `fto_episode_id`, `fto_track_id`, `track_type`, `scene_description`) VALUES
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
    (11, 2, 7, 'BGM', 'Shigaraki escapes with the help of Kurogiri and Class 1A students reflect on the event\'s that just occurred at the USJ. '),
    (12, 2, 11, 'BGM', 'All Might and Izuku lay in the hospital after the events that occurred at the USJ.'),
    (13, 2, 9, 'OP', 'Opening for My Hero Academia Episode 13'),
    (14, 2, 10, 'ED', 'Ending for My Hero Academia Episode 13');

ALTER TABLE `fto_occurrence`
    MODIFY `occurrence_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;


