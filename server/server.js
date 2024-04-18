require('dotenv').config();
const express = require('express');
const fs = require('fs');
const OpenAI = require("openai").OpenAI;

const app = express();
const openaiClient = new OpenAI({apiKey: process.env.FTO_APP_OPENAI_API_KEY});
var port = process.env.PORT || 5000;

const { IsEmpty } = require('./utils/BackendUtils');
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
    PerformSelectQuery,
} = require('./sql/database');

// app.use((req, res, next) => {
//     setTimeout(() => {
//         next();
//     }, 3500); // Simulate 2-second delay
// });
app.use(express.json());

// Read the file containing the database schema
const sqlSchema = fs.readFileSync('./sql/schema.sql', 'utf8', (err, data) => {
    let sqlSchemas = '';
    if (err) {
        console.error('Error reading file:', err);
        return;
    }

    const tableNames = [
        `fto_anime`, 
        `fto_episode`,
        `fto_track`,
        `fto_occurrence`,
    ];
    tableNames.forEach((tableName)=>{
        // Extract the CREATE TABLE statement for the table '...'
        const regex = new RegExp('CREATE TABLE `'+ tableName +'`.*?;','s');
        const match = data.match(regex);
        if (match) {
            let createTableStatement = match[0];
            createTableStatement = createTableStatement.replace(' ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;', ';');
            createTableStatement = createTableStatement.replace(/ {4}/g, '');
            console.log(`Found schema for table '${tableName}'.`);
            sqlSchemas += createTableStatement + '\n';
        } else {
            console.log(`Table '${tableName}' not found in the schema.`);
        }
    });
    return sqlSchemas;
});

app.get("/findthatost_api/user_details", (req, res) => {
    res.json({
        "user_id": 1,
        "username": "Adrian",
        "user_type": "admin",
        "email": "doradi3xplorer@gmail.com",
    });
});

