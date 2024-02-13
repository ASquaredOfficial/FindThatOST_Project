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

const GetAllAnime = () => {
  return new Promise((resolve, reject) => {
    let sqlQuery = `SELECT * FROM ${tblName_anime}`;
    FtoConnection.query(sqlQuery, (error, results) => {
      if (error) {
        console.log(`Error in function (GetAllAnime).\nSQL Query:"${sqlQuery}".\nError Message:`, error.sqlMessage);
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

const GetAnime = (nFtoAnimeID) => {
  return new Promise((resolve, reject) => {
    let sqlQuery = `SELECT * FROM ${tblName_anime} WHERE anime_id = ${nFtoAnimeID}`;
    FtoConnection.query(sqlQuery, (error, results) => {
      if (error) {
        LogError('GetAnime', `SQL Query:"${sqlQuery}".\nError Message: ${error.sqlMessage}`);
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
    let sqlQuery = `UPDATE ${tblName_anime} SET ? WHERE anime_id = ${nAnimeID}`;
    FtoConnection.query(sqlQuery, patch_data, (error, results) => {
      if (error) {
        LogError('PatchAnime', `SQL Query:"${sqlQuery}".\nError Message: ${error.sqlMessage}`);
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

const GetAnimeMappingMAL = (nMalID) => {
  return new Promise((resolve, reject) => {
    let sqlQuery = `SELECT * FROM ${tblName_anime} WHERE mal_id = ${nMalID} LIMIT 1`;
    FtoConnection.query(sqlQuery, (error, results) => {
      if (error) {
        LogError('GetAnimeMappingMAL', `SQL Query:"${sqlQuery}".\nError Message: ${error.sqlMessage}`);
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
    let extraWhereQuery = (nEpisodeNo == -1) ? `` : ` AND episode_no = ${nEpisodeNo}`;
    let sqlQuery = `SELECT * FROM ${tblName_episode} WHERE fto_anime_id = ${nFtoAnimeID}${extraWhereQuery} ORDER BY episode_no ASC`;
    FtoConnection.query(sqlQuery, (error, results) => {
      if (error) {
        LogError('GetEpisodeMapping', `SQL Query:"${sqlQuery}".\nError Message: ${error.sqlMessage}`);
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
    let sqlQuery = 
    "SELECT occurrence_id, track_id, track_name, fto_occurrence.track_type, fto_occurrence.scene_description " + 
    "FROM ((`fto_episode` " + 
      "INNER JOIN fto_occurrence ON fto_episode.episode_id = fto_occurrence.fto_episode_id) " + 
      "INNER JOIN fto_track ON fto_occurrence.fto_track_id = fto_track.track_id) " + 
      "INNER JOIN fto_anime ON fto_episode.fto_anime_id = fto_anime.anime_id " + 
    `WHERE fto_episode.episode_id = ${nEpisodeID};`;
    FtoConnection.query(sqlQuery, (error, results) => {
      if (error) {
        LogError('GetTracksForEpisode', `SQL Query:"${sqlQuery}".\nError Message: ${error.sqlMessage}`);
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
  // Add more query functions as needed
};