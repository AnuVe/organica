const express = require('express');
const imageRouter = express.Router();
const mongoose = require('mongoose');
var middleware = require("../../middleware"); 

require('dotenv').config();

module.exports = (upload) => {
    const uri = process.env.MONGO_URL;
    const connect = mongoose.createConnection(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    let gfs;

    connect.once('open', () => {
        // initialize stream
        gfs = Grid(connect.db, mongoose.mongo);
        gfs.collection("uploads");
    });

    imageRouter.get("/plantUpload", middleware.isLoggedIn, function(req, res) {
        res.render("images/new");
    });

    imageRouter.get('/files', (req, res) => {
        gfs.files.find().toArray((err, files) => {
            //check if files
            if(!files || files.length===0) {
                return res.status(404).json({
                    err:'No files exist'
                });
            }
            //files exist
            return res.json(files);
        }); 
    });

    imageRouter.get('/files/:filename', (req, res) => {
        gfs.files.findOne({filename: req.params.filename}, (err, file) => {
            if(!file || file.length ===0) {
                return res.status(404).json({
                    err: "No file exists"
                });
            }
            return res.json(file);
        });
    });

    imageRouter.get('/image/:filename', (req, res) => {
        gfs.files.findOne({filename: req.params.filename}, (err, file) => {
            if(!file || file.length ===0) {
                return res.status(404).json({
                    err: "No file exists"
                });
            }
            if(file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
                const readstream = gfs.createReadStream(file.filename);
                readstream.pipe(res);
            } else {
                res.status(404).json({
                    err:"Not an image"
                });
            }
        });
    });

    imageRouter.post("/plantUpload", upload.single("file"), middleware.isLoggedIn, function (req, res) {
        //console.log(req.file);
        res.json({file: req.file});
    });

    return imageRouter;
}