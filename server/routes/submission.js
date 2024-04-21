const express = require("express");
const router = express.Router();
const { 
    GetSubmissionContext_TrackAdd,
    GetSubmissionContext_TrackEdit,
    PostSubmission_TrackAdd,
    PostSubmission_TrackAddPreExisting,
    PostSubmission_TrackEdit,
    PostSubmission_TrackRemove,
} = require('../sql/database');
const { IsEmpty } = require("../utils/BackendUtils");

router.get("/context_info/track_add/:nFtoAnimeID", async (req, res) => {
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

router.get("/context_info/track_add/:nFtoAnimeID/episode_number/:nEpisodeNo", async (req, res) => {
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

router.get("/context_info/track_edit/:nFtoTrackID", async (req, res) => {
    //Get Conext information to edit a track for the track with corresponding FTO Track ID
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

router.get("/context_info/track_edit/:nFtoTrackID/occurrence_id/:nFtoOccurrenceID", async (req, res) => {
    //Get Conext information to edit a track for the track with corresponding FTO Track ID and occurrence number
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

router.post("/submit/track_add/:nFtoAnimeID", async (req, res) => {
    let objError = {};
    var dateNow = new Date();
    objError.error = 'Not Implemented Request Error';
    objError.time = `${dateNow.getHours()}:${dateNow.getMinutes()}:${dateNow.getSeconds().toLocaleString('en-US', 
    {
        minimumIntegerDigits: 2,
        useGrouping: false
    })}`;
    res.status(501).json(objError);
});

router.post("/submit/track_add/:nFtoAnimeID/episode_id/:nFtoEpisodeID", async (req, res) => {
    // Submit New Track to Anime Episode
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
        var dateNow = new Date();
        objError.error = 'Internal Request Error';
        objError.time = `${dateNow.getHours()}:${dateNow.getMinutes()}:${dateNow.getSeconds().toLocaleString('en-US', 
        {
            minimumIntegerDigits: 2,
            useGrouping: false
        })}`;
        objError.details = error;
        res.status(500).json(objError);
    } 
});

router.post("/submit/track_add_pre_existing/:nFtoEpisodeID", async (req, res) => {
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

router.post("/submit/track_edit/:nFtoTrackID", async (req, res) => {
    let objError = {};
    var dateNow = new Date();
    objError.error = 'Not Implemented Request Error';
    objError.time = `${dateNow.getHours()}:${dateNow.getMinutes()}:${dateNow.getSeconds().toLocaleString('en-US', 
    {
        minimumIntegerDigits: 2,
        useGrouping: false
    })}`;
    res.status(501).json(objError);
});

router.post("/submit/track_edit/:nFtoTrackID/occurrence_id/:nFtoOccurrenceID", async (req, res) => {
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

router.post("/submit/track_remove/:nFtoTrackID/occurrence_id/:nFtoOccurrenceID", async (req, res) => {
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

module.exports = router;