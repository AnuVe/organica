var express = require("express");
var router = express.Router({mergeParams: true});
var Plant = require("../models/plant")
var Comment= require("../models/comment")
var middleware = require("../middleware");

router.get("/new", middleware.isLoggedIn, function(req,res){
    Plant.findById(req.params.id, function(err,plant){
        if(err){
            console.log(err);
        } else{
            res.render("comments/new",{plant:plant});
        }
    })
});

router.post("/", middleware.isLoggedIn, function(req,res){
    Plant.findById(req.params.id,function(err,plant){
        if(err){
            req.flash("error", "Something went wrong");
            console.log(err);
        } else{
            comment.author.id = req.user._id;
            comment.author.username = req.user.username;
            comment.save();
            plant.comments.push(comment);
            plant.save();
            req.flash("success", "Successfully added comment");
            res.redirect("/plants/"+plant._id);    
        }
    });
});

router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res) {
    Comment.findById(req.params.comment_id, function(err, foundComment) {
        if(err) {
            res.redirect("back");
        } else {
            res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
        }
    });
});

router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res) {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment) {
        if(err) {
            res.redirect("back");
        }else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res) {
    Comment.findByIdAndRemove(req.params.comment_id, function(err) {
        if(err) {
            res.redirect(back);
        } else {
            req.flash("success", "Comment deleted");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

module.exports = router;
