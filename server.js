require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const bodyParser = require('body-parser');
mongoose.connect('mongodb+srv://lee:lee@cluster0.wtyhr.mongodb.net/linkshortener?retryWrites=true&w=majority')

let linkSchema = new mongoose.Schema({
  org:String,
  sh:String
});

let Link = mongoose.model('Link',linkSchema);
// Basic Configuration
const port = process.env.PORT || 3000;
app.use(bodyParser.urlencoded({extended:true}));
app.use(cors());
function generateRandomString(length){
  let result = "", seeds

  for(let i = 0; i < length - 1; i++){
      //Generate seeds array, that will be the bag from where randomly select generated char
      seeds = [
          Math.floor(Math.random() * 10) + 48,
          Math.floor(Math.random() * 25) + 65,
          Math.floor(Math.random() * 25) + 97
      ]
      
      //Choise randomly from seeds, convert to char and append to result
      result += String.fromCharCode(seeds[Math.floor(Math.random() * 3)])
  }

  return result
}
const shortUrl = (url,result) =>{
  let id = generateRandomString(5);
  // let lnk = new Link({
  //   org:url,
  //   sh: id
  // });
  // lnk.Save();
  Link.create({
    org:url,
    sh: id
  },(err,res)=>{
    if(err) res(err,null);
    result(null,{original_url:url,short_url:id});
  })
}

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});
// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl',(req,res,next)=>{
  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  if(pattern.test(req.body.url)){
    next();
  }
  res.json({error:'invalid url'});
},(req,res)=>{
  let url = req.body.url;
  shortUrl(url,(err,result)=>{
    if(err) throw err;
    res.send(result);
  })
});

app.get('/api/shorturl/:id',(req,res,next)=>{
  Link.findOne({sh:req.params.id},{},(err,result)=>{
    if(err) throw err;
    res.redirect(result.org);
  });
  next();
},(req,res)=>{
  
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
