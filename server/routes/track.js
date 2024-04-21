const express = require("express");
const router = express.Router();
const { 
    GetTrack,
    GetTrackOccurrences,
} = require('../sql/database');
const { IsEmpty } = require("../utils/BackendUtils");

router.get("/:nTrackID", async (req, res) => {
    //Get Tracks for corresponding FTO Track ID
    const nTrackID = req.params.nTrackID;
    try {
        const ftoTrackDetails = await GetTrack(nTrackID);
        console.log("Track Details:", ftoTrackDetails)
        if (ftoTrackDetails.length == 0) {
            return res.status(204).json({ error: 'No Results found' }).end(); 
        }

        const ftoEpisodeTracksOccurrence = await GetTrackOccurrences(nTrackID);
        const ftoFullTrackDetails = { 
            ...ftoTrackDetails[0], 
            episode_occurrences: (IsEmpty(ftoEpisodeTracksOccurrence) ? null : ftoEpisodeTracksOccurrence),
        };
        res.status(200).json(ftoFullTrackDetails);
    }
    catch (error) {
        let objError = {};
        objError.error = 'Internal Server Error';
        objError.details = error;
        res.status(500).json(objError);
    }
});

router.get("/:nTrackID/context_id/:nOccurrenceID", async (req, res) => {
    //Get List of Tracks for the episode with corresponding FTO Episode ID
    const nTrackID = req.params.nTrackID;
    const nOccurrenceID = req.params.nOccurrenceID;
    try {
        const ftoTrackDetails = await GetTrack(nTrackID, nOccurrenceID);
        if (ftoTrackDetails.length == 0) {
            return res.status(204).json({ error: 'No Results found' }).end(); 
        }

        const ftoEpisodeTracksOccurrence = await GetTrackOccurrences(nTrackID);
        const ftoFullTrackDetails = { 
            ...ftoTrackDetails[0], 
            episode_occurrences: (IsEmpty(ftoEpisodeTracksOccurrence) ? null : ftoEpisodeTracksOccurrence),
        };
        res.status(200).json(ftoFullTrackDetails);
    }
    catch (error) {
        let objError = {};
        objError.error = 'Internal Server Error';
        objError.details = error;
        res.status(500).json(objError);
    }
});

router.get("/:nTrackID/context_id/:nOccurrenceID", async (req, res) => {
    //Get List of Tracks for the episode with corresponding FTO Episode ID
    const nTrackID = req.params.nTrackID;
    const nOccurrenceID = req.params.nOccurrenceID;
    try {
        const ftoTrackDetails = await GetTrack(nTrackID, nOccurrenceID);
        if (ftoTrackDetails.length == 0) {
            return res.status(204).json({ error: 'No Results found' }).end(); 
        }

        const ftoEpisodeTracksOccurrence = await GetTrackOccurrences(nTrackID);
        const ftoFullTrackDetails = { 
            ...ftoTrackDetails[0], 
            episode_occurrences: (IsEmpty(ftoEpisodeTracksOccurrence) ? null : ftoEpisodeTracksOccurrence),
        };
        res.status(200).json(ftoFullTrackDetails);
    }
    catch (error) {
        let objError = {};
        objError.error = 'Internal Server Error';
        objError.details = error;
        res.status(500).json(objError);
    }
});

module.exports = router;