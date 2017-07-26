const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const fs = require('fs');
//const translate = require('google-translate-api');
/*const vision = require('@google-cloud/vision')({
  projectId: 'kantanat-173010',
  keyFilename: './Kantanat-2c5e69c26590.json'
});*/
//const key = require('./Kantanat-2c5e69c26590.json')
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Grandpa BETA' });
});
/*
const google = async(path)=>{
  //const image = await fs.createReadStream(path);
  const data = vision.detect(path, ['similar']);
  return data;

}
*/

const faceAnalyze = async(path)=> {
  const image = await fs.createReadStream(path);
  let config = {
    'method': 'POST',
    'body': image,
    'headers': {
      'Content-Type': 'application/octet-stream',
      'Ocp-Apim-Subscription-Key': '2f5a0b8e977c4488b47c479a9283a216'
    }
  };
  let res = await fetch('https://southeastasia.api.cognitive.microsoft.com/face/v1.0/detect?returnFaceAttributes=age,gender,headpose,smile,facialHair,glasses,emotion,hair,accessories', config);
  const data = await res.json();
  return data;

}

const describeImage = async(path)=>{
    const image = await fs.createReadStream(path);
  let config = {
    'method': 'POST',
    'body': image,
    'headers': {
      'Content-Type': 'application/octet-stream',
      'Ocp-Apim-Subscription-Key': '613ac278b3044fc9b79d28904e5615de'
    }
  };
  let res = await fetch('https://southeastasia.api.cognitive.microsoft.com/vision/v1.0/describe', config);
  const data = await res.json();
  //console.log(data);
  return data;
}

const OCR = async(path)=>{
  const image = await fs.createReadStream(path);
  let config = {
  'method': 'POST',
  'body': image,
  'headers': {
    'Content-Type': 'application/octet-stream',
    'Ocp-Apim-Subscription-Key': '613ac278b3044fc9b79d28904e5615de'
  }
};
let res = await fetch('https://southeastasia.api.cognitive.microsoft.com/vision/v1.0/ocr', config);
const data = await res.json();
let text = '';

data.regions.forEach(region => {
  region.lines.forEach(line => {
    line.words.forEach(word => {
      text = text + ' ' + word.text;
    })
  });
});
return text;
}

const computerVIsion = async(path, op) => {
console.log(op);
if(op=='describe'){
  const describe = await describeImage(path);
  const face = await faceAnalyze(path);
  const res = await translate_faceApi(face);//);
  const token = await getToken('d1645879710344f6b7a40b1a19dcaa02');
  const thaiDescription = await bingTranslate(token, describe.description.captions[0].text);
// console.log(thaiDescription.getElementsByTagName("xmlns"));
//  console.log(res);
//  console.log(describe.description.captions[0].text);
const start = thaiDescription.search(">");
const end = thaiDescription.search("</");
console.log(thaiDescription.substring(start+1,end));
  const res2=Object.assign({face :res},{caption : thaiDescription.substring(start+1,end)});
//  console.log(res2);
  return res2;
}
  const text = await OCR(path);
  //console.log(text)
  return text;


}

const getToken = async(key) => {
  const config = {
    'method': 'POST'
  }
  const res = await fetch('https://api.cognitive.microsoft.com/sts/v1.0/issueToken?Subscription-Key=' + key, config);
  const data = res.text();
  return data;
}

const bingTranslate = async(token, text, from='en', to='th') => {
  const res = await fetch('https://api.microsofttranslator.com/V2/Http.svc/Translate?appid=Bearer ' + token + '&text=' + text + '&from=' + from + '&to=' + to);
  const data = res.text();
  return data;
}

const Translate_word = {
   'male':'ผู้ชาย'  ,
    'female':'ผู้หญิง' ,
    'NoGlasses':'ไม่ใส่แว่น' ,
    'ReadingGlasses':'ใส่แว่นสายตา' ,
    'Sunglasses':'ใส่แว่นกันแดด'  ,
    'SwimmingGoggles':'ใส่แว่นตาว่ายน้ำ' ,
    'happiness' :'มีความสุข' ,
    'anger':'โกรธ' ,
    'disgust': 'ขยะแขยง' ,
    'fear': 'กลัว' ,
    'neutral': 'ปกติ' ,
    'sadness': 'เศร้า' ,
    'surprise':'ตกใจ' ,
    'bald':'หัวล้าน' ,
    'headwear':'ใส่หมวก' ,
    'glasses':'ใส่แว่น' ,
    'mask' : 'ใส่หน้ากาก' ,
    'moustache':'หนวด' ,
    'beard': 'เครา' ,
    'sideburns': 'จอน' ,
    'black': 'ดำ' ,
    'brown':'น้ำตาล' ,
    'blond': 'บลอน' ,
    'gray': 'เทา' ,
    'red': 'แดง'
};

const getMaxPosibility = (object) => {
  let maxkey = '';
  let maxValue = 0;
  Object.entries(object).forEach(
    ([key, value]) => {
      if(value > maxValue) {
        maxValue = value;
        maxKey = key;
      }
    //  console.log(key,' ',value);
    }
  );
  return maxKey;
}

const getPosibility = (object) => {
  let key='';
  let value= 0;
  let text='';
  Object.entries(object).forEach(
    ([key, value]) => {
      if(value > 0.4) {
        text+='มี'+Translate_word[key];
      }
  //    console.log(key,' ',value);
    }
  );
  return text;
}

const translate_faceApi = async(data) => {
  //console.log(data);
  let res='';
  if (data.length>0){
  res += 'พบ'+data.length+'คน ';
  for(var i=0,len =data.length;i<len;i++){
    res+= (i+1)+Translate_word[data[i].faceAttributes.gender];
    //res+=await Translate_text.(data[0].faceAttributes.gender)+'<br>';
    res+= 'อายุ'+parseInt(data[i].faceAttributes.age)+'ปี';
  //  สีหน้า
    res+='ผมสี'+Translate_word[data[i].faceAttributes.hair.hairColor[0].color];
    res+= getPosibility(data[i].faceAttributes.facialHair);
    //res+='ใส่'
  //  if(data[0].faceAttributes.accessories.type='glasses'){
      res+= Translate_word[data[i].faceAttributes.glasses];
      if(data[i].faceAttributes.smile>0.5) res+='กำลังยิ้ม';
      res+='และมีสีหน้า'+Translate_word[getMaxPosibility(data[i].faceAttributes.emotion)]+" ";

  }
}

  return res;
}

router.post('/upload', async(req, res) => {
  try {
  //const image = await fs.createReadStrea(req.file.path);
//  const json = await google(req.file.path);
  const json = await computerVIsion(req.file.path,req.body.op);
  //const text = await translate_faceApi(json);
    /*let text = '';
    json.regions.forEach(region => {
      region.lines.forEach(line => {
        line.words.forEach(word => {
          text = text + ' ' + word.text;
        })
      });
    });*/
    //const description = json.description.captions[0].text;
  //  const token = await getToken('a04df5ff0ca646779800558f708fe425');
  //  const thaiDescription = await bingTranslate(token, 'sad');
    fs.unlink(req.file.path);
    //console.log(json);
    //res.send(description + '\n' + thaiDescription);
    res.json(json);
  //  res.send(thaiDescription);
  //  res.send(face);
    //res.send(text);
  } catch(err) {
    console.log(err);
    res.status(500).end();
  }
});

module.exports = router;
