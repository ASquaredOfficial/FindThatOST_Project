require('dotenv').config();
const fs = require('fs');
const express = require('express');
const OpenAI = require("openai").OpenAI;

const app = express();
const openaiClient = new OpenAI({apiKey: process.env.FTO_APP_OPENAI_API_KEY});
var port = process.env.PORT || 5000;

const { 
    GetUserDetails,
    PerformSelectQuery,
} = require('./sql/database');
const { IsEmpty } = require("./utils/BackendUtils");


// app.use((req, res, next) => {
//     setTimeout(() => {
//         next();
//     }, 3500); // Simulate 2-second delay
// });
app.use(express.json());
// TODO - Make each get post etc. request print to console (especially if error occurred). 

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

// Read the file containing the database schema
const sqlSchema = fs.readFileSync('./sql/schema.sql', 'utf8', (err, data) => {
    console.log("I am here asplese help");
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

app.post('/findthatost_api/openai/assistant', async (req, res) => {
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
    const systemRoleContent = 'You are the Chatbot for FindThatOST (FTO) called the FTO Chatbot Assistant and are skilled at querying the FTO MySQL database to answer advanced questions based on the database schema about the tracks that played in anime episodes. If the question is unanswerable based on a MySQL select query, then use internet information.';
    
    // Set OpenAI Alpha rules
    const ftoChatbotAplha_Rules = [
        // Rule 1: Generate only select queries or an error code
        'You either return a SELECT query using the schema or the error code `ERR_NOT_POSSIBLE`. Under no circumstances can you produce any other database changing queries with types like insert, update, delete drop etc.',
                
        // Rule 2: Modify episode retrieval for anime seasons 
        'If a user asks for details on a season of an anime. For example, My hero Academia Season 4. Instead of looking for the show for My Hero Academia and looking for episodes 64-88, it will look for a title for My hero academia season 4 and look for episodes 1-24',

        // Rule 3:
        'Some queries may be continued of the last question or as a response to the assistant (ChatGPT), or both',
        
        // Rule 4: Use MyAnimeList default title for anime queries
        'If a user asks for details using an anime title, use the MyAnimeList default title in generated MySQL queries. For example, when looking for the anime with title \'Kingdom Season 3\', it uses \'Kingdom 3rd Season\' instead which is the default title on MyAnimeList for the anime record',

        // Rule 5: Format SQL Select Queries Appropriately
        'When returning the select query in the assistant\'s content, return the query in the form ```sql...```, and nothing else in that response. If more info needs to be conveyed let the last message be the MySQL select query',

        // Rule 6: Format Error Codes Appropriately
        'If/When returning the error codes, ensure only a singular message is used to respond the exact error code. Do not surround the error code with sql and grave accents,'+
        ' instead pair the eror code with an appropriate user facing string with a comma seperating them in an array.'+
        ' This includes if a question is not prompted, then return the error code and an appropriate message. Be creative with the user facing reason outputted.'+
        ' An example response is:[`ERR_NOT_POSSIBLE`, `{Inset appropriate message}`]',

        // Rule 7: 
        "Do not generate queries for anime that hasn't begun airing yet according to MyAnimeList",

        // Rule 8:
        "If a question is asked about anime that cannot be answered from the knowledge of the sql schema, use the internt's knowledge to aid answer the question",
        
        // Rule 9: Prevent complications when retrieving database info
        'User INNER JOINs to simplify the MySQL query when possible',

        // Rule 10: Extrapolate openings and endings
        'When a request is made for the opening or ending for a particular anime, generate a query to look for all occurrences of openings/endings for that anime'
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
                    content: `As an assistant, You use the following sql schema to generate the sql queries, and never disclose any schema/sql details to the user: ${sqlSchema}`,
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
        const ftoCbAlphaResMessage = ftoCbAlphaResponseMessage.message.content;
        console.debug("AssistantAlpha Response:", ftoCbAlphaResponse);
        
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
                    // Set OpenAI Omega rules
                    const ftoChatbotOmega_Rules = [
                        // Rule 1: Database Schema Usage
                        "Use the FTO database schema, MySQL query and the query\'s response to generate a valid user facing response",
                        
                        // Rule 2: Confidentiality Maintenance
                        "Never disclose any information about the database schema under any circumstances",
                        
                        // Rule 3: Handling Missing Data
                        "When data is not found in the database, preface that the info doesn\'t exist in the database, or no records exist (be creative with the response)",
                        
                        // Rule 4: External Information Integration
                        "If a question is asked about anime that cannot be answered from the result, attempt to answer the question using the internet and give an appropriate response",

                        // Rule 5: Opening and Ending Extrapolation
                        "When a request is made for the opening or ending for a particular anime, extrapolate the data when appropriate (say when a show is short number of episodes and only one episode has an opening/ending entry) but mention that this is extrapolated data",
                    ];
                
                    // Make OpenAI API request - RequestOmega
                    // Process data returned from database to appropriate user facing string for chatbot
                    const ftoCbOmegaResponse = await openaiClient.chat.completions.create({
                        model: 'gpt-3.5-turbo',
                        temperature: 0.4,
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
                            {
                                role: 'system',
                                content: `If the database response doesn't provide any or enough information, attempt to use information on the internet to provide or padd the response with more information.`,
                            },
                        ],
                    });
                    
                    // Format Chatbot Omega's response
                    const ftoCbOmegaResMessage = ftoCbOmegaResponse.choices[ftoCbOmegaResponse.choices.length - 1].message.content;
                    console.debug("AssistantAlpha Response:", ftoCbAlphaResponse);
                    console.debug("Full Assistant Response Message:", ftoCbOmegaResMessage);

                    // Create request return object
                    const ftoCbOmegaResObject = {
                        res_code: 'API_SUCCESS',
                        message: ftoCbOmegaResMessage.trim(),
                        user_query: objUserQuery.content,
                    };
                    msgHistory.push({role: 'assistant', content: ftoCbOmegaResMessage})
                    console.log("Message History2:", msgHistory);
                    return res.status(200).json(ftoCbOmegaResObject);
                } 
                catch (ftoCbOmegaError) {
                    const ftoCbOmegaResMessage = {
                        res_code: ftoCbOmegaError.status,
                        date: ftoCbOmegaError.date,
                        message: ftoCbOmegaError.message.trim(),
                        details: ftoCbOmegaError.error,
                    };
                    return res.status(424).json(ftoCbOmegaResMessage); 
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
            console.log("Hello, I am here:")
            console.debug("Full Assistant Alpha Response Message:", ftoCbAlphaResMessage);
            let correctedString = "";
            if (ftoCbAlphaResMessage.includes('[') && ftoCbAlphaResMessage.includes(']') && ftoCbAlphaResMessage.includes('`')) {
                correctedString = ftoCbAlphaResMessage.replace(/`/g, '"');
            }
            else if (ftoCbAlphaResMessage.includes('[') && ftoCbAlphaResMessage.includes(']') && ftoCbAlphaResMessage.includes("'")) {
                correctedString = ftoCbAlphaResMessage.replace(/'/g, '"');
            }
            else if (ftoCbAlphaResMessage.includes('[') && ftoCbAlphaResMessage.includes(']') && ftoCbAlphaResMessage.includes('"')) {
                correctedString = ftoCbAlphaResMessage.replace(/"/g, '"');
            }
            else {
                console.error("Invalid format detected");
                correctedString =  `["ERR_INTERNAL_INVALID_OUTPUT", "${ftoCbAlphaResMessage}"]`
                
                // Create request return object
                const errorCode = 'ERR_INTERNAL_INVALID_OUTPUT'
                const message = ftoCbAlphaResMessage;
                console.log("Returned Message:", message);
                const ftoCbAlphaResObject = {
                    res_code: errorCode.trim(),
                    message: message.trim(),
                    user_query: objUserQuery.content,
                };
                return res.status(200).json(ftoCbAlphaResObject);
            }
            
            // Create request return object
            const [errorCode, message] = JSON.parse(correctedString);
            console.log("Returned Message:", message);
            console.log("Message History1:", msgHistory);
            const ftoCbAlphaResObject = {
                res_code: errorCode.trim(),
                message: message.trim(),
                user_query: objUserQuery.content,
            };
            return res.status(200).json(ftoCbAlphaResObject);
        }
    }
    catch (ftoCbAlphaError) {
        console.log("FtoCBAlpha Error:", ftoCbAlphaError);
        const ftoCbAlphaResObject = {
            res_code: ftoCbAlphaError.status,
            date: ftoCbAlphaError.date,
            message: ftoCbAlphaError.message.trim(),
            details: ftoCbAlphaError.error,
        };
        return res.status(424).json(ftoCbAlphaResObject);
    }

});

app.listen(port, ()=> {console.log(`Server started on port ${port}`)});
