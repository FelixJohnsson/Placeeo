const express = require('express')
const app = express()
const port = 3000
const path = require('path')
const fileUpload = require('express-fileupload');
const cors = require('cors');
const fs = require('fs');
const {
  v4: uuidv4
} = require('uuid');

app.use('/static', express.static(path.join(__dirname, 'static')))
app.use(cors())
app.use(express.json())
app.use(express.static('static'))
app.use(fileUpload({
  createParentPath: true
}));

app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname + '/static/index.html'))
})
app.get('/edit/:dir', (req, res) => {
  res.sendFile(path.join(__dirname + '/static/edit.html'))
})
app.get('/view/:id', (req, res) => {
  res.sendFile(path.join(__dirname + '/static/view.html'))
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
let username;
let imageData;
app.post('/imageData', function (req, res) {
  imageData = req.body;
  console.log(imageData)
  imageData.id = uuidv4();
  username = req.body.user;
  imageData.date = imageData.date.replace(':', '-');
  title = req.body.title;
  description = req.body.description;
  height = req.body.height;
  width = req.body.width;
  handleFolders(req.body.user);
});

let newImageName;
app.post('/image-upload', (req, res) => {
  console.log(req.files)
  let backURL = req.header('Referer')
  console.log(imageData)
  newImageName = req.files.file.name;
  
  let newFileName = `${__dirname}\\static\\images\\${username}\\${imageData.date}-${imageData.time}-${imageData.location[0]}-${imageData.location[1]}.png`
  req.files.file.mv(newFileName)
  
let users = fs.readdirSync(`${__dirname}\\static\\images\\`);
let txtFile = false;
users.forEach(el => {
  if (el === username) {
    newFileData = {
      username: username,
      date: `${imageData.date}-${imageData.time}`,
      location: `${imageData.location[0]}-${imageData.location[1]}`,
      id: `${imageData.date}-${imageData.time}-${imageData.location[0]}-${imageData.location[1]}.png`,
      title: imageData.title,
      description:imageData.description,
      height: imageData.height,
      width: imageData.width
    };
    fs.readFile(`${__dirname}\\static\\images\\${username}\\${username}.txt`, (err, data) => {
      if (err){
        //IF NEW USER, CREATE EMPTY ARRAY WITH NEW IMAGE FILE -----------------------------
        let fileArray = [];
        fileArray.push(newFileData);
        writeFile(`${__dirname}\\static\\images\\${username}\\${username}.txt`, JSON.stringify(fileArray));
      } else {
        //ELSE TAKE THE FILE AND PUSH NEW IMAGE DATA --------------------------------------
      txtFile = JSON.parse(data);
      txtFile.push(newFileData);
      writeFile(`${__dirname}\\static\\images\\${username}\\${username}.txt`, JSON.stringify(txtFile));
    }
    })
  }
})

  res.redirect(backURL);
});

function handleFolders(username) {
  let newUser = null;
  fs.mkdir(`./static/images/${username}`, function (err) {
    if (err) {
      newUser = true;
    } else {
      newUser = false;
    }
  })
  return newUser;
}

function writeFile(fileDir, data) {
  fs.writeFile(fileDir, data, function (err) {
    if (err) throw err;
    return true;
  });
}


app.get('/images/:username/', (req, res) => {

  const files = fs.readdirSync(`${__dirname}\\static\\images\\`)
  files.forEach(el => {
    if (el === req.params.username) {
      fs.readFile(`${__dirname}\\static\\images\\${req.params.username}\\${req.params.username}.txt`, (err, data) => {
        if(err)console.log(err)
        else{
          res.send(JSON.parse(data))
        }
      })
      }
    })
})
app.get('/images/:username/:id', (req, res) => {
  res.sendFile(`${__dirname}\\static\\images\\${req.params.username}\\${req.params.id}`)
})


//ROUTE FOR CHANGING IMAGE COORDINATES
app.get('/move/:username/:id/:newCoordinates', (req, res) => {
  fs.readFile(`${__dirname}\\static\\images\\${req.params.username}\\${req.params.username}.txt`, (err, data) => {
    if(err)console.log(err)
    else {
      let array = JSON.parse(data);
      array.forEach(el => {
        if(el.id === req.params.id){
          el.location = req.params.newCoordinates;
          fs.writeFile(`${__dirname}\\static\\images\\${req.params.username}\\${req.params.username}.txt`, JSON.stringify(array), function (err) {
            if (err) throw err;
          });
        }
      })
    }
  })
  res.sendStatus(200)
})