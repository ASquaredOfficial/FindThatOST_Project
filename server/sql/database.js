const mysql = require('mysql');
require('dotenv').config();

const { 
    tblName_anime,
    tblName_episode,
} = require('./db_tableNames');

const { 
    Query_PostMissingEpisode, 
} = require('./query_strings');

const FtoConnection = mysql.createConnection({
  host: process.env.FTO_APP_DB_MYSQL_HOST,
  user: process.env.FTO_APP_DB_MYSQL_USER,
  password: process.env.FTO_APP_DB_MYSQL_PSWD,
  database: process.env.FTO_APP_DB_MYSQL_NAME,
});

FtoConnection.connect((err) => {
  if (err) {
    console.error(err)
    throw err;
  }
  console.log("MySQL connected...");
});

class SQLArrayHandler {
  constructor(strings) {
      this.strings = strings;
  }

  // Method to combine strings with each item preceded by a newline character (except the first one)
  CombineStringsToPrintableFormat() {
      if (this.strings.length === 0) {
          return ""; // Return an empty string if the array is empty
      }

      // Start with the first string
      let combinedString = this.strings[0];

      // Append subsequent strings with \n before them
      for (let i = 1; i < this.strings.length; i++) {
        if (combinedString.endsWith(",")) {
          combinedString = combinedString.substring(0,combinedString.length) + ' ';
        }
        else {
          combinedString += "\n";
        }

        if (this.strings[i].startsWith("INNER JOIN")) {
          combinedString += "\t";
        } 
        combinedString += this.strings[i].trim();
      }

      return combinedString + ';';
  }

  // Method to combine all strings into a single line sql query
  CombineStringsToQuery() {
      return this.strings.join(' ') + ';';
  }
}

