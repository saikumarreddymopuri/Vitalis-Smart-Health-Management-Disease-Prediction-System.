//require('dotenv').config( {path: './env'})

import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app } from "./app.js";
// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";

dotenv.config({
    path: './.env'
})


connectDB()
.then(() => {
    app.listen(process.env.PORT || 4000, () => {
        console.log(`Server is running at port : ${process.env.PORT}`);
    })
})
.catch((error) => {
    console.log("Mongo db connection failed !!! ",error);
    
})

