const express = require('express');
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

const mongoose = require('mongoose');

// connect to the database
mongoose.connect('mongodb://localhost:27017/museum', {
  useNewUrlParser: true
});

// Configure multer so that it will upload to '../front-end/public/images'
const multer = require('multer')
const upload = multer({
  dest: '../front-end/public/images/',
  limits: {
    fileSize: 10000000
  }
});

// Create a scheme for items in the museum: a title and a path to an image.
const itemSchema = new mongoose.Schema({
  title: String,
  description: String,
  path: String,
});

// Upload a photo. Uses the multer middleware for the upload and then returns
// the path where the photo is stored in the file system.
app.post('/api/photos', upload.single('photo'), async (req, res) => {
  // Just a safety check
  if (!req.file) {
    return res.sendStatus(400);
  }
  res.send({
    path: "/images/" + req.file.filename
  });
});

// Create a model for items in the museum.
const Item = mongoose.model('Item', itemSchema);

// Create a new item in the museum: takes a title and a path to an image.
app.post('/api/items', async (req, res) => {
  const item = new Item({
    title: req.body.title,
    description: req.body.description,
    path: req.body.path,
  });
  try {
    await item.save();
    res.send(item);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

// Get a list of all of the items in the museum.
app.get('/api/items', async (req, res) => {
  try {
    let items = await Item.find();
    res.send(items);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

app.put('/api/items/:id', async (req, res) => {
  const filter = req.params.id; //give us the right id.
  let modItem = await Item.findOneAndUpdate({_id: filter}, {title: req.body.title});
  let mod2Item = await Item.findOneAndUpdate({_id: filter}, {description: req.body.description});
});

app.delete('/api/items/:id', async (req, res) => {
    try {
      await Item.deleteOne({
        _id: req.params.id
      });
      res.sendStatus(200);
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
    /*let id = req.params.id;
    //console.log(req.params.id + "is what we'll match?");
    let items = await Item.find();
    let removeIndex = items.map(item => {
      return item.id;
    }).indexOf(id);
    //console.log(removeIndex + "is what we have after first check?");
    if (removeIndex === -1) {
      res.status(404)
        .send("Sorry, that item doesn't exist. " + removeIndex + " and id is " + id);
      return;
    }
    //mongoose.
    //we're getting the right thing, but need to mod the db
    items.splice(removeIndex, 1);
    res.sendStatus(200);*/
});

app.listen(3000, () => console.log('Server listening on port 3000!'));
