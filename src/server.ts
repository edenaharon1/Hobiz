import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import bodyParser from "body-parser";
import express, { Express, Request, Response } from "express";
import postsRoute from "./routes/posts_routes";
import commentsRoute from "./routes/comments_routes";
import authRoutes from "./routes/auth_routes";
import userRoutes from "./routes/user_routes";
import { authMiddleware } from "./controllers/auth_controller";
import path from "path";
import cors from "cors";
import filerouter from "./routes/file_routes";
import swaggerUi from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";

const app = express();

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Web Dev 2025 REST API",
            version: "1.0.0",
            description: "REST server including authentication using JWT",
        },
        servers: [{url: "http://localhost:3001",},],
    },
    apis: ["./src/routes/*.ts"],
};
const specs = swaggerJsDoc(options);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

app.use(cors({
    origin: "*", // או כתובת ה-origin של הפרונט שלך
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["accessToken", "refreshToken"],
}));
app.use(express.json());
app.use("/auth", authRoutes);
app.use((req, res, next) => {
    console.log(`${req.method} request for ${req.url}`);
    console.log("Headers:", req.headers);
    if (req.method === 'POST' || req.method === 'PUT') {
        console.log("Body:", req.body);
    }
    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))


// טיפול בבקשות OPTIONS עבור /posts
app.options('/posts', cors());
// הוספת נתיב בסיסי
app.get('/', (req: Request, res: Response) => {
    res.send('Welcome to my API!');
});


app.use("/posts", postsRoute);
app.use("/comments", commentsRoute);
app.use("/files", filerouter);
app.use("/users", userRoutes);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")))


const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to database"));


const initApp = () => {
    return new Promise<Express>((resolve, reject) => {
        if (!process.env.DB_CONNECT) {
            reject("DB_CONNECT is not defined in .env file");
        } else {
            mongoose
                .connect(process.env.DB_CONNECT)
                .then(() => {
                    resolve(app);
                    console.log("Connected to database");
                })
                .catch((error) => {
                    reject(error);
                });
        }
    });
};

export default initApp;