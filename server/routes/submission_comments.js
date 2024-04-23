const express = require("express");
const router = express.Router();
const { 
	GetSubmissionComments,
	PostCommentOnSubmission,
	PatchCommentOnSubmission,
	DeleteCommentFromSubmission,
	PatchCommentLikesOnSubmission,
} = require('../sql/database');
const { IsEmpty } = require("../utils/BackendUtils");

router.get("/:nFtoSubmissionID", async (req, res) => {
    //Get List of Comments for the Submission with corresponding FTO Submission ID
    const nFtoSubmissionID = req.params.nFtoSubmissionID;
    try {
        const ftoEpisodeComments = await GetSubmissionComments(nFtoSubmissionID);
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

router.put("/:nFtoSubmissionID", async (req, res) => {
    // Insert a new comment to the Submission with corresponding FTO Submission ID
    const nFtoSubmissionID = req.params.nFtoSubmissionID;
    const { objUserSubmission } = req.body;
    const nFtoUserId = objUserSubmission.userId;
    const strCommentContent = objUserSubmission.body;
    const nCommentParentId = objUserSubmission.parentId;
    try {
        const ftoInsertEpisodeCommentResult = await PostCommentOnSubmission(nFtoSubmissionID, strCommentContent, nFtoUserId, nCommentParentId);
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

router.patch("/:nFtoSubmissionCommentID", async (req, res) => {
    // Update comment for the Comment with corresponding FTO Submission Comment ID
    const nFtoSubmissionCommentID = req.params.nFtoSubmissionCommentID;
    const { objUserSubmission } = req.body;
    const nFtoUserId = objUserSubmission.userId;
    const strCommentContent = objUserSubmission.body;
    try {
        const ftoUpdateEpisodeCommentResult = await PatchCommentOnSubmission(nFtoSubmissionCommentID, strCommentContent, nFtoUserId);
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

router.delete("/:nFtoSubmissionCommentID", async (req, res) => {
    // Delete comment for the Comment with corresponding FTO Submission Comment ID
    const nFtoSubmissionCommentID = req.params.nFtoSubmissionCommentID;
    const { objUserSubmission } = req.body;
    const nFtoUserId = objUserSubmission.userId;
    console.log("User ID:", nFtoUserId);
    try {
        const ftoDeleteEpisodeCommentResult = await DeleteCommentFromSubmission(nFtoSubmissionCommentID, nFtoUserId);
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

router.patch("/comment_likes/:nFtoSubmissionCommentID", async (req, res) => {
    const nFtoSubmissionCommentID = req.params.nFtoSubmissionCommentID;
    const { objUserSubmission } = req.body;
    const nFtoUserId = objUserSubmission.userId;
    const objLikesDislikes = objUserSubmission.likesDislikes;
    try {
        const ftoUpdateCommentLikesResult = await PatchCommentLikesOnSubmission(nFtoSubmissionCommentID, objLikesDislikes, nFtoUserId);
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