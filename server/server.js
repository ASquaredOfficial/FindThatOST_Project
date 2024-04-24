require('dotenv').config();
const express = require('express');
const app = express();
var port = process.env.PORT || 5000;

const { GetUserDetails } = require('./sql/database');
// app.use((req, res, next) => {
//     setTimeout(() => {
//         next();
//     }, 3500); // Simulate 2-second delay
// });
app.use(express.json());

const animeRouter = require("./routes/anime");
app.use("/findthatost_api/anime", animeRouter);

const episodeRouter = require("./routes/episode");
app.use("/findthatost_api/episode", episodeRouter);

const episodeCommentsRouter = require("./routes/episode_comments");
app.use("/findthatost_api/episode_comments", episodeCommentsRouter);

const trackRouter = require("./routes/track");
app.use("/findthatost_api/track", trackRouter);

const submissionRouter = require("./routes/submission");
app.use("/findthatost_api/submission", submissionRouter);

const submissionCommentsRouter = require("./routes/submission_comments");
app.use("/findthatost_api/submission_comments", submissionCommentsRouter);

const openaiCommentsRouter = require("./routes/openai");
app.use("/findthatost_api/openai", openaiCommentsRouter);

app.get("/findthatost_api/user/:nFtoUserID", async (req, res) => {
    //Get user details for user with id nFtoUserID
    const nFtoUserID = req.params.nFtoUserID;
    try {
        const ftoUserDetails = await GetUserDetails(nFtoUserID);
        if (!ftoUserDetails || ftoUserDetails.length == 0) {
            return res.status(204).json({ error: 'No Results found' }).end(); 
        }
        res.status(200).json(ftoUserDetails[0]);
    }
    catch (error) {
        let objError = {};
        objError.error = 'Internal Server Error';
        objError.details = error;
        res.status(500).json(objError);
    }
});

app.listen(port, ()=> {console.log(`Server started on port ${port}`)});
