const { 
    tblName_anime,
    tblName_episode,
} = require('./db_tableNames');

const Query_PostMissingEpisode = (nFtoAnimeID, listOfEpisodesDetails) => {
const sqlQuery = listOfEpisodesDetails.map(row =>
`INSERT INTO ${tblName_episode} (fto_anime_id, episode_no, mal_episode_id, kitsu_episode_id, episode_title)`+' '+
`SELECT ${nFtoAnimeID}, ${row.episode_no}, ${row.mal_episode_id}, ${row.kitsu_episode_id}, '${row.episode_title}'`+' '+
`WHERE NOT EXISTS (`+' '+
    `SELECT episode_id`+' '+
    `FROM ${tblName_episode}`+' '+
    `WHERE fto_anime_id = ${nFtoAnimeID}`+' '+
    `AND episode_no = ${row.episode_no}`+' '+
    `LIMIT 1 ` +
`);`
);
return sqlQuery;
}



module.exports = {
    Query_PostMissingEpisode,
}