const GetAllAnime = () => {
  return new Promise((resolve, reject) => {
    let sqlQuery = [
      "SELECT *,",
      `FROM ${tblName_anime}`,
    ];
    const handler = new SQLArrayHandler(sqlQuery);
    const sqlQueryString = handler.CombineStringsToQuery();
    FtoConnection.query(sqlQueryString, (error, results) => {
      if (error) {
        LogError('GetAllAnime', `SQL Query:\n"${handler.CombineStringsToPrintableFormat()}"\nError Message: ${error.sqlMessage}`);
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

const GetAnime = (nFtoAnimeID) => {
  return new Promise((resolve, reject) => {
    let sqlQuery = [
      "SELECT *",
      `FROM ${tblName_anime}`,
      `WHERE anime_id = ${nFtoAnimeID}`,
    ];
    const handler = new SQLArrayHandler(sqlQuery);
    const sqlQueryString = handler.CombineStringsToQuery();
    FtoConnection.query(sqlQueryString, (error, results) => {
      if (error) {
        LogError('GetAnime', `SQL Query:\n"${handler.CombineStringsToPrintableFormat()}"\nError Message: ${error.sqlMessage}`);
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

const PatchAnime = (nAnimeID, strAnimeTitle, nAnimePrequel) => {
  return new Promise((resolve, reject) => {
    let patch_data = {};
    if (strAnimeTitle !== '') {
      patch_data.canonical_title = strAnimeTitle;
    }
    if (nAnimePrequel > 0) {
      patch_data.parent_anime_id = nAnimePrequel;
    }
    console.log('Patch Data:', patch_data);
    let sqlQuery = [
      `UPDATE ${tblName_anime} SET ?`,
      `WHERE anime_id = ${nAnimeID}`,
    ];
    const handler = new SQLArrayHandler(sqlQuery);
    const sqlQueryString = handler.CombineStringsToQuery();
    FtoConnection.query(sqlQueryString, patch_data, (error, results) => {
      if (error) {
        LogError('PatchAnime', `SQL Query:\n"${handler.CombineStringsToPrintableFormat()}"\nError Message: ${error.sqlMessage}`);
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

const GetAnimeMappingMAL = (nMalID) => {
  return new Promise((resolve, reject) => {
    let sqlQuery = [
      "SELECT *",
      `FROM ${tblName_anime}`,
      `WHERE mal_id = ${nMalID} LIMIT 1`,
    ];
    const handler = new SQLArrayHandler(sqlQuery);
    const sqlQueryString = handler.CombineStringsToQuery();
    FtoConnection.query(sqlQueryString, (error, results) => {
      if (error) {
        LogError('GetAnimeMappingMAL', `SQL Query:\n"${handler.CombineStringsToPrintableFormat()}"\nError Message: ${error.sqlMessage}`);
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

const PostAnimeIntoDB = (nMalID, nKitsuID) => {
  return new Promise((resolve, reject) => {
    let post_data = {
        mal_id: nMalID,
        kitsu_id: nKitsuID,
    }
    let sqlQuery = `INSERT INTO ${tblName_anime} SET ?`;
		FtoConnection.query(sqlQuery, post_data, (error, results) => {
      if (error) {
        LogError('PostAnimeIntoDB', `SQL Query:"${sqlQuery}".\nError Message: ${error.sqlMessage}`);
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

const GetEpisodeMapping = (nFtoAnimeID, nEpisodeNo = -1) => {
  return new Promise((resolve, reject) => {
    let sqlQuery = [
      "SELECT *",
      `FROM ${tblName_episode}`,
      `WHERE fto_anime_id = ${nFtoAnimeID}`,
      "ORDER BY episode_no ASC",
    ];
    if (nEpisodeNo !== -1) {
      sqlQuery.splice(3, 0, `AND episode_no = ${nEpisodeNo}`);
    }
    const handler = new SQLArrayHandler(sqlQuery);
    const sqlQueryString = handler.CombineStringsToQuery();
    FtoConnection.query(sqlQueryString, (error, results) => {
      if (error) {
        LogError('GetEpisodeMapping', `SQL Query:\n"${handler.CombineStringsToPrintableFormat()}"\nError Message: ${error.sqlMessage}`);
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

const PostEpisodeIntoDB = (sqlQuery) => {
  return new Promise((resolve) => {
    FtoConnection.query(sqlQuery, (error, results) => {
      if (results == undefined) {
        LogError('PostEpisodeIntoDB', `SQL Query:"${sqlQuery}".\nError Message: ${error.sqlMessage}`);
        resolve(error);
      } else {
        resolve(results);
      }
    });
  });
}

const PostEpisodesIntoDB = async (nFtoAnimeID, arrMissingEpisodesDetails) => {
  // Create array of SQL queries using list of missing episodes and anime id
  const sqlQueries = Query_PostMissingEpisode(nFtoAnimeID, arrMissingEpisodesDetails);
  
  return Promise.all(sqlQueries.map(query => PostEpisodeIntoDB(query)));
};

const GetTracksForEpisode = (nEpisodeID) => {
  return new Promise((resolve, reject) => {
    let sqlQuery = [
      "SELECT occurrence_id, track_id, track_name, fto_occurrence.track_type, fto_occurrence.scene_description",
      "FROM ((`fto_episode`",
      "INNER JOIN fto_occurrence ON fto_episode.episode_id = fto_occurrence.fto_episode_id)",
      "INNER JOIN fto_track ON fto_occurrence.fto_track_id = fto_track.track_id)",
      "INNER JOIN fto_anime ON fto_episode.fto_anime_id = fto_anime.anime_id", 
      `WHERE fto_episode.episode_id = ${nEpisodeID}`,
    ];
    const handler = new SQLArrayHandler(sqlQuery);
    const sqlQueryString = handler.CombineStringsToQuery();
    FtoConnection.query(sqlQueryString, (error, results) => {
      if (error) {
        LogError('GetTracksForEpisode', `SQL Query:\n"${handler.CombineStringsToPrintableFormat()}"\nError Message: ${error.sqlMessage}`);
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

const GetTrack = (nTrackID, nOccurrenceID = -1) => {
  return new Promise((resolve, reject) => {
    let sqlQuery = [
      "SELECT track_id,",
      "fto_anime.canonical_title, ",
      "track_name, artist_name, label_name, release_date, fandom_image_link, fandom_ost_link,",
      "streaming_platform_links, embedded_yt_video_id",
      "FROM ((`fto_episode`",
      "INNER JOIN fto_occurrence ON fto_episode.episode_id = fto_occurrence.fto_episode_id)",
      "INNER JOIN fto_track ON fto_occurrence.fto_track_id = fto_track.track_id)",
      "INNER JOIN fto_anime ON fto_episode.fto_anime_id = fto_anime.anime_id", 
      `WHERE track_id = ${nTrackID}`,
    ];
    if (nOccurrenceID !== -1) {
      sqlQuery.splice(1, 0, "occurrence_id,");
      sqlQuery.splice(3, 0, "fto_episode.episode_no, fto_episode.episode_title, fto_occurrence.track_type, fto_occurrence.scene_description,");
      sqlQuery.push(`AND occurrence_id = ${nOccurrenceID}`)
    }
    const handler = new SQLArrayHandler(sqlQuery);
    const sqlQueryString = handler.CombineStringsToQuery();
    FtoConnection.query(sqlQueryString, (error, results) => {
      if (error) {
        LogError('GetTrack', `SQL Query:\n"${handler.CombineStringsToPrintableFormat()}"\nError Message: ${error.sqlMessage}`);
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

const LogError = (strFunctionName, strErrorMessage) => {
  var date = new Date(); // for now
  let strDatetimeNow = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}:${date.getMilliseconds()}`
  console.log(`Error in function (${strFunctionName}).\nDatetime:${strDatetimeNow}\n${strErrorMessage}\n`, '-'.repeat(50));
}

module.exports = {
  GetAllAnime,
  GetAnime,
  PatchAnime,
  GetAnimeMappingMAL,
  PostAnimeIntoDB,
  GetEpisodeMapping,
  PostEpisodesIntoDB,
  GetTracksForEpisode,
  GetTrack,
  // Add more query functions as needed
};