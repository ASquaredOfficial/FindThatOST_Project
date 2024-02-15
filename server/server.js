const express = require('express');
const app = express();
const bodyParser = require('body-parser');
var port = process.env.PORT || 5000;

const { 
    GetAllAnime, 
    GetAnime, 
    PatchAnime, 
    GetAnimeMappingMAL, 
    PostAnimeIntoDB,
    GetEpisodeMapping,
    PostEpisodesIntoDB,
    GetTracksForEpisode, 
    GetTrack,
} = require('./sql/database');

app.use(bodyParser.json());

app.get("/api", (req, res) => {
    res.json({
        "username": "Adrian"
    });
});

app.get("/getAnimes", async (req, res) => {
    try {
        const allAnime = await GetAllAnime();
        if (!allAnime || allAnime.length == 0) {
            return res.status(204).json({ error: 'No Results found' }).end(); 
        }
        res.status(200).json(allAnime);
    }
    catch (error) {
        var objError = {};
        objError.error = 'Internal Server Error';
        objError.details = error;
        res.status(500).json(objError);
    }
});

app.get("/getAnime/:nFtoAnimeID", async (req, res) => {
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
        var objError = {};
        objError.error = 'Internal Server Error';
        objError.details = error;
        res.status(500).json(objError);
    }
});

app.get("/postAnimeIntoDB/:nMalID", async (req, res) => {    
    // Insert Anime into DB and return new fto anime id
    try {
        const ftoResponse = await PostAnimeIntoDB(req.params.nMalID, -1);
        if (ftoResponse.affectedRows === 1 && ftoResponse.insertId !== 0) {
            return res.status(201).json(ftoResponse).end();
        }
        res.status(200).json(ftoResponse);
    }
    catch (error) {
        var objError = {};
        objError.error = 'Internal Server Error';
        objError.details = error;
        res.status(500).json(objError);
    }
});

app.get("/postAnimeIntoDB/:nMalID/:nKitsuID", async (req, res) => {
    // Insert Anime into DB and return new fto anime id
    try {
        const ftoResponse = await PostAnimeIntoDB(req.params.nMalID, req.params.nKitsuID);
        if (ftoResponse.affectedRows === 1 && ftoResponse.insertId !== 0) {
            return res.status(201).json(ftoResponse).end();
        }
        res.status(200).json(ftoResponse);
    }
    catch (error) {
        var objError = {};
        objError.error = 'Internal Server Error';
        objError.details = error;
        res.status(500).json(objError);
    }
});

app.get("/patchAnime/:nFtoAnimeID/title/:strAnimeTitle/parent_id/:nAnimePrequel", async (req, res) => {
    // Update Anime title and prequel info
    try { 
        const ftoResponse = await PatchAnime(req.params.nFtoAnimeID, req.params.strAnimeTitle, req.params.nAnimePrequel);
        if (ftoResponse.affectedRows === 1) {
            return res.status(201).json(ftoResponse).end();
        }
        res.status(200).json(ftoResponse);
    }
    catch (error) {
        var objError = {};
        objError.error = 'Internal Server Error';
        objError.details = error;
        res.status(500).json(objError);
    }
});

app.get("/patchAnime/:nFtoAnimeID/title/:strAnimeTitle", async (req, res) => {
    // Update Anime title
    try { 
        const ftoResponse = await PatchAnime(req.params.nFtoAnimeID, req.params.strAnimeTitle, 0);
        if (ftoResponse.affectedRows === 1) {
            return res.status(201).json(ftoResponse).end();
        }
        res.status(200).json(ftoResponse);
    }
    catch (error) {
        var objError = {};
        objError.error = 'Internal Server Error';
        objError.details = error;
        res.status(500).json(objError);
    }
});

