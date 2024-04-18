const { IsEmpty } = require('../utils/BackendUtils');
const { 
    tblName_anime,
    tblName_episode,
} = require('./db_tableNames');

const Query_PostMissingEpisode = (nFtoAnimeID, listOfEpisodesDetails) => {
    const sqlQuery = listOfEpisodesDetails.map(row => {
        let malID = (IsEmpty(row.mal_episode_id)) ? null : row.mal_episode_id;
        let kitsuID = (IsEmpty(row.kitsu_episode_id)) ? null : row.kitsu_episode_id;
        let rowQuery =  `INSERT INTO ${tblName_episode} (fto_anime_id, episode_no, mal_episode_id, kitsu_episode_id, episode_title)`+' '+
                        `SELECT ${nFtoAnimeID}, ${row.episode_no}, ${malID}, ${kitsuID}, '${row.episode_title}'`+' '+
                        `WHERE NOT EXISTS (`+' '+
                            `SELECT episode_id`+' '+
                            `FROM ${tblName_episode}`+' '+
                            `WHERE fto_anime_id = ${nFtoAnimeID}`+' '+
                            `AND episode_no = ${row.episode_no}`+' '+
                            `LIMIT 1 ` +
                        `);`
        return rowQuery;
    });
    return sqlQuery;
}


module.exports = {
    Query_PostMissingEpisode,
}