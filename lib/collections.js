// this is collections.js
Websites = new Mongo.Collection("websites");
Comments = new Mongo.Collection("comments");


SearchingIndex = new EasySearch.Index({
    collection: Websites,
    fields: ['title', 'description'],
    engine: new EasySearch.MongoDB({
        sort: function(){
            return {votes:-1};
        }    
    })
  });


