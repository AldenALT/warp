import { Schema, model } from "mongoose";

export default model(
    "Thread",
    new Schema({
        Thread: { type: Number, requried: true },
        Type: { type: Boolean, requried: true }, // true = good; false = bad;
        Timestamp: { type: Number, required: true, unique: false },
    })
);
