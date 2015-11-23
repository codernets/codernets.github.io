var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = mongoose.model('User');
var ProfilePost = mongoose.model('ProfilePost');
var jwt = require('express-jwt');
var auth = jwt({
  userProperty: "payload", //req.payload._id in the Route
  secret: "CoderCamps" //matches the secret in model
});




router.post('/',auth, function(req, res, next) {
  var post = new ProfilePost(req.body);
  // console.log(post);
  post.createdBy.name = req.payload.name;
  post.avi = req.payload.pic;
  post.createdBy.lastName = req.payload.lastName;
  post.creatorId = req.payload._id;
  post.date = new Date();
  // console.log('payload' , req.payload);

  User.findOne({email: req.payload.email}, function(err, user){
    post.avi = user.pic;
    if(!user) return res.status(404).send({err: "Could not find that user."});
console.log(post.avi);

  post.save(function(err, result) {
    if(err) return next(err);
    if(!result) return next("Could not Create Post");
    User.findOne({email: req.payload.email}, function(err, user){
      if(!user) return res.status(404).send({err: "Could not find that user."});
    user.profilePosts.push(result);
    user.save(function(err, user) {
    });
    res.send();
    });
  });
});
  });

router.post('/reblog/:id', auth,function(req,res,next){
  var comment = req.body;
  comment.avi = req.payload.pic;
  comment.creatorName = req.payload.name;

  ProfilePost.findOne({_id: req.params.id}, function(err, result){
    console.log('result ', result);
    var post = new ProfilePost({
      title: result.title,
      body: result.body,
      avi: result.avi,
      date: result.date,
      comments: result.comments,
      creatorId: result.creatorId,
      upvotes: result.upvotes,
      downvotes: result.downvotes,
      tags: result.tags,
      createdBy: result.createdBy,
    });
  ProfilePost.update({_id: req.params.id},{$push: {comments: comment}}, function(err,result){
    if(err) return next (err);
    if(!result) return next({err: "Couldnt find that post!"});

    User.findOne({email: req.payload.email}, function(err, user){
      comment.avi = user.pic;
      comment.creatorId = user._id;
      if(!user) return res.status(404).send({err: "Could not find that user."});
    post.comments.push(comment);
    console.log(post.comments , " post.comments");



  post.save(function(err, result) {
    if(err) return next(err);
    if(!result) return next("Could not Create Post");
    User.findOne({email: req.payload.email}, function(err, user){
      if(!user) return res.status(404).send({err: "Could not find that user."});
    user.profilePosts.push(result);
    user.save(function(err, user) {
    });

  		if(err) return next(err);
  		if(!result) return next ({err: "That user wasnt found for updating!"});
  	// });
    res.send();
});
});
});
});
});
});



//get call for all the posts - home page.
router.get('/', function(req, res, next){
  ProfilePost.find({}, function(err, result){
    if(err) {return next(err);}
    if(!result) {return next({err: "Error finding post by that user ID"});}
    res.send(result);
  });
});

router.get('/:tag', function(req,res,next){
  ProfilePost.find({tags: req.params.tag}, function(err,result){
    console.log("result", result);
    console.log("Req.params.tag", req.params.tag);
    if(err) {return next(err);}
    if(!result) {return next({err: "Error finding post by that user ID"});}
    res.send(result);
  })
})
//get call for user posts - profile.
router.get('/userPosts/:id', function(req, res, next){
  ProfilePost.find({creatorId: req.params.id}, function(err, result){
    if(err) {return next(err);}
    if(!result) {return next({err: "Error finding post by that user ID"});}
    res.send(result);
  });
});



router.delete('/:id', function(req, res, next) {
  ProfilePost.remove({_id: req.params.id}, function(err, result) {
      if(err) return next(err);
      res.send();
  });
});

router.put('/:id', function(req,res, next){
  ProfilePost.update({_id: req.params.id}, req.body, function(err, result){
    if (err) return next(err);
    if (!result) return next ({err: "That post wasnt found for updating"});
    // console.log(result);
    res.send(result);
    });
  });

  router.put('/upvote/:post', auth, function(req,res, next){
    ProfilePost.update({_id: req.params.post._id}, {$push: {upvotes: req.payload._id}, $pull: {downvotes: req.payload._id}}, function(err, result){
      if (err) return next(err);
      if (!result) return next ({err: "That post wasnt found for updating"});
      User.findOne({_id: req.params.post._id}, function(err,result){
              if(err) return next(err);
          if(!result) return next({err: "Couldnt find a user with that id"});
          result.update({$inc:{score: +1}},
            function(err,result){
                   if(err) return next(err);
                   if(!result) return next({err: "Couldnt find a user with that id"});
              });
            });
      res.send(result);
      });
    });

    router.put('/downvote/:id', auth, function(req,res, next){
      ProfilePost.update({_id: req.params.id}, {$push: {downvotes: req.payload._id}, $pull: {upvotes: req.payload._id}}, function(err, result){
        if (err) return next(err);
        if (!result) return next ({err: "That post wasnt found for updating"});
        User.findOne({_id: req.params.post._id}, function(err,result){
                if(err) return next(err);
            if(!result) return next({err: "Couldnt find a user with that id"});
            result.update({$inc:{score: -1}},
              function(err,result){
                     if(err) return next(err);
                     if(!result) return next({err: "Couldnt find a user with that id"});
                });
              });
        res.send(result);
        });
      });


module.exports = router;
