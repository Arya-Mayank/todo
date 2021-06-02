const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

app.set('view engine', 'ejs');

mongoose.connect("mongodb+srv://admin-mayank:AciZxn9rGLWqBph@cluster0.5ki6r.mongodb.net/todolistDB", {useNewUrlParser:true , useUnifiedTopology:true, useFindAndModify: false});

const itemSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item ({
  name:"Welcome to the ToDo list!"
});

const item2 = new Item ({
  name:"Add new items using the '+' button "
});

const item3 = new Item ({
  name:"<---Click here to remove items"
});

const defaultItems = [item1,item2,item3];

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema);

// Item.remove({},function(err){
//   if(err){
//     console.log(err);
//   }else{
//     console.log("deleted successfully");
//   }
// });

app.get("/", function(req,res){

  Item.find({},function(err,itemsFound){
    if(itemsFound.length===0){
      Item.insertMany(defaultItems,function(err){
        if (err){
          console.log(err);
        }else{
          console.log("Inserted default items to todo list");
        }
      });
      res.redirect("/");
    }else{
      res.render('list', {day: "Today", newItem:itemsFound});
    }
  });
});

app.get("/:customListName",function(req,res){
  const customListName = req.params.customListName;

  List.findOne({name:customListName}, function(err,foundList){
    if(!err){
      if(!foundList){
        //create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+ customListName);
      }else{
        //show existing list
        res.render('list', {day: foundList.name, newItem:foundList.items});
      }
    }
  });

});




app.post("/", function(req,res){



 const itemName = req.body.input;
 const listName = req.body.list;
 console.log(listName);
 item4 = new Item ({
   name: itemName
 });

if(listName==="Today"){
  item4.save();

  res.redirect("/");
}else{
  List.findOne({name: listName}, function(err,foundList){
    foundList.items.push(item4)
    foundList.save();
    res.redirect("/"+ listName);
  });
}

});

app.post("/delete", function(req,res){


  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(err){
        console.log(err);
      }else{
        console.log("Successfully deleted checked item");
        res.redirect("/");
      }
    });
  }else{
      List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
        if(!err){
          res.redirect("/" + listName);
        }
      });
  }
});


let port = process.env.PORT;
if (port == null || port==""){
  port=3000;
}


app.listen(port, function(){
  console.log("Server started successfully");
});
