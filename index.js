import "dotenv/config";
import connectDb from "./src/db/index.js";
import { app } from "./app.js"




connectDb().then(()=>{
    const port = process.env.PORT;
    app.listen(port, ()=>{
        console.log(`App running on port http://localhost:${port}`);
    })
}).catch((err)=>{
    console.log("Mongodb connection failed", err);
})

