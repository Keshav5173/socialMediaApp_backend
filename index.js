import dotenv from "dotenv";
import connectDb from "./src/db/index.js";
import { app } from "./app.js"


dotenv.config({
    path: "./.env"
})


connectDb().then(()=>{
    const port = process.env.PORT;
    app.listen(port, ()=>{
        console.log(`App running on port http://localhost:${port}`);
    })
}).catch((err)=>{
    console.log("Mongodb connection failed", err);
})

