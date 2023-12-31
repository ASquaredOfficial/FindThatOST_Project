const mysql = require('mysql');
require('dotenv').config();

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
    FtoConnection.query('SELECT * FROM fto_anime', (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

const GetAnime = (nFtoAnimeID) => {
  return new Promise((resolve, reject) => {
    FtoConnection.query(`SELECT * FROM fto_anime where anime_id = ${nFtoAnimeID}`, (error, results) => {
      if (error) {
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
    let sql = `UPDATE fto_anime SET ? WHERE anime_id = ${nAnimeID}`;
    FtoConnection.query(sql, patch_data, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

const GetAnimeMappingMAL = (nMalID) => {
  return new Promise((resolve, reject) => {
    let sql = `SELECT * FROM fto_anime WHERE mal_id = ${nMalID} LIMIT 1`;
    FtoConnection.query(sql, (error, results) => {
      if (error) {
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
    let sql = 'INSERT INTO fto_anime SET ?';
		FtoConnection.query(sql, post_data, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

module.exports = {
  GetAllAnime,
  GetAnime,
  PatchAnime,
  GetAnimeMappingMAL,
  PostAnimeIntoDB,
  // Add more query functions as needed
};