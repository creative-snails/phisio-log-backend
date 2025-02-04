"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const speech_1 = require("@google-cloud/speech");
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const openai_1 = __importDefault(require("openai"));
const db_1 = __importDefault(require("./startup/db"));
(0, db_1.default)();
const app = (0, express_1.default)();
const port = 4000;
app.use((0, cors_1.default)());
app.use(express_1.default.json()); // parse JSON bodies
app.use(express_1.default.urlencoded({ extended: true })); // handle form data
// const Schema = mongoose.Schema;
// const TestSchema = new Schema({
//   name: String,
// });
// const TestModel = mongoose.model("Test", TestSchema);
// app.get("/test-db", async (req: Request, res: Response) => {
//   const testDoc = new TestModel({ name: "Test Document" });
//   await testDoc.save();
//   res.send("Hello, World! Document saved.");
// });
// Initialize Google Speech-to-Text client
const googleClient = new speech_1.SpeechClient({
    keyFilename: "./phisiolog-service-account.json",
});
// Initialize OpenAI client
const openAIClient = new openai_1.default({
    apiKey: process.env["OPENAI_API_KEY"],
});
app.post("/chat", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const chatCompletion = yield openAIClient.chat.completions.create({
        messages: [{ role: "user", content: req.body.message }],
        model: "gpt-3.5-turbo",
    });
    const myJSON = JSON.parse(chatCompletion.choices[0].message.content);
    res.send({ myJSON });
}));
app.post("/transcribe", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const audioFilePath = "./transcript-test-10-seconds.wav";
    const audio = {
        content: fs_1.default.readFileSync(audioFilePath).toString("base64"),
    };
    const config = {
        encoding: speech_1.protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.LINEAR16,
        languageCode: "en-US",
        sampleRateHertz: 16000,
    };
    const request = {
        audio: audio,
        config: config,
    };
    try {
        const [response] = yield googleClient.recognize(request);
        const transcription = (_a = response.results) === null || _a === void 0 ? void 0 : _a.map((result) => { var _a, _b; return (_b = (_a = result === null || result === void 0 ? void 0 : result.alternatives) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.transcript; }).join("\n");
        res.send(`Transcription: ${transcription}`);
    }
    catch (error) {
        console.error("Error transcribing audio:", error);
        res.status(500).send("Error transcribing audio");
    }
}));
app.get("/", (req, res) => {
    res.send("Hello, World!");
});
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
