const express = require('express');
const app = express();
var port = process.env.PORT || 5000;

app.get("/api", (req, res) => {
    res.json({
        "username": "Adrian"
    });
})

app.listen(port, ()=> {console.log(`Server started on port ${port}`)})