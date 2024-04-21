require('dotenv').config();
const express = require('express');
const app = express();
var port = process.env.PORT || 5000;

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

const trackRouter = require("./routes/track");
app.use("/findthatost_api/track", trackRouter);

const submissionRouter = require("./routes/submission");
app.use("/findthatost_api/submission", submissionRouter);

const episodeCommentsRouter = require("./routes/episode_comments");
app.use("/findthatost_api/episode_comments", episodeCommentsRouter);

const openaiCommentsRouter = require("./routes/openai");
app.use("/findthatost_api/openai", openaiCommentsRouter);

app.get("/findthatost_api/user_details", (req, res) => {
    res.json({
        "user_id": 1,
        "username": "Adrian",
        "user_type": "admin",
        "email": "doradi3xplorer@gmail.com",
    });
});

app.listen(port, ()=> {console.log(`Server started on port ${port}`)});
