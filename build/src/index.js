"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const passport_1 = __importDefault(require("passport"));
const express_session_1 = __importDefault(require("express-session"));
const dotenv_1 = __importDefault(require("dotenv"));
const yamljs_1 = __importDefault(require("yamljs"));
const cors_1 = __importDefault(require("cors"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const dist_1 = __importDefault(require("../dist"));
const impl_1 = require("./impl");
dotenv_1.default.config();
const swaggerDocument = yamljs_1.default.load("openapi.yaml");
const app = (0, express_1.default)();
const impl = new impl_1.ServiceImplementation();
const options = {
    swaggerOptions: {
        url: "/docs/swagger.json",
        displayRequestDuration: true,
    },
};
app.use((0, express_session_1.default)({
    resave: false,
    saveUninitialized: true,
    secret: process.env.SECRET ?? "SECRET",
}));
app.use(express_1.default.json());
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.use((0, cors_1.default)({ origin: "*" }));
app.get("/docs/swagger.json", (_, res) => res.json(swaggerDocument));
app.use("/docs", swagger_ui_express_1.default.serveFiles(undefined, options), swagger_ui_express_1.default.setup(undefined, options));
(0, dist_1.default)(app, impl);
const PORT = Number(process.env.PORT) || 8082;
const httpServer = http_1.default.createServer(app);
httpServer.listen(PORT, () => console.log(`Service running at http://localhost:${PORT}/`));
