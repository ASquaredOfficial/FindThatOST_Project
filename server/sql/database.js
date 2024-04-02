const mysql = require('mysql');
require('dotenv').config();
require('path').basename(__filename);

const filename = __filename.replace(/^.*[\\/]/, '')
const { 
    tblName_anime,
    tblName_episode,
} = require('./db_tableNames');

const { 
    Query_PostMissingEpisode, 
} = require('./query_strings');
const { IsEmpty, GetSqlErrorObj, MyXNOR, LineNumber } = require('../utils/BackendUtils');

const FtoConnection = mysql.createConnection({
  host: process.env.FTO_APP_DB_MYSQL_HOST,
  user: process.env.FTO_APP_DB_MYSQL_USER,
  password: process.env.FTO_APP_DB_MYSQL_PSWD,
  database: process.env.FTO_APP_DB_MYSQL_NAME,
});

// Create a MySQL connection pool
const FtoConnectionPool = mysql.createPool({
  connectionLimit: 10,
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

const LogError = (strFunctionName, strErrorMessage, strLineNumber = '') => {
  let date = new Date(); // for now
  let strDatetimeNow = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds().toLocaleString('en-US', {
	minimumIntegerDigits: 2,
	useGrouping: false
  })}:${date.getMilliseconds()}`;

  let errorString = `Error in function (${strFunctionName}-${filename}:${strLineNumber}).`;
  errorString += `\nDatetime: (${strDatetimeNow})`
  errorString += `\n${strErrorMessage}`;
  console.log(errorString +`\n`, '-'.repeat(50));
};

const PerformSelectQuery = (sqlCommand) => {
	return new Promise((resolve, reject) => {
		FtoConnection.query(sqlCommand, (error, results) => {
			if (error) {
				LogError('PerformSelectQuery', `SQL Query:\n"${error.sql}"\nError Message: ${error.sqlMessage}`);
				reject(error);
			} else {
				resolve(results);
			}
		});
	});
};

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

/**
 * Retrieves anime information from the database based on the provided anime ID.
 * @function GetAnime
 * @param {number} nFtoAnimeID - The ID of the anime to retrieve information for.
 * @returns {Promise<object[]>} A promise that resolves to an array of anime objects matching the provided ID.
 *                              Each object represents an anime record from the database.
 *                              If no matching records are found, the promise resolves to an empty array.
 *                              If an error occurs during the database query, the promise rejects with the error.
 */
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

const GetTracksForAnime = (nFtoAnimeID) => {
  return new Promise((resolve, reject) => {
    let sqlQuery = [
		"SELECT *",
		"FROM `fto_track`",
		`WHERE fto_anime_id = ${nFtoAnimeID}`,
    ];
    const handler = new SQLArrayHandler(sqlQuery);
    const sqlQueryString = handler.CombineStringsToQuery();
    FtoConnection.query(sqlQueryString, (error, results) => {
		if (error) {
			LogError('GetTracksForAnime', `SQL Query:\n"${handler.CombineStringsToPrintableFormat()}"\nError Message: ${error.sqlMessage}`);
			reject(error);
		} else {
			resolve(results);
		}
    });
  });
};

const GetTrackCountForMALAnime = (nMALAnimeID) => {
  return new Promise((resolve, reject) => {
    let sqlQuery = [
		"SELECT fto_anime.mal_id, COUNT(track_id) AS track_count",
		"FROM `fto_track`",
		"INNER JOIN `fto_anime` ON fto_anime_id = `fto_anime`.`anime_id`",
		`WHERE fto_anime.mal_id = ${nMALAnimeID}`,
    ];
    const handler = new SQLArrayHandler(sqlQuery);
    const sqlQueryString = handler.CombineStringsToQuery();
    FtoConnection.query(sqlQueryString, (error, results) => {
		if (error) {
			LogError('GetTrackCountForMALAnime', `SQL Query:\n"${handler.CombineStringsToPrintableFormat()}"\nError Message: ${error.sqlMessage}`);
			reject(error);
		} 
		// else if (nMALAnimeID >= 40000 && nMALAnimeID <= 50000) {
		// 	reject(`I don't want to see mal anime with ID '${nMALAnimeID}' succeed`);
		// }
		else {
			resolve(results);
		}
    });
  });
};

