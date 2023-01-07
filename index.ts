import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import mongoose from "mongoose";

import Thread from "./schemas/thread";
import { config as dotenv } from "dotenv";
import {} from "./enviroment";

dotenv();

mongoose.set("strictQuery", true);

const app = express();
const port = 8080;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.get("/", async (req, res) => {
    const packets = await getAllPackets();

    let threads: any[] = [];

    for (let packet of packets) {
        if (!packet.Thread) return;

        const thread = packet.Thread;

        if (threads[thread] === undefined)
            threads[thread] = {
                thread: packet.Thread,
                good: 0,
                bad: 0,
                total: 0,
            };

        if (packet.Type === true) {
            threads[thread].good++;
        }
        if (packet.Type === false) {
            threads[thread].bad++;
        }

        threads[thread].total += 1;
    }
    res.render("index", {
        threads: threads.filter((n) => n),
    });
});

app.post("/found", async (req, res) => {
    if (!req.body) return res.sendStatus(400);
    if (!req.body["key"] || !req.body["type"] || !req.body["thread"])
        return res.sendStatus(400);

    if (req.body["key"] !== process.env.KEY) return res.sendStatus(401);
    if (req.body["type"] !== "true" && req.body["type"] !== "false")
        return res.sendStatus(400);
    if (isNaN(req.body["thread"])) return res.sendStatus(400);

    let data = {
        thread: req.body["thread"], // int
        type: req.body["type"], // boolean
        timestamp: Date.now(),
    };

    const thread = await Thread.create({
        Thread: data.thread,
        Type: data.type,
        Timestamp: data.timestamp,
    });

    res.sendStatus(200);
});

/**
 *
 * @param thread Thread number
 * @param type Packet type (true for good. false for bad. undefined for all.)
 */
async function getPackets(
    thread: number,
    type: boolean | undefined = undefined
) {
    if (type !== undefined) {
        const result = await Thread.find({
            Thread: thread,
            Type: type,
        });

        return result;
    } else {
        const result = await Thread.find({
            Thread: thread,
        });

        return result;
    }
}

async function getAllPackets(type: boolean | undefined = undefined) {
    if (type !== undefined) {
        const result = await Thread.find({ Type: type });
        return result;
    } else {
        const result = await Thread.find({});
        return result;
    }
}

app.listen(port, () => console.log(`Listening on port ${port}`));
mongoose.connect(process.env.MONGODB, () =>
    console.log("Connected to database")
);
