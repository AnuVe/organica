var express = require("express"),
    app = express(), 
    bodyParser = require("body-parser"), 
    mongoose = require("mongoose"),
    flash = require("connect-flash");
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    path = require("path"),
    crypto = require("crypto"),
    multer = require("multer"),
    GridFsStorage = require("multer-gridfs-storage"),
    Grid = require("gridfs-stream"), 
    Plant = require("./models/plant"),
    Comment=require("./models/comment"),
    User = require("./models/user.js"),
    
    middleware = require("./middleware");
    seedDB = require("./seeds")

var commentRoutes = require("./routes/comments"),
    plantRoutes = require("./routes/plants"),
    indexRoutes = require("./routes/index");
    
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json()); 
app.use( express.static( "public" ) );
app.set("view engine","ejs");
app.use(methodOverride("_method"));
app.use(flash());

require('dotenv').config();

let gfs;

const uri = process.env.MONGO_URL;
mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });
const connection = mongoose.connection;
connection.once('open', () => {
    console.log("MongoDB database connection established successfully");
    gfs = Grid(connection.db, mongoose.mongo);
    gfs.collection("uploads");
});

app.use(require("express-session")({
    secret: "abcd",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const storage = new GridFsStorage({
    url: uri,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if(err) {
                    return reject(err);
                }
                const filename = buf.toString("hex" + path.extname(file.originalname));
                const fileInfo = {
                    filename: filename,
                    bucketName: "uploads"
                };
                resolve(fileInfo);
            });
        });
    }
});
const upload = multer({storage});

app.post("/plants",upload.single("file"), middleware.isLoggedIn,function(req,res){
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newPlant = {name:name, image:image, description: desc, author: author}
    //Plant.create(newPlant, function(err, newlyCreated) {
      //  if(err) {
        //    console.log(err);
        //} else {
            res.json({file: req.file});
            //res.redirect("/plants");
        //}
    //});
});

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use("/",indexRoutes);
app.use("/plants",plantRoutes);
app.use("/plants/:id/comments",commentRoutes);
const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Server started on port ${port}`));