import express from "express";
import mongoose from "mongoose";
import routes from "./src/routes/routes.js";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

mongoose.connect(process.env.MONGODB_CONNECTION_STRING)
    .then(() => console.log("connected to the database"))
    .catch(error => console.log(error));

const port = process.env.PORT || 5000;

const app = express();

app.use(cookieParser());

app.use(helmet());

app.use(cors());

app.use(express.json());

app.use(morgan('dev'));

app.use('/api', routes);

app.use('*', (req, res) => res.status(404).json({ msg: 'Not found' }));

app.listen(port, () => console.log(`server running on port ${port}`));