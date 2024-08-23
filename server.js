// in this single file you will learn about cloudinary and how to use it 
import express from "express";
const app=express();
import mongoose from "mongoose"
import path from "path";
import multer from "multer"


// mongoose connection code 
//step one open mongo db app in your windows or mac 
// copy the default url provided by the mongodb 
// set up a database name , like below we have made a folder name local
mongoose.connect(
    "mongodb://localhost:27017",
    {
        dbName:"local"
    }
)
.then(()=>console.log("mongo conncted"))
.catch((error)=>console.log(error));

// go to clodinary and sign in with google 
// after sign in install cloudinary in your nodejs 
// by the command npm install cloudinaryafter that copy your cloud_name,api_key and api_secret and paste it below
import { v2 as cloudinary } from 'cloudinary';

(async function() {

    // Configuration
    cloudinary.config({ 
        cloud_name: '<paste your credential>', 
        api_key: '<paste your credential>', 
        api_secret: '<paste your credential>' // Click 'View API Keys' above to copy your API secret
    });
    
    // Upload an image
     const uploadResult = await cloudinary.uploader
       .upload(
           'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
               public_id: 'shoes',
           }
       )
       .catch((error) => {
           console.log(error);
       });
    
    console.log(uploadResult);
    
    // Optimize delivery by resizing and applying auto-format and auto-quality
    const optimizeUrl = cloudinary.url('shoes', {
        fetch_format: 'auto',
        quality: 'auto'
    });
    
    console.log(optimizeUrl);
    
    // Transform the image: auto-crop to square aspect_ratio
    const autoCropUrl = cloudinary.url('shoes', {
        crop: 'auto',
        gravity: 'auto',
        width: 500,
        height: 500,
    });
    
    console.log(autoCropUrl);    
})();




// set up multer to upload the file 


const storage = multer.diskStorage({
    destination: "./public/uploads" ,
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    }
  })
  
  const upload = multer({ storage: storage })

//saving in mongodb 

const fileSchema = new mongoose.Schema({
    filename: String,
    public_id: String,
    imageUrl: String
})
const File=mongoose.model("cloudinary",fileSchema)

app.get("/",(req, res)=>{
    res.render("index.ejs",{url:null})
})

app.post("/upload", upload.single('file'),async (req, res) => {
    // console.log(req.file);
    // res.send("File uploaded successfully!");
    const file=req.file.path;
    const cloudinaryResponse=await cloudinary.uploader.upload(file,{
        // set your folder name , just typoe a name of your folder , it will be visible on the cloudinary
        folder:"<your_folder_name>"
    })
    // after saving to cloudinary we will sav ethe link to mongodb 
    const savetoDb= await File.create({
        filename: file.originalname,
        public_id: cloudinaryResponse.public_id,
        imageUrl: cloudinaryResponse.secure_url,
    })
    res.render("index.ejs", {url:cloudinaryResponse.secure_url})
    console.log("cloudinary response ",cloudinaryResponse);
    
});


// run your server 

const port=8000;
app.listen(port,()=>{
console.log(`server is running at ${port}`);
});