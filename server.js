const express = require('express')
const app = express()
const port = 3000
const path = require('path')
const fileUpload = require('express-fileupload');
const cors = require('cors');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

app.use('/static', express.static(path.join(__dirname, 'static')))
app.use(cors())
app.use(express.json())
app.use(express.static('static'))
app.use(fileUpload({
    createParentPath: true
}));

app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname+'/static/index.html'))
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
let username;
let imageData;
app.post('/imageData', function(req, res) {
    imageData = req.body;
    imageData.id = uuidv4();
    username = req.body.user;
    imageData.date = imageData.date.replace(':', '-')
    handleFolders(req.body.user);
});

let newImageName;
app.post('/image-upload', (req, res) => {
    newImageName = req.files.file.name;
    let newFileName = `${__dirname}\\static\\images\\${username}\\${imageData.date}-${imageData.time}-${imageData.location[0]}-${imageData.location[1]}.png`
    req.files.file.mv(newFileName)
    newFileData = {
      username: username, 
      date: `${imageData.date}-${imageData.time}`,
      location: `${imageData.location[0]}-${imageData.location[1]}`
    }
    writeFile(`${__dirname}\\static\\images\\${username}\\${username}.txt`, JSON.stringify(fileData))
    let txtFile = readTxtFile(`${__dirname}\\static\\images\\${username}\\${username}.txt`);
    console.log(txtFile)
    res.redirect('/home');
});

function handleFolders(username){
  let newUser = null;
  fs.mkdir(`./static/images/${username}`, function(err) {
    if (err) {
      newUser = true;
    } else {
      newUser = false;
    }
  })
  console.log(newUser)
  return newUser;
}
let fileData = 'No data';
function readTxtFile(username){
  let users = fs.readdirSync(`${__dirname}\\static\\images\\`)
  users.forEach(el => {
    if (el === username){
      fs.readFile(fileDir, (err, data) => { 
        if (err) throw err; 
       fileData = JSON.parse(data) 
    }) 
    }
  })
  return fileData;
}
function writeFile(fileDir, data){
  fs.writeFile(fileDir, data, function (err) {
    if (err) throw err;
    return true;
  });
}

app.get('/images/:username/', (req, res) => {
  
  const files = fs.readdirSync(`${__dirname}\\static\\images\\`)
  files.forEach(el => {
    if (el === req.params.username){
      res.send(fs.readdirSync(`${__dirname}\\static\\images\\${req.params.username}`))
    }
  })
  
})
app.get('/images/:username/:id', (req, res) => {
  res.sendFile(`${__dirname}\\static\\images\\${req.params.username}\\${req.params.id}`)
})


