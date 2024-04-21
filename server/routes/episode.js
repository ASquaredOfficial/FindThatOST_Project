const express = require("express");
const router = express.Router();
const { 
    GetTracksForEpisode,
} = require('../sql/database');
const { IsEmpty } = require("../utils/BackendUtils");

router.get("/:nEpisodeID/all_tracks", async (req, res) => {
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

router.get("/:nEpisodeID/all_tracks/sort_by/:sortByColumn", async (req, res) => {
    //Get List of Tracks for the episode with corresponding FTO Episode ID
    const nEpisodeID = req.params.nEpisodeID;
    const sortByColumn = req.params.sortByColumn;
    if (!IsEmpty(sortByColumn) && sortByColumn !== 'track_type') {
        //  Invalid column name provided
        return res.status(400).json({ error: "Invalid Parameter for sort"}).end;
    }

    try {
        const ftoEpisodeTracksDetails = await GetTracksForEpisode(nEpisodeID, sortByColumn);
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

module.exports = router;