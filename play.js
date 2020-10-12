let username;
let imageData;
app.post('/imageData', function (req, res) {
  //FIND FOLDER
  imageData = req.body;
  console.log(imageData)
  imageData.id = uuidv4();
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
});