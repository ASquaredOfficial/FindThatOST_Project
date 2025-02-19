const express = require("express");
const router = express.Router();
const { 
    GetEpisodeComments, 
    PostCommentOnEpisode, 
    PatchCommentOnEpisode, 
    DeleteCommentFromEpisode,
    PatchCommentLikesOnEpisode,
} = require('./../sql/database');
const { IsEmpty } = require("../utils/BackendUtils");

router.get("/:nFtoEpisodeID", async (req, res) => {
    //Get List of Comments for the Episode with corresponding FTO Episode ID
    const nFtoEpisodeID = req.params.nFtoEpisodeID;
    try {
        const ftoEpisodeComments = await GetEpisodeComments(nFtoEpisodeID);
        if (!ftoEpisodeComments) {
            return res.status(404).json({ error: 'Resource Not Found' }).end(); 
        }
        res.status(200).json(ftoEpisodeComments);
    }
    catch (error) {
        let objError = {};
        objError.error = 'Internal Server Error';
        objError.details = error;
        res.status(500).json(objError);
        console.log("Update response:", objError);
    }
});

router.put("/:nFtoEpisodeID", async (req, res) => {
    // Insert a new comment to the Episode with corresponding FTO Episode ID
    const nFtoEpisodeID = req.params.nFtoEpisodeID;
    const { objUserSubmission } = req.body;
    const nFtoUserId = objUserSubmission.userId;
    const strCommentContent = objUserSubmission.body;
    const nCommentParentId = objUserSubmission.parentId;
    try {
        const ftoInsertEpisodeCommentResult = await PostCommentOnEpisode(nFtoEpisodeID, strCommentContent, nFtoUserId, nCommentParentId);
        res.status(200).json(ftoInsertEpisodeCommentResult);
    }
    catch (error) {
        let objError = {};
        objError.error = 'Internal Server Error';
        objError.details = error;
        res.status(500).json(objError);
        console.log("Update response:", objError);
    }
});

router.patch("/:nFtoCommentID", async (req, res) => {
    // Update comment for the Comment with corresponding FTO Episode Comment ID
    const nFtoCommentID = req.params.nFtoCommentID;
    const { objUserSubmission } = req.body;
    const nFtoUserId = objUserSubmission.userId;
    const strCommentContent = objUserSubmission.body;
    try {
        const ftoUpdateEpisodeCommentResult = await PatchCommentOnEpisode(nFtoCommentID, strCommentContent, nFtoUserId);
        if (!IsEmpty(ftoUpdateEpisodeCommentResult) && typeof(ftoUpdateEpisodeCommentResult) === 'object' && ftoUpdateEpisodeCommentResult['affectedRows'] === 0) {
            return res.status(400).json({ error: 'Resource Not Updated', responseBody: ftoUpdateEpisodeCommentResult}).end(); 
        }
        res.status(200).json(ftoUpdateEpisodeCommentResult);
    }
    catch (error) {
        let objError = {};
        objError.error = 'Internal Server Error';
        objError.details = error;
        res.status(500).json(objError);
        console.log("Update response:", objError);
    }
});

router.delete("/:nFtoCommentID", async (req, res) => {
    // Delete comment for the Comment with corresponding FTO Episode Comment ID
    const nFtoCommentID = req.params.nFtoCommentID;
    const { objUserSubmission } = req.body;
    const nFtoUserId = objUserSubmission.userId;
    try {
        const ftoDeleteEpisodeCommentResult = await DeleteCommentFromEpisode(nFtoCommentID, nFtoUserId);
        if (IsEmpty(ftoDeleteEpisodeCommentResult)){
            return res.status(500).json({ error: 'Internal Server Error', responseBody: ftoDeleteEpisodeCommentResult}).end();
        } 
        else {
            if (typeof(ftoDeleteEpisodeCommentResult) === 'object'){
                if (ftoDeleteEpisodeCommentResult['affectedRows'] === 0) {
                    return res.status(400).json({ error: 'Resource Not Updated', responseBody: ftoDeleteEpisodeCommentResult}).end();     
                }
                else {
                    return res.status(200).json(ftoDeleteEpisodeCommentResult).end();     
                }
            }
            else {
                return res.status(500).json({ error: 'Internal Server Error', responseBody: ftoDeleteEpisodeCommentResult}).end();
            }
        }
    }
    catch (error) {
        let objError = {};
        objError.error = 'Internal Server Error';
        objError.details = error;
        res.status(500).json(objError);
        console.log("Update response:", objError);
    }
});

router.patch("/comment_likes/:nFtoCommentID", async (req, res) => {
    // Update comment likes for the Comment with corresponding FTO Episode Comment ID
    const nFtoCommentID = req.params.nFtoCommentID;
    const { objUserSubmission } = req.body;
    const nFtoUserId = objUserSubmission.userId;
    const objLikesDislikes = objUserSubmission.likesDislikes;
    try {
        const ftoUpdateCommentLikesResult = await PatchCommentLikesOnEpisode(nFtoCommentID, objLikesDislikes, nFtoUserId);
        if (!IsEmpty(ftoUpdateCommentLikesResult) && typeof(ftoUpdateCommentLikesResult) === 'object' && ftoUpdateCommentLikesResult['affectedRows'] === 0) {
            return res.status(400).json({ error: 'Resource Not Updated', responseBody: ftoUpdateCommentLikesResult}).end(); 
        }
        res.status(200).json(ftoUpdateCommentLikesResult);
    }
    catch (error) {
        let objError = {};
        objError.error = 'Internal Server Error';
        objError.details = error;
        res.status(500).json(objError);
        console.log("Update response:", objError);
    }
});

module.exports = router;