app.get("/patchAnime/:nFtoAnimeID/parent_id/:nAnimePrequel", async (req, res) => {
    // Update Anime prequel info
    try { 
        const ftoResponse = await PatchAnime(req.params.nFtoAnimeID, '', req.params.nAnimePrequel);
        if (ftoResponse.affectedRows === 1) {
            return res.status(201).json(ftoResponse).end();
        }
        res.status(200).json(ftoResponse);
    }
    catch (error) {
        var objError = {};
        objError.error = 'Internal Server Error';
        objError.details = error;
        res.status(500).json(objError);
    }
});

app.get("/getAnimeMappingMAL/:nMalID", async (req, res) => {
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
        var objError = {};
        objError.error = 'Internal Server Error';
        objError.details = error;
        res.status(500).json(objError);
    }
});

app.get("/getEpisodes/anime/:nFtoAnimeID/episode_no/:nEpisodeNo", async (req, res) => {
    //Get AnimeID for anime with corresponding MAL ID
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
        var objError = {};
        objError.error = 'Internal Server Error';
        objError.details = error;
        res.status(500).json(objError);
    }
});

app.get("/getEpisodes/anime/:nFtoAnimeID", async (req, res) => {
    //Get AnimeID for anime with corresponding MAL ID
    const nFtoAnimeID = req.params.nFtoAnimeID;
    try {
        const ftoEpisodeDetails = await GetEpisodeMapping(nFtoAnimeID);
        if (!ftoEpisodeDetails) {
            return res.status(404).json({ error: 'Resource Not Found' }).end(); 
        }
        res.status(200).json(ftoEpisodeDetails);
    }
    catch (error) {
        var objError = {};
        objError.error = 'Internal Server Error';
        objError.details = error;
        res.status(500).json(objError);
    }
});

app.post("/postMissingEpisodes/:nFtoAnimeID", async (req, res) => {
    var date = new Date(); // for now
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
        var objError = {};
        objError.error = 'Internal Request Error';
        objError.time = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
        objError.details = error;
        res.status(500).json(objError);
        console.log(`Insert Request Error (${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}):\n`, error);
    }
}); 

app.get("/getTracks/episode_id/:nEpisodeID/", async (req, res) => {
    //Get List of Tracks for the episode with corresponding FTO Episode ID
    const nEpisodeID = req.params.nEpisodeID;
    try {
        const ftoEpisodeTracksDetails = await GetTracksForEpisode(nEpisodeID);
        if (!ftoEpisodeTracksDetails) {
            return res.status(404).json({ error: 'Resource Not Found' }).end(); 
        }
        res.status(200).json(ftoEpisodeTracksDetails);
    }
    catch (error) {
        var objError = {};
        objError.error = 'Internal Server Error';
        objError.details = error;
        res.status(500).json(objError);
    }
});

app.get("/getTrack/:nTrackID/", async (req, res) => {
    //Get List of Tracks for the episode with corresponding FTO Episode ID
    const nTrackID = req.params.nTrackID;
    try {
        const ftoTracksDetails = await GetTrack(nTrackID);
        if (ftoTracksDetails.length == 0) {
            return res.status(204).json({ error: 'No Results found' }).end(); 
        }
        res.status(200).json(ftoTracksDetails);
    }
    catch (error) {
        var objError = {};
        objError.error = 'Internal Server Error';
        objError.details = error;
        res.status(500).json(objError);
    }
});

app.get("/getTrack/:nTrackID/context_id/:nOccurrenceID", async (req, res) => {
    //Get List of Tracks for the episode with corresponding FTO Episode ID
    const nTrackID = req.params.nTrackID;
    const nOccurrenceID = req.params.nOccurrenceID;
    try {
        const ftoTracksDetails = await GetTrack(nTrackID, nOccurrenceID);
        if (ftoTracksDetails.length == 0) {
            return res.status(204).json({ error: 'No Results found' }).end(); 
        }
        res.status(200).json(ftoTracksDetails);
    }
    catch (error) {
        var objError = {};
        objError.error = 'Internal Server Error';
        objError.details = error;
        res.status(500).json(objError);
    }
});

app.listen(port, ()=> {console.log(`Server started on port ${port}`)});
