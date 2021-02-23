const express = require('express')
const app = express()
const port = 3000
const path = require('path')
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');

app.use('/static', express.static(path.join(__dirname, 'static')))
app.use(cors())
app.use(express.json())
app.use(express.static('static'))
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(fileUpload({
  createParentPath: true
}));
app.use(bodyParser.json({
  limit: '50mb',
  extended: true
}))
app.use(bodyParser.urlencoded({
  limit: '50mb',
  extended: true
}))



app.get('/', (req, res) => {
  res.redirect('/edit/MyAssets');
})
app.get('/home', (req, res) => {
  res.redirect('/edit/MyAssets')
})
app.get('/edit/:dir', (req, res) => {
  res.status(200).sendFile(path.join(__dirname + '/static/edit.html'))
})
app.get('/view/:id', (req, res) => {
  res.sendFile(path.join(__dirname + '/static/view.html'))
})
app.post('/checkPassword', (req, res) => {
  console.log(req.body)
  res.send(true)
})
//-------------------------UPLOAD NEW IMAGE-----------------------------//
let newImageData;
//FILE UPLOAD
app.post('/upload-image-file', (req, res) => {
  const files = fs.readdirSync(`${__dirname}\\static\\images\\`)
  files.forEach(el => {
    if (el === req.params.dir) {
      fs.readFile(`${__dirname}\\static\\images\\${req.params.dir}\\${req.params.dir}.txt`, (err, data) => {
        if (err) console.log("Can't find that text file.")
        else {
          JSON.parse(data).forEach(el => {
            if (el.password !== undefined) {
              if (el.password  === newImageData.password) {
                res.send({
                  "msg": "PASSWORD IS CORRECT"
                })
                return;
              }
            }
          })
          res.send({
            "msg": "PASSWORD IS NOT CORRECT"
          })
        }
      })
    }
  })
  let locationString = String(newImageData.location[0]).replace('.', '-') + '-' + String(newImageData.location[1]).replace('.', '-')
  let newImageDir = `${__dirname}\\static\\images\\${newImageData.username}\\${newImageData.date.replace(':', '-')}-${newImageData.time}-${locationString}.png`
  req.files.image.mv(newImageDir)
  res.status(200).send({
    'msg': 'Success'
  })
  textFileHandler(newImageData)
})
//DATA UPLOAD
app.post('/upload-image-data', (req, res) => {
  newImageData = req.body;
  res.status(200).send({
    'msg': 'Success'
  })
})
//TEXT FILE FUNCTION 
function textFileHandler(newImageData) {
  let users = fs.readdirSync(`${__dirname}\\static\\images\\`);
  let txtFile = false;
  users.forEach(el => {
    if (el === newImageData.username) {
      let locationString = String(newImageData.location[0]).replace('.', '-') + '-' + String(newImageData.location[1]).replace('.', '-')
      let newImageDir = `${newImageData.date.replace(':', '-')}-${newImageData.time}-${locationString}.png`
      newFileData = {
        username: newImageData.username,
        date: `${newImageData.date}-${newImageData.time}`,
        location: `${newImageData.location[0]}-${newImageData.location[1]}`,
        dir: newImageDir,
        title: newImageData.title,
        description: newImageData.description,
        height: newImageData.height,
        width: newImageData.width,
        status: newImageData.status
      };

      fs.readFile(`${__dirname}\\static\\images\\${newImageData.username}\\${newImageData.username}.txt`, (err, data) => {
        if (err) {
          //IF NEW USER, CREATE EMPTY ARRAY WITH NEW IMAGE FILE 
          let fileArray = [];
          fileArray.push(newFileData);
          writeFile(`${__dirname}\\static\\images\\${newImageData.username}\\${newImageData.username}.txt`, JSON.stringify(fileArray));
        } else {
          //ELSE TAKE THE FILE AND PUSH NEW IMAGE DATA 
          txtFile = JSON.parse(data);
          txtFile.push(newFileData);
          writeFile(`${__dirname}\\static\\images\\${newImageData.username}\\${newImageData.username}.txt`, JSON.stringify(txtFile));
        }
      })
    }
  })
}
//------------------------------GET AND IMAGES------------------------------------//


app.get('/images/:username/:dir', (req, res) => {
  res.sendFile(`${__dirname}\\static\\images\\${req.params.username}\\${req.params.dir}`)
})