const GetTrackCountForMALAnimes = async (arrMalAnimeIDs) => {
  	return Promise.all(arrMalAnimeIDs.map(malAnimeID => GetTrackCountForMALAnime(malAnimeID)));
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
		"track_name, artist_name, label_name, release_date, fandom_image_link, fandom_webpage_link,",
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

const GetSubmissionContext_TrackAdd = (nFtoAnimeID, nEpisodeNo = -1) => {
  return new Promise((resolve, reject) => {
    let sqlQuery = [
		"SELECT fto_anime.canonical_title",
		"FROM `fto_anime`",
		`WHERE anime_id = ${nFtoAnimeID}`,
    ];
    if (nEpisodeNo !== -1) {
		sqlQuery.splice(1, 0, ", episode_id, episode_title");
		sqlQuery.splice(3, 0, "INNER JOIN fto_episode ON fto_anime.anime_id = fto_episode.fto_anime_id");
		sqlQuery.push(`AND episode_no = ${nEpisodeNo}`)
    }
    const handler = new SQLArrayHandler(sqlQuery);
    const sqlQueryString = handler.CombineStringsToQuery();
    FtoConnection.query(sqlQueryString, (error, results) => {
		if (error) {
			LogError('GetSubmissionContext', `SQL Query:\n"${handler.CombineStringsToPrintableFormat()}"\nError Message: ${error.sqlMessage}`);
			reject(error);
		} else {
			resolve(results);
		}
    });
  });
}

/**
 * Submits a new track to the FTO database.
 * @function PostSubmission_TrackAdd
 * @param {number} nFtoAnimeID -  The ID of the episode submission is for.
 * @param {number} nFtoEpisodeID - The ID of the episode submission is for.
 * @param {object} objSubmitDetails - The data being submitted by the user.
 * @returns {Promise<object[]>} A promise that resolves to an array of anime objects matching the provided ID.
 *                              Each object represents an anime record from the database.
 *                              If no matching records are found, the promise resolves to an empty array.
 *                              If an error occurs during the database query, the promise rejects with the error.
 */
const PostSubmission_TrackAdd = (nFtoAnimeID, nFtoEpisodeID = -1, objSubmitDetails) => {
	return new Promise((resolve, reject) => {
    	
		FtoConnectionPool.getConnection((err, ftoConnectionPool) => {
			if (err) {
				LogError('PostSubmission_TrackAdd', `Failed to connect to the database.\nError Message: ${err.sqlMessage}`, LineNumber());
				reject(GetSqlErrorObj(err));
				return;
			}

			ftoConnectionPool.beginTransaction((err0) => {
				if (err0) {
					ftoConnectionPool.release();
					LogError('PostSubmission_TrackAdd', `Failed to start transaction.\nError Message: ${err0.sqlMessage}`, LineNumber());
					reject(GetSqlErrorObj(err0));
					return;
				}

				const submissionResults = {}
				let bFailedTrackTblQuery = false; 
				let bFailedOccurrenceTblQuery = false; 
				let bFailedRequestTrackAddTblQuery = false; 
				let bFailedRequestSubmissionTblQuery = false; 

				// Add track, then get track_id
				const sqlQuery1 = 'INSERT INTO `fto_track` SET ?';
				const postData1 = {};
				postData1[`fto_anime_id`] = nFtoAnimeID;
				postData1[`track_name`] = String(objSubmitDetails.submit_trackName);
				postData1[`artist_name`] = (!objSubmitDetails.hasOwnProperty('submit_artistName') || IsEmpty(objSubmitDetails.submit_artistName)) ? null :
					String(objSubmitDetails.submit_artistName);
				postData1[`label_name`] = (!objSubmitDetails.hasOwnProperty('submit_labelName') || IsEmpty(objSubmitDetails.submit_labelName)) ? null :
					String(objSubmitDetails.submit_labelName);
				postData1[`release_date`] = (!objSubmitDetails.hasOwnProperty('submit_releaseDate') || IsEmpty(objSubmitDetails.submit_releaseDate)) ? null :
					String(objSubmitDetails.submit_releaseDate);
				postData1[`fandom_image_link`] = (!objSubmitDetails.hasOwnProperty('submit_wikiaImgUrl') || IsEmpty(objSubmitDetails.submit_wikiaImgUrl)) ? null :
					String(objSubmitDetails.submit_wikiaImgUrl);
				postData1[`fandom_webpage_link`] = (!objSubmitDetails.hasOwnProperty('submit_wikiaWebpageUrl') || IsEmpty(objSubmitDetails.submit_wikiaWebpageUrl)) ? null :
					String(objSubmitDetails.submit_wikiaWebpageUrl);
				postData1[`embedded_yt_video_id`] = (!objSubmitDetails.hasOwnProperty('submit_embeddedYtUrl') || IsEmpty(objSubmitDetails.submit_embeddedYtUrl)) ? null :
					String(objSubmitDetails.submit_embeddedYtUrl);
				postData1[`streaming_platform_links`] = JSON.stringify(objSubmitDetails.submit_streamPlat);
				ftoConnectionPool.query(sqlQuery1, postData1, (err1, result1) => {
					if (err1) {
						ftoConnectionPool.rollback(() => {
							// Failed to insert data into table
							bFailedTrackTblQuery = true;
							reject(GetSqlErrorObj(err1, `${filename}:${LineNumber()}`));
						});
						return;
					}
					submissionResults['fto_track_add'] = result1;

					// Retrieve the auto-incremented ID from the first insert and Prepare Second insert query using the retrieved ID
					const insertedTrackId = Number(result1.insertId);
					const sqlQuery2 = 'INSERT INTO `fto_occurrence` SET ?';
					const postData2 = {
						fto_track_id: insertedTrackId,
						fto_episode_id: nFtoEpisodeID,
						track_type: String(objSubmitDetails.submit_songType),
						scene_description: (!objSubmitDetails.hasOwnProperty('submit_sceneDesc') || IsEmpty(objSubmitDetails.submit_sceneDesc)) ? null :
							String(objSubmitDetails.submit_sceneDesc),
					};
					ftoConnectionPool.query(sqlQuery2, postData2, (err2, result2) => {
						if (err2) {
							ftoConnectionPool.rollback(() => {
								// Failed to insert data into table
								bFailedOccurrenceTblQuery = true;
								reject(GetSqlErrorObj(err2, `${filename}:${LineNumber()}`));
							});
							return;
						}
						submissionResults['fto_occurrence'] = result2;
						
						// Retrieve the auto-incremented ID from the first insert and Prepare Third insert query using the retrieved ID
						const nUserID = Number(objSubmitDetails['user_id']);
						const insertedOccurrenceId = Number(result2.insertId);
						const sqlQuery3 = 'INSERT INTO `fto_request_track_add` SET ?';
						const postData3 = { 
							...postData1, 
							...postData2, 
							fto_user_id: nUserID,
						};
						delete postData3['fto_track_id'];
						ftoConnectionPool.query(sqlQuery3, postData3, (err3, result3) => {
							if (err3) {
								ftoConnectionPool.rollback(() => {
									// Failed to insert data into table
									bFailedRequestTrackAddTblQuery = true;
									reject(GetSqlErrorObj(err3, `${filename}:${LineNumber()}`));
								});
								return;
							}
							submissionResults['fto_request_track_add'] = result3;

							// Retrieve the auto-incremented ID from the first insert and Prepare Third insert query using the retrieved ID
							const insertedTrackAddRequestId = Number(result3.insertId);
							const sqlQuery4 = 'INSERT INTO `fto_request_submissions` SET ?';
							const postData4 = {
								submission_type: 'TRACK_ADD',
								request_id: insertedTrackAddRequestId,
								fto_user_id: nUserID,
								fto_track_id: insertedTrackId,
								fto_occurrence_id: insertedOccurrenceId,
							};
							ftoConnectionPool.query(sqlQuery4, postData4, (err4, result4) => {
								if (err4) {
									ftoConnectionPool.rollback(() => {
										// Failed to insert data into table
										bFailedRequestSubmissionTblQuery = true;
										reject(GetSqlErrorObj(err4, `${filename}:${LineNumber()}`));
									});
									return;
								}
								submissionResults['fto_request_submissions'] = result4;

								// Commit the transaction if relevant insert queries are successful
								if (MyXNOR(!bFailedTrackTblQuery, submissionResults.hasOwnProperty('fto_track_add')) && 
								MyXNOR(!bFailedOccurrenceTblQuery, submissionResults.hasOwnProperty('fto_occurrence')) && 
								MyXNOR(!bFailedRequestTrackAddTblQuery, submissionResults.hasOwnProperty('fto_request_track_add')) && 
								MyXNOR(!bFailedRequestSubmissionTblQuery, submissionResults.hasOwnProperty('fto_request_submissions'))) {
									ftoConnectionPool.commit((err) => {
										if (err) {
											ftoConnectionPool.rollback(() => {
												ftoConnectionPool.release();
												LogError('PostSubmission_TrackAdd', `Failed to commit transaction.\nError Message: ${err.sqlMessage}`);
												reject(GetSqlErrorObj(err, `${filename}:${LineNumber()}`));
											});
											return;
										}
										ftoConnectionPool.release();
										resolve(submissionResults);
										return;
									});
								}
								else {
									// Insert queries not successful
									ftoConnectionPool.release();
								}
							});
						});
					});
				}); 
			});
		});
	});
}

const PostSubmission_TrackAddPreExisting = (nFtoEpisodeID, objSubmitDetails) => {
	return new Promise((resolve, reject) => {
    	
		FtoConnectionPool.getConnection((err, ftoConnectionPool) => {
			if (err) {
				LogError('PostSubmission_TrackAddPreExisting', `Failed to connect to the database.\nError Message: ${err.sqlMessage}`, LineNumber());
				reject(GetSqlErrorObj(err));
				return;
			}
			ftoConnectionPool.beginTransaction((err0) => {
				if (err0) {
					ftoConnectionPool.release();
					LogError('PostSubmission_TrackAddPreExisting', `Failed to start transaction.\nError Message: ${err0.sqlMessage}`, LineNumber());
					reject(GetSqlErrorObj(err0));
					return;
				}

				const submissionResults = {}
				let bFailedOccurrenceTblQuery = false; 
				let bFailedRequestTrackAddTblQuery = false; 
				let bFailedRequestSubmissionTblQuery = false; 

				const nTrackID = Number(objSubmitDetails['track_id']);
				const sqlQuery1 = 'INSERT INTO `fto_occurrence` SET ?';
				const postData1 = {
					fto_track_id: nTrackID, 
					fto_episode_id: nFtoEpisodeID,
					track_type: String(objSubmitDetails.submit_songType),
					scene_description: (!objSubmitDetails.hasOwnProperty('submit_sceneDesc') || IsEmpty(objSubmitDetails.submit_sceneDesc)) ? null :
						String(objSubmitDetails.submit_sceneDesc),
				};
				ftoConnectionPool.query(sqlQuery1, postData1, (err1, result1) => {
					if (err1) {
						ftoConnectionPool.rollback(() => {
							// Failed to insert data into table
							bFailedOccurrenceTblQuery = true;
							reject(GetSqlErrorObj(err1, `${filename}:${LineNumber()}`, {tableName: 'fto_occurrence'}));
						});
						return;
					}
					submissionResults['fto_occurrence'] = result1;
					
					// Retrieve the auto-incremented ID from the first insert and Prepare Third insert query using the retrieved ID
					const nUserID = Number(objSubmitDetails['user_id']);
					const insertedOccurrenceId = Number(result1.insertId);
					const sqlQuery2 = 'INSERT INTO `fto_request_track_add_preexisting` SET ?';
					const postData2 = { 
						...postData1, 
						fto_user_id: nUserID,
					};
					ftoConnectionPool.query(sqlQuery2, postData2, (err2, result2) => {
						if (err2) {
							ftoConnectionPool.rollback(() => {
								// Failed to insert data into table
								bFailedRequestTrackAddTblQuery = true;
								
								reject(GetSqlErrorObj(err2, `${filename}:${LineNumber()}`, {tableName: 'fto_request_track_add_preexisting'}));
							});
							return;
						}
						submissionResults['fto_request_track_add_preexisting'] = result2;

						// Retrieve the auto-incremented ID from the first insert and Prepare Third insert query using the retrieved ID
						const insertedTrackAddRequestId = Number(result2.insertId);
						const sqlQuery3 = 'INSERT INTO `fto_request_submissions` SET ?';
						const postData3 = {
							submission_type: 'TRACK_ADD',
							request_id: insertedTrackAddRequestId,
							fto_user_id: nUserID,
							fto_track_id: nTrackID,
							fto_occurrence_id: insertedOccurrenceId,
						};
						ftoConnectionPool.query(sqlQuery3, postData3, (err3, result3) => {
							if (err3) {
								ftoConnectionPool.rollback(() => {
									// Failed to insert data into table
									bFailedRequestSubmissionTblQuery = true;
									reject(GetSqlErrorObj(err3, `${filename}:${LineNumber()}`, {tableName: 'fto_request_submissions'}));
								});
								return;
							}
							submissionResults['fto_request_submissions'] = result3;

							// Commit the transaction if relevant insert queries are successful
							if (MyXNOR(!bFailedOccurrenceTblQuery, submissionResults.hasOwnProperty('fto_occurrence')) && 
								MyXNOR(!bFailedRequestTrackAddTblQuery, submissionResults.hasOwnProperty('fto_request_track_add_preexisting')) && 
								MyXNOR(!bFailedRequestSubmissionTblQuery, submissionResults.hasOwnProperty('fto_request_submissions'))) {
								ftoConnectionPool.commit((err) => {
									if (err) {
										ftoConnectionPool.rollback(() => {
											ftoConnectionPool.release();
											LogError('PostSubmission_TrackAddPreExisting', `Failed to commit transaction.\nError Message: ${err.sqlMessage}`);
											reject(GetSqlErrorObj(err, `${filename}:${LineNumber()}`));
										});
										return;
									}
									ftoConnectionPool.release();
									resolve(submissionResults);
									return;
								});
							}
							else {
								// At least one of the insert queries were not successful
								resolve(submissionResults);
								ftoConnectionPool.release();
							}
						});
					});
				});
			}); 
		});
	});
}

const GetSubmissionContext_TrackEdit = (nFtoTrackID, nFtoOccurrenceID = -1) => {
  return new Promise((resolve, reject) => {
    let sqlQuery = [
		"SELECT *",
		"FROM `fto_track`",
		`WHERE track_id = ${nFtoTrackID}`,
    ];
	
    if (nFtoOccurrenceID !== -1) {
		sqlQuery.splice(2, 0, "INNER JOIN `fto_occurrence` ON fto_track.track_id = fto_occurrence.fto_track_id");
		sqlQuery.splice(3, 0, "INNER JOIN fto_episode ON fto_occurrence.fto_episode_id = fto_episode.episode_id");
		sqlQuery.push(`AND occurrence_id = ${nFtoOccurrenceID}`)
    }
    const handler = new SQLArrayHandler(sqlQuery);
    const sqlQueryString = handler.CombineStringsToQuery();
    FtoConnection.query(sqlQueryString, (error, results) => {
		if (error) {
			LogError('GetSubmissionContext', `SQL Query:\n"${handler.CombineStringsToPrintableFormat()}"\nError Message: ${error.sqlMessage}`);
			reject(error);
		} else {
			resolve(results);
		}
    });
  });
}

/**
 * Updates a track in the FTO database.
 * @function PostSubmission_TrackEdit
 * @param {number} nFtoTrackID -  The ID of the track submission is for.
 * @param {number} nFtoOccurrenceID - The ID of the occurrence submission is for.
 * @param {object} objUserSubmission - The data being submitted by the user.
 * @returns {Promise<object[]>} A promise that resolves to an array of anime objects matching the provided ID.
 *                              Each object represents an anime record from the database.
 *                              If no matching records are found, the promise resolves to an empty array.
 *                              If an error occurs during the database query, the promise rejects with the error.
 */
const PostSubmission_TrackEdit = (nFtoTrackID, nFtoOccurrenceID, objUserSubmission) => {
	return new Promise((resolve, reject) => {
    	
		FtoConnectionPool.getConnection((err, ftoConnectionPool) => {
			if (err) {
				LogError('PostSubmission_TrackEdit', `Failed to connect to the database.\nError Message: ${err.sqlMessage}`, LineNumber());
				reject(GetSqlErrorObj(err));
				return;
			}
			const submissionResults = {}

			// Edit Track details
			const postData1 = {};
			if (objUserSubmission.hasOwnProperty('submit_trackName')) {
				postData1[`track_name`] = String(objUserSubmission.submit_trackName);
			} if (objUserSubmission.hasOwnProperty('submit_artistName')) {
				postData1[`artist_name`] = String(objUserSubmission.submit_artistName);
			} if (objUserSubmission.hasOwnProperty('submit_labelName')) {
				postData1[`label_name`] = String(objUserSubmission.submit_labelName);
			} if (objUserSubmission.hasOwnProperty('submit_releaseDate')) {
				postData1[`release_date`] = String(objUserSubmission.submit_releaseDate);
			} if (objUserSubmission.hasOwnProperty('submit_wikiaImgUrl')) {
				postData1[`fandom_image_link`] = String(objUserSubmission.submit_wikiaImgUrl);
			} if (objUserSubmission.hasOwnProperty('submit_wikiaWebpageUrl')) {
				postData1[`fandom_webpage_link`] = String(objUserSubmission.submit_wikiaWebpageUrl);
			} if (objUserSubmission.hasOwnProperty('submit_embeddedYtUrl')) {
				postData1[`embedded_yt_video_id`] = String(objUserSubmission.submit_embeddedYtUrl);
			} if (objUserSubmission.hasOwnProperty('submit_streamPlat')) {
				postData1[`streaming_platform_links`] = JSON.stringify(objUserSubmission.submit_streamPlat);
			}

			// Edit Occurrence details
			const postData2 = {};
			if (objUserSubmission.hasOwnProperty('submit_songType')) {
				postData2[`track_type`] = String(objUserSubmission.submit_songType);
			} if (objUserSubmission.hasOwnProperty('submit_sceneDesc')) {
				postData2[`scene_description`] = String(objUserSubmission.submit_sceneDesc);
			}

			ftoConnectionPool.beginTransaction(async (err0) => {
				if (err0) {
					LogError('PostSubmission_TrackEdit', `Failed to start transaction.\nError Message: ${err0.sqlMessage}`, LineNumber());
					reject(GetSqlErrorObj(err0));
					return;
				}

				let bFailedTrackTblQuery = false; 
				let bFailedOccurrenceTblQuery = false; 
				let bFailedRequestTrackEditTblQuery = false; 
				let bFailedRequestSubmissionTblQuery = false; 

				if (!IsEmpty(postData1)) {
					const sqlQuery1 = 'UPDATE `fto_track` SET ? WHERE track_id =' + nFtoTrackID;
					await ftoConnectionPool.query(sqlQuery1, postData1, (err1, result1) => {
						if (err1) {
							ftoConnectionPool.rollback(() => {
								// Failed to insert data into table
								bFailedTrackTblQuery = true;
								reject(GetSqlErrorObj(err1, `${filename}:${LineNumber()}`));
							});
							return;
						}
						submissionResults['fto_track_edit'] = result1;
					}); 
				}
				else {
					// Not executing query, thus failed
					bFailedTrackTblQuery = true;
				}

				if (!IsEmpty(postData2)) {
					const sqlQuery2 = 'UPDATE `fto_occurrence` SET ? WHERE occurrence_id = ' + nFtoOccurrenceID;
					await ftoConnectionPool.query(sqlQuery2, postData2, (err2, result2) => {
						if (err2) {
							ftoConnectionPool.rollback(() => {
								// Failed to insert data into table
								bFailedOccurrenceTblQuery = true;
								reject(GetSqlErrorObj(err2, `${filename}:${LineNumber()}`));
							});
							return;
						}
						submissionResults['fto_occurrence'] = result2;
					});
				}
				else {
					// Not executing query, thus failed
					bFailedOccurrenceTblQuery = true;
				}

				// Save Edit changes records 
				if (!IsEmpty(postData1) || !IsEmpty(postData2)) {
					// Retrieve the auto-incremented ID from the first insert and Prepare Third insert query using the retrieved ID
					const nUserID = Number(objUserSubmission['user_id']);
					const sqlQuery3 = 'INSERT INTO `fto_request_track_edit` SET ?';
					const postData3 = { 
						...postData1, 
						...postData2, 
						fto_user_id: nUserID,
						fto_track_id: nFtoTrackID,
						fto_occurrence_id: nFtoOccurrenceID,
						track_edit_reason: String(objUserSubmission.submit_editReason),
					};
					ftoConnectionPool.query(sqlQuery3, postData3, (err3, result3) => {
						if (err3) {
							ftoConnectionPool.rollback(() => {
								// Failed to insert data into table
								bFailedRequestTrackEditTblQuery = true;
								reject(GetSqlErrorObj(err3, `${filename}:${LineNumber()}`));
							});
							return;
						}
						submissionResults['fto_request_track_edit'] = result3;

						// Retrieve the auto-incremented ID from the first insert and Prepare Third insert query using the retrieved ID
						const insertedTrackEditRequestId = Number(result3.insertId);
						const sqlQuery4 = 'INSERT INTO `fto_request_submissions` SET ?';
						const postData4 = {
							submission_type: 'TRACK_EDIT',
							request_id: insertedTrackEditRequestId,
							fto_user_id: nUserID,
							fto_track_id: nFtoTrackID,
							fto_occurrence_id: nFtoOccurrenceID,
						};
						ftoConnectionPool.query(sqlQuery4, postData4, (err4, result4) => {
							if (err4) {
								ftoConnectionPool.rollback(() => {
									// Failed to insert data into table
									bFailedRequestSubmissionTblQuery = true;
									reject(GetSqlErrorObj(err4, `${filename}:${LineNumber()}`));
								});
								return;
							}
							submissionResults['fto_request_submissions'] = result4;

							// Commit the transaction if relevant insert queries are successful
							if (MyXNOR(!bFailedTrackTblQuery, submissionResults.hasOwnProperty('fto_track_edit')) && 
							MyXNOR(!bFailedOccurrenceTblQuery, submissionResults.hasOwnProperty('fto_occurrence')) && 
							MyXNOR(!bFailedRequestTrackEditTblQuery, submissionResults.hasOwnProperty('fto_request_track_edit')) && 
							MyXNOR(!bFailedRequestSubmissionTblQuery, submissionResults.hasOwnProperty('fto_request_submissions'))) {
								ftoConnectionPool.commit((err) => {
									if (err) {
										ftoConnectionPool.rollback(() => {
											LogError('PostSubmission_TrackEdit', `Failed to commit transaction.\nError Message: ${err.sqlMessage}`);
											reject(GetSqlErrorObj(err, `${filename}:${LineNumber()}`));
										});
										return;
									}
									ftoConnectionPool.release();
									resolve(submissionResults);
								});
							}
							else {
								// Insert queries not successful
								ftoConnectionPool.release();
							}
						});
					});
				}
			});
		});
	});
}

/**
 * Removes a new track from an episode in the FTO database.
 * @function PostSubmission_TrackRemove
 * @param {number} nFtoTrackID -  The ID of the track submission is for.
 * @param {number} nFtoOccurrenceID - The ID of the occurrence submission is for.
 * @param {object} objUserSubmission - The data being submitted by the user.
 * @returns {Promise<object[]>} A promise that resolves to an array of anime objects matching the provided ID.
 *                              Each object represents an anime record from the database.
 *                              If no matching records are found, the promise resolves to an empty array.
 *                              If an error occurs during the database query, the promise rejects with the error.
 */
const PostSubmission_TrackRemove = (nFtoTrackID, nFtoOccurrenceID, objUserSubmission) => {
	return new Promise((resolve, reject) => {
		FtoConnectionPool.getConnection((err, ftoConnectionPool) => {
			if (err) {
				LogError('PostSubmission_TrackRemove', `Failed to connect to the database.\nError Message: ${err.sqlMessage}`, LineNumber());
				reject(GetSqlErrorObj(err));
				return;
			}
			const submissionResults = {}

			ftoConnectionPool.beginTransaction(async (err0) => {
				if (err0) {
					LogError('PostSubmission_TrackRemove', `Failed to start transaction.\nError Message: ${err0.sqlMessage}`, LineNumber());
					reject(GetSqlErrorObj(err0));
					return;
				}

				let bFailedOccurrenceTblQuery = false; 
				let bFailedRequestTrackRemoveTblQuery = false; 
				let bFailedRequestSubmissionTblQuery = false; 
				
				// Disable foreign key checks
				ftoConnectionPool.query('SET FOREIGN_KEY_CHECKS = 0', (err_a) => {
					if (err_a) {
						reject(GetSqlErrorObj(err_a, `${filename}:${LineNumber()}`));
					}
				
					// Perform deletion operation
					const sqlQuery1 = 'DELETE FROM `fto_occurrence` WHERE occurrence_id =' + nFtoOccurrenceID;
					ftoConnectionPool.query(sqlQuery1, (err1, result1) => {
						if (err1) {
							ftoConnectionPool.rollback(() => {
								// Failed to delete data from table
								bFailedOccurrenceTblQuery = true;
								reject(GetSqlErrorObj(err1, `${filename}:${LineNumber()}`));
							});
							return;
						}
						submissionResults['fto_occurrence'] = result1;

						// Remove Track details
						const nUserID = Number(objUserSubmission['user_id']);
						const sqlQuery2 = 'INSERT INTO `fto_request_track_remove_from_episode` SET ?';
						const postData2 = {
							fto_user_id: nUserID,
							fto_track_id: nFtoTrackID,
							fto_occurrence_id: nFtoOccurrenceID,
							track_remove_reason: String(objUserSubmission.submit_removeReason),
						};
						ftoConnectionPool.query(sqlQuery2, postData2, (err2, result2) => {
							if (err2) {
								ftoConnectionPool.rollback(() => {
									// Failed to insert data into table
									bFailedRequestTrackRemoveTblQuery = true;
									reject(GetSqlErrorObj(err2, `${filename}:${LineNumber()}`));
								});
								return;
							}
							submissionResults['fto_request_track_remove_from_episode'] = result2;

							// Retrieve the auto-incremented ID from the first insert and Prepare Third insert query using the retrieved ID
							const insertedTrackEditRequestId = Number(result2.insertId);
							const sqlQuery3 = 'INSERT INTO `fto_request_submissions` SET ?';
							const postData3 = {
								submission_type: 'TRACK_REMOVE',
								request_id: insertedTrackEditRequestId,
								fto_user_id: nUserID,
								fto_track_id: nFtoTrackID,
								fto_occurrence_id: nFtoOccurrenceID,
							};
							ftoConnectionPool.query(sqlQuery3, postData3, (err3, result3) => {
								if (err3) {
									ftoConnectionPool.rollback(() => {
										// Failed to insert data into table
										bFailedRequestSubmissionTblQuery = true;
										reject(GetSqlErrorObj(err3, `${filename}:${LineNumber()}`));
									});
									return;
								}
								submissionResults['fto_request_submissions'] = result3;
			
								// Re-enable foreign key checks
								ftoConnectionPool.query('SET FOREIGN_KEY_CHECKS = 1', (err) => {
									if (err) {
										reject(GetSqlErrorObj(err1, `${filename}:${LineNumber()}`));
									}

									// Commit the transaction if relevant insert queries are successful
									if (MyXNOR(!bFailedOccurrenceTblQuery, submissionResults.hasOwnProperty('fto_occurrence')) && 
									MyXNOR(!bFailedRequestTrackRemoveTblQuery, submissionResults.hasOwnProperty('fto_request_track_remove_from_episode')) && 
									MyXNOR(!bFailedRequestSubmissionTblQuery, submissionResults.hasOwnProperty('fto_request_submissions'))) {
										ftoConnectionPool.commit((err) => {
											if (err) {
												ftoConnectionPool.rollback(() => {
													LogError('PostSubmission_TrackRemove', `Failed to commit transaction.\nError Message: ${err.sqlMessage}`);
													reject(GetSqlErrorObj(err, `${filename}:${LineNumber()}`));
												});
												return;
											}
											ftoConnectionPool.release();
											resolve(submissionResults);
										});
									}
									else {
										// Insert queries not successful
										ftoConnectionPool.release();
									}
								});
							});
						});
					}); 
				});
			});
		});
	});
}

module.exports = {
	PerformSelectQuery,
	GetAllAnime,
	GetAnime,
	PatchAnime,
	GetAnimeMappingMAL,
	PostAnimeIntoDB,
	GetEpisodeMapping,
	PostEpisodesIntoDB,
	GetTracksForAnime,
	GetTrackCountForMALAnimes,
	GetTracksForEpisode,
	GetTrack,
	GetSubmissionContext_TrackAdd,
	PostSubmission_TrackAdd,
	PostSubmission_TrackAddPreExisting,
	GetSubmissionContext_TrackEdit,
	PostSubmission_TrackEdit,
	PostSubmission_TrackRemove,
};