const express = require("express");
const router = express.Router();
const { 
    GetAllAnime,
    GetAnime,
    PatchAnime,
    GetTracksForAnime,
    PostAnimeIntoDB,
    GetAnimeMappingMAL,
    GetEpisodeMapping,
    GetTrackCountForMALAnimes,
    PostEpisodesIntoDB,
} = require('./../sql/database');
const { IsEmpty } = require("../utils/BackendUtils");

router.get("/all", async (req, res) => {
    try {
        const allAnime = await GetAllAnime();
        if (!allAnime || allAnime.length == 0) {
            return res.status(204).json({ error: 'No Results found' }).end(); 
        }
        res.status(200).json(allAnime);
    }
    catch (error) {
        let objError = {};
        objError.error = 'Internal Server Error';
        objError.details = error;
        res.status(500).json(objError);
    }
});

router.get("/:nFtoAnimeID", async (req, res) => {
    //Get details for anime for anime with id AnimeID
    const nFtoAnimeID = req.params.nFtoAnimeID;
    try {
        const ftoAnimeDetails = await GetAnime(nFtoAnimeID);
        if (!ftoAnimeDetails || ftoAnimeDetails.length == 0) {
            return res.status(204).json({ error: 'No Results found' }).end(); 
        }
        res.status(200).json(ftoAnimeDetails);
    }
    catch (error) {
        let objError = {};
        objError.error = 'Internal Server Error';
        objError.details = error;
        res.status(500).json(objError);
    }
});

router.get("/:nFtoAnimeID/full", async (req, res) => {
    //Get full details for anime for anime with id AnimeID (including track info)
    const nFtoAnimeID = req.params.nFtoAnimeID;
    try {
        const ftoAnimeDetails = await GetAnime(nFtoAnimeID);
        if (!ftoAnimeDetails || ftoAnimeDetails.length == 0) {
            return res.status(204).json({ error: 'No Results found' }).end(); 
        }

        const ftoAnimeTracks = await GetTracksForAnime(nFtoAnimeID);
        const ftoFullAnimeDetails = { 
            ...ftoAnimeDetails[0], 
            track_list: (IsEmpty(ftoAnimeTracks) ? null : ftoAnimeTracks),
        };
        res.status(200).json(ftoFullAnimeDetails);
    }
    catch (error) {
        let objError = {};
        objError.error = 'Internal Server Error';
        objError.details = error;
        res.status(500).json(objError);
    }
});

router.post("/mal_anime_id/:nMalID", async (req, res) => {    
    // Insert Anime into DB and return new fto anime id
    const { strMalAnimeTitle } = req.body;
    try {
        const ftoResponse = await PostAnimeIntoDB(req.params.nMalID, strMalAnimeTitle);
        if (ftoResponse.affectedRows === 1 && ftoResponse.insertId !== 0) {
            return res.status(201).json(ftoResponse).end();
        }
        res.status(200).json(ftoResponse);
    }
    catch (error) {
        let objError = {};
        objError.error = 'Internal Server Error';
        objError.details = error;
        res.status(500).json(objError);
    }
});

router.post("/mal_anime_id/:nMalID/kitsu_anime_id/:nKitsuID", async (req, res) => {    
    // Insert Anime into DB and return new fto anime id
    const { strMalAnimeTitle } = req.body;
    try {
        const ftoResponse = await PostAnimeIntoDB(req.params.nMalID, strMalAnimeTitle, req.params.nKitsuID);
        if (ftoResponse.affectedRows === 1 && ftoResponse.insertId !== 0) {
            return res.status(201).json(ftoResponse).end();
        }
        res.status(200).json(ftoResponse);
    }
    catch (error) {
        let objError = {};
        objError.error = 'Internal Server Error';
        objError.details = error;
        res.status(500).json(objError);
    }
});

router.get("/mal_mapping/:nMalID", async (req, res) => {
    //Get AnimeID for anime with corresponding MAL ID
    const nMalID = req.params.nMalID;
    try {
        const ftoAnimeDetails = await GetAnimeMappingMAL(nMalID);
        if (!ftoAnimeDetails || ftoAnimeDetails.length === 0) {
            return res.status(204).json({ error: 'Resource not found' }).end(); 
        }
        res.status(200).json(ftoAnimeDetails);
    }
    catch (error) {
        let objError = {};
        objError.error = 'Internal Server Error';
        objError.details = error;
        res.status(500).json(objError);
    }
});

router.get("/:nFtoAnimeID/episodes", async (req, res) => {
    //Get All Episode Mappings for anime with corresponding MAL ID
    const nFtoAnimeID = req.params.nFtoAnimeID;
    try {
        const ftoEpisodeDetails = await GetEpisodeMapping(nFtoAnimeID);
        if (!ftoEpisodeDetails) {
            return res.status(404).json({ error: 'Resource Not Found' }).end(); 
        }
        res.status(200).json(ftoEpisodeDetails);
    }
    catch (error) {
        let objError = {};
        objError.error = 'Internal Server Error';
        objError.details = error;
        res.status(500).json(objError);
    }
});

router.get("/:nFtoAnimeID/episode_number/:nEpisodeNo", async (req, res) => {
    //Get Episode Mapping for anime with corresponding MAL ID
    const nFtoAnimeID = req.params.nFtoAnimeID;
    const nEpisodeNo = req.params.nEpisodeNo;
    try {
        const ftoEpisodeDetails = await GetEpisodeMapping(nFtoAnimeID, nEpisodeNo);
        if (!ftoEpisodeDetails) {
            return res.status(404).json({ error: 'Resource Not Found' }).end(); 
        }
        res.status(200).json(ftoEpisodeDetails);
    }
    catch (error) {
        let objError = {};
        objError.error = 'Internal Server Error';
        objError.details = error;
        res.status(500).json(objError);
    }
});

