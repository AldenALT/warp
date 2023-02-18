const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const axios = require("axios");
const { config } = require("dotenv");
config();

const { MongoClient } = require("mongodb");
const uri =
    "mongodb+srv://dashboard:QHTPQsy6khXaxsJ5@cluster0.zlp3kmw.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

let connectedToDatabase = false;

client.connect().then(() => {
    connectedToDatabase = true;
    console.log("Connected to database");
});

const app = express();
const port = 8080;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.get("/", async (req, res) => {
    if (!connectedToDatabase) {
        res.status(503);
        res.send("<pre>Client is not connected to database (yet)</pre>");
        return;
    }

    const collection = client.db("test").collection("Thread");
    const packets = await collection.find({}).toArray();

    let threads = [];
    let total = { total: 0, good: 0, bad: 0 };

    for (let packet of packets) {
        if (!packet.Thread) return;

        const thread = packet.Thread;
        let status;

        try {
            const res = await axios.get(
                `https://warp-plus-${thread}.aldenalt.repl.co/`
            );
            status = res.status;
        } catch (err) {
            status = err?.response?.status;
        }

        if (threads[thread] === undefined) {
            threads[thread] = {
                thread: packet.Thread,
                status: status,
                good: packet.good,
                bad: packet.bad,
                total: packet.good + packet.bad,
            };

            total.good += packet.good;
            total.bad += packet.bad;
            total.total += packet.good + packet.bad;
        }
    }

    res.render("index", {
        threads: threads.filter((n) => n),
        total: total,
    });
});

app.listen(port, () => console.log(`Listening on port ${port}`));