app.get('/images/:username/', (req, res) => {
  let username = req.params.username;
  if (username === 'home') username = 'FavoBarer'

  const files = fs.readdirSync(`${__dirname}\\static\\images\\`)
  let found = false;
  files.forEach(el => {
    if (el === username) {
      found = true;
      console.log('I found the: ' + username + ' directory.')
      fs.readFile(`${__dirname}\\static\\images\\${username}\\${username}.txt`, (err, data) => {
        if (err) console.log("Can't find that text file.")
        else {
          res.send(JSON.parse(data))
        }
      })
    }
  })
  if (!found) {
    console.log('I did not find the: ' + username + ' directory.')
    fs.mkdir(path.join(`${__dirname}\\static\\images\\${username}`), (err) => { 
      if (err) { 
          return console.error(err); 
      } 
      console.log('Directory created successfully!'); 
      writeFile(`${__dirname}\\static\\images\\${username}\\${username}.txt`, JSON.stringify([{name:username}]));
  }); 
    res.send({
      'status': 'Empty'
    })
  }
})
//---------------------------------MOVING MARKERS------------------------------------
app.get('/move/:username/:dir/:newCoordinates/:password', (req, res) => {
  console.log('MOVE')
  fs.readFile(`${__dirname}\\static\\images\\${req.params.username}\\${req.params.username}.txt`, (err, data) => {
    if (err) console.log("Can't find that text file.")
    else {
      let array = JSON.parse(data)
      array.forEach(el => {
          if (el.password === req.params.password || el.password === undefined) {
            array.forEach(el => {
              if (el.dir === req.params.dir) {
                el.location = req.params.newCoordinates;
                fs.writeFile(`${__dirname}\\static\\images\\${req.params.username}\\${req.params.username}.txt`, JSON.stringify(array), function (err) {
                  if (err) throw err;
                });
              }
            })
        }
      })
    }
  })
})

function writeFile(fileDir, data) {
  fs.writeFile(fileDir, data, function (err) {
    if (err) throw err;
    return true;
  });
}


//----------------------------------------------PASSWORD--------------------------------------------
app.get('/check-password/:dir', (req, res) => {
  const files = fs.readdirSync(`${__dirname}\\static\\images\\`)
  let found = false;
  
  files.forEach(el => {
    if (el === req.params.dir) {
      fs.readFile(`${__dirname}\\static\\images\\${req.params.dir}\\${req.params.dir}.txt`, (err, data) => {
        if (err) {
          res.send({ "msg": 'NOT PASSWORD PROTECTED'})
          return;
        }
        else {
          JSON.parse(data).forEach(el => {
            if (el.password !== undefined) {
              found = true;
              return;
            }
          })
          if (found) {
            res.send({ "msg": 'PASSWORD PROTECTED'})
            return;
          } else {
            res.send({ "msg": 'NOT PASSWORD PROTECTED'})
            return;
          }
        }

      })
    }
  })
})

app.get('/control-password/:dir/:password', (req, res) => {
  console.log(req.params)
  const files = fs.readdirSync(`${__dirname}\\static\\images\\`)
  files.forEach(el => {
    if (el === req.params.dir) {
      fs.readFile(`${__dirname}\\static\\images\\${req.params.dir}\\${req.params.dir}.txt`, (err, data) => {
        if (err) res.send({"msg": "CANT FIND THAT TEXT FILE"})
        else {
          let found = null;
          JSON.parse(data).forEach(el => {
            if (data.password !== undefined) {
              found = data.password;
              return;
            }
          })
          if (found === null){
            res.send({"msg": "PASSWORD IS CORRECT"})
          } else {
            if (data.password === req.params.password){
              res.send({"msg": "PASSWORD IS CORRECT"});
            } else {
              res.send({"msg": "PASSWORD IS NOT CORRECT"});
            }
          }
        }
      })
    }
  })
})

app.post('/set-password', (req, res) => {
  const files = fs.readdirSync(`${__dirname}\\static\\images\\`)
  
  files.forEach(el => {
    if (el === req.body.dir) {
      
      fs.readFile(`${__dirname}\\static\\images\\${req.body.dir}\\${req.body.dir}.txt`, (err, data) => {
        if (err) {res.send({"msg": "CANT FIND THAT TEXT FILE"}); return;}
        else {
          let parsedData = JSON.parse(data)
          parsedData.push({password : req.body.password})
          console.log(parsedData)
          writeFile(`${__dirname}\\static\\images\\${req.body.dir}\\${req.body.dir}.txt`, JSON.stringify(parsedData));
        }
      })
    }
  })
  res.send({"msg":"PASSWORD SET"})
})


//-----------------------------------------APP LISTEN---------------------------------------//
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
