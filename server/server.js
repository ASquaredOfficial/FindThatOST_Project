const express = require('express');
const app = express();
var port = process.env.PORT || 5000;

const { GetAllAnime, GetAnimeMappingMAL, PostAnimeIntoDB } = require('./sql/database');


app.get("/api", (req, res) => {
    res.json({
        "username": "Adrian"
    });
});

app.get("/getAnimes", async (req, res) => {
    try {
        const allAnime = await GetAllAnime();
        res.json(allAnime);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
        console.log("Error: ", error);
    }
});

app.get("/postAnimeIntoDB/:nMalID", async (req, res) => {    
    // Insert Anime into DB and return new fto anime id
    try {
        const ftoResponse = await PostAnimeIntoDB(req.params.nMalID, -1);
        res.json(ftoResponse);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get("/postAnimeIntoDB/:nMalID/:nKitsuID", async (req, res) => {
    // Insert Anime into DB and return new fto anime id
    try {
        const ftoResponse = await PostAnimeIntoDB(req.params.nMalID, req.params.nKitsuID);
        res.json(ftoResponse);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }

});

app.get("/getAnimeMappingMAL/:nMalID", async (req, res) => {
    //Get AnimeID for anime with corresponding MAL ID
    const nMalID = req.params.nMalID;
    try {
        const ftoAnimeDetails = await GetAnimeMappingMAL(nMalID);
        res.json(ftoAnimeDetails);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, ()=> {console.log(`Server started on port ${port}`)});
