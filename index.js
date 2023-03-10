const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const axios = require("axios");
const { config } = require("dotenv");
config();

const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB;

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

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "YOUR-DOMAIN.TLD"); // update to match the domain you will make the request from
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});

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

        //* We do the check on public/javascripts/get_status.js
        // let status;
        // try {
        //     const res = await axios.get(
        //         `https://warp-plus-${thread}.aldenalt.repl.co/`
        //     );
        //     status = res.status;
        // } catch (err) {
        //     status = err?.response?.status;
        // }

        if (threads[thread] === undefined) {
            threads[thread] = {
                thread: packet.Thread,
                // status: status,
                good: packet.good,
                bad: packet.bad,
                total: packet.good + packet.bad,
            };

            total.good += packet.good;
            total.bad += packet.bad;
            total.total += packet.good + packet.bad;
        }
    }

    let referrer = undefined;

    try {
        const res = await axios.get(
            "https://raw.githubusercontent.com/AldenizenMC/warp-plus/main/config/REFERRAL.txt"
        );
        referrer = res.data;
    } catch (err) {
        referrer = undefined;
    }

    res.render("index", {
        threads: threads.filter((n) => n),
        total: total,
        referrer: referrer,
    });
});

app.listen(port, () => console.log(`Listening on port ${port}`));
