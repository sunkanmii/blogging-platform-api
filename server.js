import express from "express";
import mongoose from "mongoose";
import routes from "./src/routes/routes.js";

mongoose.connect('mongodb://localhost:27017/blog')
    .then(() => console.log("connected to the database"))
    .catch(error => console.log(error));

const port = process.env.PORT || 5000;

const app = express();

app.use('/api', routes);

app.listen(port, () => console.log(`server running on port ${port}`));