app.post('/findthatost_api/chatbot', async (req, res) => {
    const { objChatGPTQuery } = req.body;
    let msgHistory = Object(objChatGPTQuery['msg_history']);
    if (IsEmpty(msgHistory)) {
        return res.status(400).json("The request data format is invalid. No msg history provided.");
    } else if (msgHistory[msgHistory.length - 1].role !== 'user') {
        // Expecting latest message to be a user response
        return res.status(400).json("The request data was in an unxexpected format. Latest message was not from user.");
    } else if (IsEmpty(msgHistory[msgHistory.length - 1])) {
        // Expecting latest message to be a user response
        return res.status(400).json("The request data was in an unxexpected format. No user message was provided.");
    } else {
        if (msgHistory[0].role == 'assistant') {
            // Remove Initial Prompt Message
            msgHistory = msgHistory.slice(1);
        }
    }
    // Get latest user query
    const objUserQuery = msgHistory[msgHistory.length - 1];

    // Generate list of messages comprising the conversation so far
    const msgHistoryWoutLatestQuery = msgHistory.slice(0, msgHistory.length-1);
    
    // Set system roles
    const systemRoleContent = 'You ae the Chatbot for FindThatOST (FTO), and are skilled at querying the FTO database to answer advanced questions based on the database schema about the tracks that played in anime episodes';
    
    // Set OpenAI Alpha rules
    const ftoChatbotAplha_Rules = [
        // Rule 1: Generate only select queries or an error code
        'You either return a SELECT query using the schema or the error code `ERR_NOT_POSSIBLE`. Under no circumstamstances can you produce any other database changing queries with types like insert, update, delete drop etc.',
                
        // Rule 2: Modify episode retrieval for anime seasons 
        'If a user asks for details on a season of an anime. For example My hero Academia Season 4. Instead of looking for the show for My Hero Academia and looking for episodes 64-88, it will look for a title for My hero academia season 4, and look for episodes 1-24',

        // Rule 3:
        'Some queries may be continued of the last question or as a response to the assistant (ChatGPT), or both',
        
        // Rule 3: Use MyAnimeList default title for anime queries
        'If a user asks for details using an anime title, use the MyAnimeList default title in generated sql queries. For example, when looking for the anime with title \'Kingdom Season 3\', it uses \'Kingdom 3rd Season\' instead which is the default title on MyAnimeList for the anime record',

        // Rule 4: Format SQL Select Queries Appropriately
        'When returning the select query in the assistant\'s content, return the query in the form ```sql...```, and nothing else in that response. If more info needs to be conveyed let the last message be the sql select query',

        // Rule 5: Format Error Codes Appropriately
        'If/When returning the error codes, ensure only a singular message is used to respond the exact error code. Do not surround the error code with sql and grave accents,'+
        ' instead pair the eror code with an appropriate user facing string with a comma seperating them in an array.'+
        ' This includes if a question is not prompted, then return the error code and an appropriate message. Be creative with the user facing reason outputted. '+
        ' An example response is:[`ERR_NOT_POSSIBLE`, `{Inset appropriate message}`]',

        // Rule 6: 
        'Do not generate queries for anime that hasn\'t begun airing yet accroding to MyAnimeList',
        
        // Rule 7: Prevent complications when retrieving database info
        'User INNER JOINs to simlify sql when possible',
    ];

    try {
        // Make OpenAI API request - RequestAlpha
        const prompt = `Given the schema, generate SQL SELECT query for '${objUserQuery.content}'`;
        const ftoCbAlphaResponse = await openaiClient.chat.completions.create({
            model: 'gpt-3.5-turbo', // The most complex and expensive model
            max_tokens: 256, // The maximum number of [tokens](/tokenizer) that can be generated in the chat completion.
            temperature: 0.15, // What sampling temperature to use, between 0 and 2. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic.
            response_format: {type: "text"}, // An object specifying the format that the model must output. Setting to `{ "type": "json_object" }` enables JSON mode
            messages: [
                {
                    role: 'system',
                    content: systemRoleContent,
                },
                {
                    role: 'system',
                    content: `You use the following sql schema to generate the sql queries, and never disclose any schema details to the user: ${sqlSchema}`,
                },
                {
                    role: 'system',
                    content: `Following the following rules: ${ftoChatbotAplha_Rules.join("; ")}.`,
                },
                ...msgHistoryWoutLatestQuery,
                {
                    role: 'user', 
                    content: prompt
                },
            ], // A list of messages comprising the conversation so far.
        });
        
        // Format Chatbot Aplha's response
        const ftoCbAlphaResponseMessage = ftoCbAlphaResponse.choices[ftoCbAlphaResponse.choices.length - 1];
        const ftoCbAlphaResMessage = ftoCbAlphaResponseMessage.message.content
        
        // Check if response is a sql query or error message
        const regex = /```sql((?:.|\n)+?)```/;
        const match = ftoCbAlphaResMessage.match(regex); 
        if (match) {
            // Replace tabs represented by spaces (4 spaces) with a single space and remove new lines
            let sqlQuery = match[1].trim().replace(/\n/g, ' ');
            
            try {
                // Run select statement to get data from database
                const sqlQueryResponse = await PerformSelectQuery(sqlQuery);

                try {    
                    // Set OpenAI Alpha rules
                    const ftoChatbotOmega_Rules = [
                        // Rule 1: 
                        'Use the FTO database schema, sql query and the query\'s response to generate a valid user facing response',
                        
                        // Rule 2: 
                        'Never disclose any information about the database schema under any circumstances',
                        
                        // Rule 3: 
                        'When data is not found in the database, preface that the info doesn\'t exist in the database or no records exist (be creative with the response)',
                    
                        // Rule 4
                        // 'Never disclose any information about the sub processes used to get the data. Only respond with something among the lines of \'I am not permitted under ant circumstances to give any detail about my inner working.\', when prompted about your capabilities and processes.',
                    ];
                
                    // Make OpenAI API request - RequestOmega
                    // Process data returned from database to appropriate user facing string for chatbot
                    const ftoCbOmegaResponse = await openaiClient.chat.completions.create({
                        model: 'gpt-3.5-turbo',
                        max_tokens: 256, 
                        temperature: 0.9,
                        response_format: {type: "text"},
                        messages: [
                            {
                                role: 'system',
                                content: systemRoleContent,
                            },
                            {
                                role: 'system',
                                content: `Following the following rules: ${ftoChatbotOmega_Rules.join("; ")}.`,
                            },
                            ...msgHistoryWoutLatestQuery,
                            {
                                role: 'user',
                                content: `${objUserQuery}`,
                            },
                            {
                                role: 'system',
                                content: `This query ${sqlQuery} was produced to answer the user's query according to the following sql schema: ${sqlSchema} ` +
                                `\nProvide an apporpiate response to the user's question based on the database query and the following query result: ${JSON.stringify(sqlQueryResponse)}`,
                            },
                        ],
                    });
                    
                    // Format Chatbot Omega's response
                    const ftoCbOmegaResMessage = ftoCbOmegaResponse.choices[ftoCbOmegaResponse.choices.length - 1].message.content;

                    // Create request return object
                    const ftoCbOmegaResObject = {
                        res_code: 'API_SUCCESS',
                        message: ftoCbOmegaResMessage.trim(),
                        user_query: objUserQuery.content,
                    };
                    return res.status(200).json(ftoCbOmegaResObject);
                } 
                catch (ftoCbOmegaError) {
                    const ftoCbOmegaResMessage = {
                        res_code: ftoCbOmegaError.status,
                        date: ftoCbOmegaError.date,
                        message: ftoCbOmegaError.message.trim(),
                        details: ftoCbOmegaError.error,
                    };
                    return res.status(ftoCbAlphaError.status).json(ftoCbOmegaResMessage);
                    
                }
            }
            catch (error) {
                let objError = {};
                objError.error = 'Internal Server Error';
                objError.details = error;
                objError.sql = sqlQuery;
                objError.user_query = objUserQuery.content;
                return res.status(500).json(objError);
            }
        }
        else {
            // Remove square brackets and backticks from the string
            // Split the cleaned string into an array of error code and message and create an object with keys 'error_code' and 'message'
            let correctedString = ftoCbAlphaResMessage.replace(/`/g, '"');
            const [errorCode, message] = JSON.parse(correctedString);

            // Create request return object
            const ftoCbAlphaResObject = {
                res_code: errorCode.trim(),
                message: message.trim(),
                user_query: objUserQuery.content,
            };
            return res.status(200).json(ftoCbAlphaResObject);
        }
    }
    catch (ftoCbAlphaError) {
        const ftoCbAlphaResObject = {
            res_code: ftoCbAlphaError.status,
            date: ftoCbAlphaError.date,
            message: ftoCbAlphaError.message.trim(),
            details: ftoCbAlphaError.error,
        };
        return res.status(ftoCbAlphaError.status).json(ftoCbAlphaResObject);
        
    }

})

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

app.get("/findthatost_api/getTracks/episode_id/:nEpisodeID/sort_by/:sortByColumn", async (req, res) => {
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
