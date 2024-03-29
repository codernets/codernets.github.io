(function() {
  'use strict';
  angular.module('app')
    .controller('ForumController', ForumController);

  function ForumController(ForumFactory, UserFactory, $state, $stateParams) {
    var vm = this;
    vm.status = vm.UserFactory;
    vm.topics = ["General", "Job Board", "Interview Prep", "Code Questions", "Meetups", "Bootcamp Reviews"];
    vm.fpost = {};
    vm.forumPosts = [];


// ForumFactory.getAllPost().then(function(res){
// 							vm.forumPosts = res;
// });
if ($stateParams.id){
ForumFactory.getPostById($stateParams.id).then(function(res){
	vm.apost = res;
});
}

vm.cancelEdit = function(){
  ForumFactory.getPostById($stateParams.id).then(function(res){
  	vm.apost = res;
    $state.go("ForumPost", {id: $stateParams.id});
  });
};

    ForumFactory.startFPost($stateParams.id).then(function(res) {
      vm.epost = res;
    });

    vm.getPostsByTopic = function(topic) {
      ForumFactory.getPostsByTopic(topic).then(function(res) {
        vm.topicPosts = res;

        for (var i=0; i<vm.topicPosts.length; i++) {
          vm.topicPosts[i].score = vm.topicPosts[i].upvotes.length - vm.topicPosts[i].downvotes.length;

          console.log(vm.topicPosts[i].score);
        }
      });
    };

    vm.createforumpost = function() {
      ForumFactory.createforumpost(vm.fpost)
        .then(function() {
          $state.go('Forums');
        });
    };

    vm.editFPost = function() {
      ForumFactory.editFPost(vm.epost).then(function() {
        $state.go('ForumPost', {
          id: $stateParams.id
        });
      });
    };

    vm.deleteFPost = function(fpost) {
      console.log('delete f post controller');
      ForumFactory.deleteFPost(fpost._id).then(function() {
          console.log("Made it back to controller. about to splice!");
          vm.forumPosts.splice(vm.forumPosts.indexOf(fpost), 1);
          $state.go('Forums');

        });
    };
    // ---------------------


vm.postComments = function(){
  ForumFactory.postComments(vm.newComment, $stateParams.id).then(function(res){
    console.log($stateParams); //postID
    console.log(vm.newComment); //comment body
    vm.comments.push(vm.newComment);
    vm.newComment = {};
    $state.go('ForumPost', {id: $stateParams.id});
  });
};

vm.showComments = function(){
  ForumFactory.showComments($stateParams.id).then(function(res){
    //console.log($stateParams); //postID
    //console.log(res); //arr of all comments
    vm.comments = res;
  // $state.go('ForumPost', {id: $stateParams.id});
  });
};
vm.showComments();

vm.upvote = function(post) {
  if (post.creatorId == vm.status._id) {
    alert("You cannot vote for your own posts!");
    return;
  } else {
    if (post.upvotes.indexOf(vm.status._id) != -1) {
      alert("You have voted for this post before!");
      return;
    } else {
      var index = post.downvotes.indexOf(vm.status._id);
      if (index != -1) {
        post.downvotes.splice(index, 1);
      }
      ForumFactory.upvote(post);
    }
  }
};


vm.downvote = function(post) {
  if (post.creatorId == vm.status._id) {
    alert("You cannot vote for your own posts!");
    return;
  } else {
    if (post.downvotes.indexOf(vm.status._id) != -1) {
      alert("You have voted for this post before!");
      return;
    } else {
      var index = post.upvotes.indexOf(vm.status._id);
      if (index != -1) {
        post.upvotes.splice(index, 1);
      }
      ForumFactory.downvote(post);
    }
  }
};


  }
})();
