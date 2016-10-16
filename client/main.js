/// Routing

Router.configure({
    layoutTemplate: "ApplicationLayout"
});

Router.route('/:_id', function () {
    this.render('navbar', {
        to: 'navbar'
    });
    this.render('website_detail', {
        to: 'main',
        data: function() {
            return Websites.findOne({_id: this.params._id});
        }
    });
    this.render('comments_list', {
        to: 'comments'
    });
    this.render('comment_form', {
        to: 'comment'
    });
});

Router.route('/', function () {
    this.render('navbar', {
        to: 'navbar'
    });
    this.render('search_result', {
        to: 'search_result',
        data: function() {
            //return Websites.find({});
            return false;
        }
    });
    this.render('auto_suggest', {
        to: 'navbar'
    });
    this.render('website_list', {
        to: 'main',
        data: function() {
            return Websites.find({});
        }
    });
});




Session.set("linkLimit", 10);
lastScrollTop = 0;

/////
// Infinite Scroll
/////
$(window).scroll(function(event){
    if ($(window).scrollTop() + $(window).height() > $(document).height() - 100){
        var scrollTop = $(this).scrollTop();
        if (scrollTop > lastScrollTop) {
            Session.set("linkLimit", Session.get("linkLimit") + 4);
        }
        lastScrollTop = scrollTop;
    }
});


/////
// Accounts Configuration
/////
Accounts.ui.config({
    passwordSignupFields: "USERNAME_AND_EMAIL"
});

/////
// template helpers 
/////

// helper function that returns number of upvotes
Template.website_item.helpers({
    upvotesCount:function(){
        return this.upvoters.length;
        //return Websites.find(this._id).upvoters.count();
        //console.log("====", this.upvoters.length);
    }
});

// helper function that returns number of downvotes
Template.website_item.helpers({
    downvotesCount:function(){
        return this.downvoters.length;
        //return Websites.find(this._id).downvoters.count();
        //console.log("====", this.downvoters.length);
    }
});

// helper function that returns username
Template.body.helpers({username:function(){
        if (Meteor.user()){
            return Meteor.user().username;
            //return Meteor.user().emails[0].address;
        }
        else{
            return "dunoo.. ";
        }
    }
});


// helper function that returns all available websites
Template.website_list.helpers({
	websites:function(){
		return Websites.find({}, {sort:{votes:-1}}, {limit:Session.get("linkLimit")});
	}
});


// helper function that returns the username for a given user ID
Template.registerHelper('getUser', function(userId) {
     var user = Meteor.user().findOne({_id: userId});
    if (user) {
        return user;
    }
    else {
        return "anonymous";
    }
});

Template.comments_list.helpers({
    comments:function(){
        return Comments.find({website: Router.current().params._id});
    }
});







// Search box
Template.search_result.helpers({
    searchingindex: function (){
        return SearchingIndex;
    }
});
// Search box
Template.navbar.helpers({
    searchingindex: function (){
        return SearchingIndex;
    }
});
// helper function that returns all available websites
Template.website_list.helpers({
		searchingindex: function (){
			return SearchingIndex;
		}
});
// helper function that returns all available websites
Template.auto_suggest.helpers({
		searchingindex: function (){
			return SearchingIndex;
		}
});








/////
// template events 
/////

Template.website_item.events({
	"click .js-upvote":function(event){
        if (Meteor.user()){
            // example of how you can access the id for the website in the database
            // (this is the data context for the template)
            var website_id = this._id;
            console.log("Up voting website with id "+website_id);
            // put the code in here to add a vote to a website!
            if (_.include(this.upvoters, Meteor.userId()))
            {
                throw new Meteor.Error('invalid', 'Already upvoted this post');
            }
            else{
                if(_.include(this.downvoters, Meteor.userId())){
                    Websites.update(website_id, {
                        $pull: {downvoters: Meteor.userId()},
                        $inc: {votes: 1}
                    });
                }
                Websites.update(website_id, {
                    $addToSet: {upvoters: Meteor.userId()},
                    $inc: {votes: 1}
                });
            }
            console.log(this);
        }

		return false;// prevent the button from reloading the page
	}, 
	"click .js-downvote":function(event){
        if (Meteor.user()){
            // example of how you can access the id for the website in the database
            // (this is the data context for the template)
            var website_id = this._id;
            console.log("Down voting website with id "+website_id);

            // put the code in here to remove a vote from a website!
            if (_.include(this.downvoters, Meteor.userId()))
            {
                throw new Meteor.Error('invalid', 'Already downvoted this post');
            }
            else{
                if(_.include(this.upvoters, Meteor.userId())){
                    Websites.update(website_id, {
                        $pull: {upvoters: Meteor.userId()},
                        $inc: {votes: -1}
                    });
                }
                Websites.update(website_id, {
                    $addToSet: {downvoters: Meteor.userId()},
                    $inc: {votes: -1}
                });
            }
            console.log(this);
        }
		return false;// prevent the button from reloading the page
	}
})

Template.website_form.events({
	"click .js-toggle-website-form":function(event){
		$("#website_form").toggle('slow');
	}, 
	"submit .js-save-website-form":function(event){

        if (Meteor.user()){
		    // here is an example of how to get the url out of the form:
		    var url = event.target.url.value;
		    console.log("The url they entered is: "+url);
		
            var title = event.target.title.value;
            var description = event.target.description.value;
		    //  put your website saving code in here!
            Websites.insert({
                title:title,
                url:url,
                description:description,
                createdOn:new Date(),
                createdBy:Meteor.user()._id,
                upvoters: [],
                downvoters:[],
                votes: 0
            });
        }
        $("#website_form").toggle('slow');
        event.target.url.value = "";
        event.target.title.value = "";
        event.target.description.value = "";        
		return false;// stop the form submit from reloading the page

	}
});




Template.comment_form.events({
    "submit .js-save-comment-form":function(event){

        if (Meteor.user()) {

            // here is an example of how to get the comment out of the form:
            var comment = event.target.comment.value;
            console.log("The comment they entered is: "+comment);

            Comments.insert({
                website: Router.current().params._id, 
                comment: comment, 
                createdOn: new Date(),
                user: Meteor.user().username
            });
        }
        else {
            alert('You need to be logged in to submit comments!');
        }

        return false; // stop the form submit from reloading the page

    }
});
