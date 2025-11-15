// // import {v2} from "cloudinary"
// import fs from "fs"
// import { v2 as cloudinary } from 'cloudinary';


// //chai aur backend
// cloudinary.config({ 
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
//     api_key: process.env.CLOUDINARY_API_KEY, 
//     api_secret:process.env.CLOUDINARY_API_SECRET  // Click 'View API Keys' above to copy your API secret
// });
// const uploadOnCloudinary=async(localfilepath)=>{
//     try{
//         if(!localfilepath) return null
//         const response=await cloudinary.uploader.upload(localfilepath,{
//             resource_type:"auto"
//         })
//         //console.log("File Uploaded Successfully!!",response.url);
//         fs.unlinkSync(localfilepath)
//         return response
//     } catch ( error ){
//         fs.unlinkSync(localfilepath)
//         return null;
//     }
// }


// export{uploadOnCloudinary}


import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadOnCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    if (!fileBuffer) return resolve(null);

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "avatars",
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Error:", error);
          return reject(error);
        }
        resolve(result); // MUST resolve result
      }
    );

    uploadStream.end(fileBuffer); // IMPORTANT
  });
};


