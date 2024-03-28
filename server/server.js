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
    GetSubmissionContext_TrackAdd, 
    PostSubmission_TrackAdd,
    GetSubmissionContext_TrackEdit,
    PostSubmission_TrackEdit,
    PostSubmission_TrackRemove,
    GetTracksForAnime,
    PostSubmission_TrackAddPreExisting,
    GetTrackCountForMALAnimes,
} = require('./sql/database');
const { IsEmpty } = require('./utils/BackendUtils');

app.use(express.json());
// app.use((req, res, next) => {
//     setTimeout(() => {
//         next();
//     }, 3500); // Simulate 2-second delay
// });

app.get("/findthatost_api/username", (req, res) => {
    res.json({
        "username": "Adrian"
    });
});

app.get("/findthatost_api/getAnimes", async (req, res) => {
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

app.get("/findthatost_api/getAnime/:nFtoAnimeID", async (req, res) => {
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

app.get("/findthatost_api/postAnimeIntoDB/:nMalID", async (req, res) => {    
    // Insert Anime into DB and return new fto anime id
    try {
        const ftoResponse = await PostAnimeIntoDB(req.params.nMalID, -1);
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

app.get("/findthatost_api/postAnimeIntoDB/:nMalID/:nKitsuID", async (req, res) => {
    // Insert Anime into DB and return new fto anime id
    try {
        const ftoResponse = await PostAnimeIntoDB(req.params.nMalID, req.params.nKitsuID);
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

app.get("/findthatost_api/patchAnime/:nFtoAnimeID/title/:strAnimeTitle/parent_id/:nAnimePrequel", async (req, res) => {
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

app.get("/findthatost_api/patchAnime/:nFtoAnimeID/title/:strAnimeTitle", async (req, res) => {
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

app.get("/findthatost_api/patchAnime/:nFtoAnimeID/parent_id/:nAnimePrequel", async (req, res) => {
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

app.get("/findthatost_api/getAnimeMappingMAL/:nMalID", async (req, res) => {
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

app.get("/findthatost_api/getEpisodes/anime/:nFtoAnimeID/episode_no/:nEpisodeNo", async (req, res) => {
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
        let objError = {};
        objError.error = 'Internal Server Error';
        objError.details = error;
        res.status(500).json(objError);
    }
});

app.get("/findthatost_api/getEpisodes/anime/:nFtoAnimeID", async (req, res) => {
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
        let objError = {};
        objError.error = 'Internal Server Error';
        objError.details = error;
        res.status(500).json(objError);
    }
});

app.post("/findthatost_api/postMissingEpisodes/:nFtoAnimeID", async (req, res) => {
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

app.get("/findthatost_api/getAnimeTracks/anime_id/:nFtoAnimeID", async (req, res) => {
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

app.post("/findthatost_api/getAnimeTrackCount/mal_ids", async (req, res) => {
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

app.get("/findthatost_api/getTracks/episode_id/:nEpisodeID/", async (req, res) => {
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
        let objError = {};
        objError.error = 'Internal Server Error';
        objError.details = error;
        res.status(500).json(objError);
    }
});

app.get("/findthatost_api/getTrack/:nTrackID/", async (req, res) => {
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
        let objError = {};
        objError.error = 'Internal Server Error';
        objError.details = error;
        res.status(500).json(objError);
    }
});

app.get("/findthatost_api/getTrack/:nTrackID/context_id/:nOccurrenceID", async (req, res) => {
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
        let objError = {};
        objError.error = 'Internal Server Error';
        objError.details = error;
        res.status(500).json(objError);
    }
});

app.get("/findthatost_api/getSubmissionContext/track_add/:nFtoAnimeID/", async (req, res) => {
    //Get Conext information to add a track to the anime with corresponding FTO Anime ID
    const nFtoAnimeID = req.params.nFtoAnimeID;
    try {
        const ftoTracksDetails = await GetSubmissionContext_TrackAdd(nFtoAnimeID);
        if (ftoTracksDetails.length == 0) {
            return res.status(204).json({ error: 'No Results found' }).end(); 
        }
        res.status(200).json(ftoTracksDetails);
    }
    catch (error) {
        let objError = {};
        objError.error = 'Internal Server Error';
        objError.details = error;
        res.status(500).json(objError);
    }
});

app.get("/findthatost_api/getSubmissionContext/track_add/:nFtoAnimeID/episode_no/:nEpisodeNo", async (req, res) => {
    //Get Conext information to add a track to the anime with corresponding FTO Anime ID and episode number
    const nFtoAnimeID = req.params.nFtoAnimeID;
    const nEpisodeNo = req.params.nEpisodeNo;
    try {
        const ftoTracksDetails = await GetSubmissionContext_TrackAdd(nFtoAnimeID, nEpisodeNo);
        if (ftoTracksDetails.length == 0) {
            return res.status(204).json({ error: 'No Results found' }).end(); 
        }
        res.status(200).json(ftoTracksDetails);
    }
    catch (error) {
        let objError = {};
        objError.error = 'Internal Server Error';
        objError.details = error;
        res.status(500).json(objError);
    }
});

app.post("/findthatost_api/postSubmission/track_add/:nFtoAnimeID/episode_id/:nFtoEpisodeID", async (req, res) => {
    var date = new Date(); // for now
    console.log(req.body)
    const { objUserSubmission } = req.body;
    if (!objUserSubmission) {
        return res.status(400).json({ error: 'Invalid data format' });
    }

    try {
        const nFtoAnimeID = req.params.nFtoAnimeID;
        const nFtoEpisodeID = req.params.nFtoEpisodeID;
        const ftoResponse = await PostSubmission_TrackAdd(nFtoAnimeID, nFtoEpisodeID, objUserSubmission);
        res.status(200).json(ftoResponse);
    } 
    catch (error) {
        let objError = {};
        objError.error = 'Internal Request Error';
        objError.time = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds().toLocaleString('en-US', 
        {
            minimumIntegerDigits: 2,
            useGrouping: false
        })}`;
        objError.details = error;
        res.status(500).json(objError);
        console.log(`Insert Requestf Error (${objError.time}):\n`, error);
    } 
});

app.post("/findthatost_api/postSubmission/track_add_pre_existing/:nFtoEpisodeID", async (req, res) => {
    var date = new Date(); // for now
    console.log(req.body)
    const { objUserSubmission } = req.body;
    if (!objUserSubmission) {
        return res.status(400).json({ error: 'Invalid data format' });
    }

    try {
        const nFtoEpisodeID = req.params.nFtoEpisodeID;
        const ftoResponse = await PostSubmission_TrackAddPreExisting(nFtoEpisodeID, objUserSubmission);
        res.status(200).json(ftoResponse);
    } 
    catch (error) {
        let objError = {};
        objError.time = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds().toLocaleString('en-US', 
        {
            minimumIntegerDigits: 2,
            useGrouping: false
        })}`;
        objError.details = error;
        console.log(`Insert Request Error (${objError.time}):\n`, error);
        if (typeof error == 'object' && !IsEmpty(error)) {
            if ('code' in error) {
                if (error.code === 'ER_DUP_ENTRY') {
                    objError.error = 'Conflict';
                    return res.status(409).json(objError);; // Status Code: Conflict
                }
            }
        }
        objError.error = 'Internal Request Error';
        return res.status(500).json(objError);
    } 
});

app.get("/findthatost_api/getSubmissionContext/track_edit/:nFtoTrackID/", async (req, res) => {
    //Get Conext information to add a track to the anime with corresponding FTO Anime ID
    const nFtoTrackID = req.params.nFtoTrackID;
    try {
        const ftoTracksDetails = await GetSubmissionContext_TrackEdit(nFtoTrackID);
        if (ftoTracksDetails.length == 0) {
            return res.status(204).json({ error: 'No Results found' }).end(); 
        }
        res.status(200).json(ftoTracksDetails);
    }
    catch (error) {
        let objError = {};
        objError.error = 'Internal Server Error';
        objError.details = error;
        res.status(500).json(objError);
    }
});

app.get("/findthatost_api/getSubmissionContext/track_edit/:nFtoTrackID/occurrence_id/:nFtoOccurrenceID", async (req, res) => {
    //Get Conext information to add a track to the anime with corresponding FTO Anime ID and episode number
    const nFtoTrackID = req.params.nFtoTrackID;
    const nFtoOccurrenceID = req.params.nFtoOccurrenceID;
    try {
        const ftoTracksDetails = await GetSubmissionContext_TrackEdit(nFtoTrackID, nFtoOccurrenceID);
        if (ftoTracksDetails.length == 0) {
            return res.status(204).json({ error: 'No Results found' }).end(); 
        }
        res.status(200).json(ftoTracksDetails);
    }
    catch (error) {
        let objError = {};
        objError.error = 'Internal Server Error';
        objError.details = error;
        res.status(500).json(objError);
    }
});

app.post("/findthatost_api/postSubmission/track_edit/:nFtoTrackID/occurrence_id/:nFtoOccurrenceID", async (req, res) => {
    const { objUserSubmission } = req.body;
    if (!objUserSubmission) {
        return res.status(400).json({ error: 'Invalid data format' });
    }

    try {
        const nFtoTrackID = req.params.nFtoTrackID;
        const nFtoOccurrenceID = req.params.nFtoOccurrenceID;
        console.log("Details:", objUserSubmission);
        const ftoResponse = await PostSubmission_TrackEdit(nFtoTrackID, nFtoOccurrenceID, objUserSubmission);
        if (!IsEmpty(ftoResponse)) {
            res.status(200).json(ftoResponse);
        }
        else {
            throw new Error("Expected non empty array.");
        }
    } 
    catch (error) {
        let date = new Date(); // for now
        let objError = {};
        objError.error = 'Internal Request Error';
        objError.time = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds().toLocaleString('en-US', 
        {
            minimumIntegerDigits: 2,
            useGrouping: false
        })}`;
        objError.details = error;
        res.status(500).json(objError);
        console.log(`Insert Request Error (${objError.time}):\n`, error);
    } 
});

app.post("/findthatost_api/postSubmission/track_remove/:nFtoTrackID/occurrence_id/:nFtoOccurrenceID", async (req, res) => {
    const { objUserSubmission } = req.body;
    if (!objUserSubmission) {
        return res.status(400).json({ error: 'Invalid data format' });
    }

    try {
        const nFtoTrackID = req.params.nFtoTrackID;
        const nFtoOccurrenceID = req.params.nFtoOccurrenceID;
        console.log("Details:", objUserSubmission);
        const ftoResponse = await PostSubmission_TrackRemove(nFtoTrackID, nFtoOccurrenceID, objUserSubmission);
        if (!IsEmpty(ftoResponse)) {
            res.status(200).json(ftoResponse);
        }
        else {
            throw new Error("Expected non empty array.");
        }
    } 
    catch (error) {
        let date = new Date(); // for now
        let objError = {};
        objError.error = 'Internal Request Error';
        objError.time = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds().toLocaleString('en-US', 
        {
            minimumIntegerDigits: 2,
            useGrouping: false
        })}`;
        objError.details = error;
        res.status(500).json(objError);
        console.log(`Insert Request Error (${objError.time}):\n`, error);
    } 
});

app.listen(port, ()=> {console.log(`Server started on port ${port}`)});
