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
    console.log(imageData)
    handleFolders(req.body.user);
});

let newImageName;
app.post('/image-upload', (req, res) => {
    newImageName = req.files.file.name;
    req.files.file.mv(`${__dirname}\\static\\images\\${username}\\${imageData.date}-${imageData.time}-${imageData.location[0]}-${imageData.location[1]}.png`)
    res.redirect('/home');
});

function handleFolders(username){
  fs.mkdir(`./static/images/${username}`, function(err) {
    if (err) {
      console.log(err.code)
    } else {
      console.log("New directory successfully created.")
    }
  })
}

app.get('/images/:username/', (req, res) => {
  const files = fs.readdirSync(`${__dirname}\\static\\images\\${req.params.username}\\`);
  res.send(files)
})
app.get('/images/:username/:id', (req, res) => {
  res.sendFile(`${__dirname}\\static\\images\\${req.params.username}\\${req.params.id}`)
})
