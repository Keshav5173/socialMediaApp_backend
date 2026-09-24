import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import router from "./src/routes/index.js";

const app = express();

console.log("HELLO",process.env.CORS_ORIGIN);

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true
    })
);

app.use(express.json({ limit: "16kb" }));

app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

app.use(cookieParser());

app.use("/api", router);

export { app };