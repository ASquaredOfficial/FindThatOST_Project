const express = require('express');
const app = express();
var port = process.env.PORT || 5000;

const { GetAllAnime, GetAnime, PatchAnime, GetAnimeMappingMAL, PostAnimeIntoDB } = require('./sql/database');


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

app.listen(port, ()=> {console.log(`Server started on port ${port}`)});
