import "dotenv/config";
import connectDb from "./src/db/index.js";
import { app } from "./app.js"
import { createServer } from "http";
import { initSocket } from "./ws.js"
import { Server } from "socket.io";




connectDb()
    .then(() => {
        const httpServer = createServer(app);
        const io = initSocket(httpServer);
        app.set("io", io); 

        httpServer.listen(process.env.PORT, () => {
            console.log(`App running on port http://localhost:${process.env.PORT}`);
        });
    })
    .catch((err) => {
        console.log("Server failed to start", err);
    });

