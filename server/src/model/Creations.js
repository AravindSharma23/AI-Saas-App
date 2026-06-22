import mongoose from "mongoose";

const creationsSchema = mongoose.Schema({
    user_id: {
        type: String,
        required: true
    },
    prompt: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    publish: {
        type: Boolean,
        required: true,
        default: false
    },
    likes: {
        type: [String],
    },
},
    { timestamps: true });

export default mongoose.model("Creations", creationsSchema);