router.get("/:nFtoAnimeID/tracks", async (req, res) => {
    //Get List of Tracks for the anime with corresponding FTO Anime ID
    const nFtoAnimeID = req.params.nFtoAnimeID;
    try {
        const ftoAnimeTracksDetails = await GetTracksForAnime(nFtoAnimeID);
        if (IsEmpty(ftoAnimeTracksDetails)) {
            return res.status(404).json({ error: 'Resource Not Found' }).end(); 
        }
        res.status(200).json(ftoAnimeTracksDetails);
    }
    catch (error) {
        let objError = {};
        objError.error = 'Internal Server Error';
        objError.details = error;
        res.status(500).json(objError);
    }
});

router.post("/:nFtoAnimeID/tracks", async (req, res) => {
    //Get List of Tracks for the anime with corresponding FTO Anime ID
    const nFtoAnimeID = req.params.nFtoAnimeID;
    const { nExcludedFtoEpisodeId } = req.body;
    try {
        const ftoAnimeTracksDetails = await GetTracksForAnime(nFtoAnimeID, nExcludedFtoEpisodeId);
        if (IsEmpty(ftoAnimeTracksDetails)) {
            return res.status(404).json({ error: 'Resource Not Found' }).end(); 
        }
        res.status(200).json(ftoAnimeTracksDetails);
    }
    catch (error) {
        let objError = {};
        objError.error = 'Internal Server Error';
        objError.details = error;
        res.status(500).json(objError);
    }
});

router.patch("/:nFtoAnimeID/title/:strAnimeTitle/parent_id/:nAnimePrequel", async (req, res) => {
    // Update Anime title and prequel info
    try { 
        const ftoResponse = await PatchAnime(req.params.nFtoAnimeID, req.params.strAnimeTitle, req.params.nAnimePrequel);
        if (ftoResponse.affectedRows === 1) {
            return res.status(201).json(ftoResponse).end();
        }
        res.status(200).json(ftoResponse);
    }
    catch (error) {
        let objError = {};
        objError.error = 'Internal Server Error';
        objError.details = error;
        res.status(500).json(objError);
    }
});

router.patch("/:nFtoAnimeID/title/:strAnimeTitle", async (req, res) => {
    // Update Anime title
    try { 
        const ftoResponse = await PatchAnime(req.params.nFtoAnimeID, req.params.strAnimeTitle, 0);
        if (ftoResponse.affectedRows === 1) {
            return res.status(201).json(ftoResponse).end();
        }
        res.status(200).json(ftoResponse);
    }
    catch (error) {
        let objError = {};
        objError.error = 'Internal Server Error';
        objError.details = error;
        res.status(500).json(objError);
    }
});

router.patch("/:nFtoAnimeID/parent_id/:nAnimePrequel", async (req, res) => {
    // Update Anime prequel info
    try { 
        const ftoResponse = await PatchAnime(req.params.nFtoAnimeID, '', req.params.nAnimePrequel);
        if (ftoResponse.affectedRows === 1) {
            return res.status(201).json(ftoResponse).end();
        }
        res.status(200).json(ftoResponse);
    }
    catch (error) {
        let objError = {};
        objError.error = 'Internal Server Error';
        objError.details = error;
        res.status(500).json(objError);
    }
});

router.post("/anime_list_track_counts/post_mal_ids", async (req, res) => {
    //Get List of Tracks for the anime with corresponding FTO Anime ID
    const { listMalAnimeIds } = req.body;

    if (IsEmpty(listMalAnimeIds) || !Array.isArray(listMalAnimeIds)) {
        return res.status(400).json({ error: 'Invalid data format' });
    }

    try {
        const ftoMalAnimeTracksCount = await GetTrackCountForMALAnimes(listMalAnimeIds);

        // All queries successful
        return res.status(200).json({ message: 'Bulk select successful', data: ftoMalAnimeTracksCount });
        
    } 
    catch (error) {
        let objError = {};
        objError.error = 'Internal Server Error';
        objError.details = error;
        res.status(500).json(objError);
    }
});

router.post("/:nFtoAnimeID/post_missing_episodes", async (req, res) => {
    const { data } = req.body;

    if (!data || !Array.isArray(data) || data.length === 0) {
        return res.status(400).json({ error: 'Invalid data format' });
    }

    try {
        const nFtoAnimeID = req.params.nFtoAnimeID;
        const ftoResponse = await PostEpisodesIntoDB(nFtoAnimeID, data);

        const failedQueries = ftoResponse.reduce((failed, result, index) => {
            if (result instanceof Error) {
                failed.push(index + 1);
            }
            return failed;
        }, []);
      
        if (failedQueries.length === 0) {
            // All queries successful
            return res.status(200).json({ message: 'Bulk insert successful' });
        } else if (failedQueries.length === data.length) {
            // All queries failed
            return res.status(500).json({ error: 'All Bulk insert failed', failedQueries });
        } else {
            // Partial success, partial failure
            return res.status(207).json({ message: 'Some queries failed', failedQueries }).end;
        }
    } 
    catch (error) {
        let objError = {};
        objError.error = 'Internal Request Error';
        objError.details = error;
        res.status(500).json(objError);
    }
}); 

module.exports = router;