import mongoose from "mongoose";
export var Gender;
(function (Gender) {
    Gender["Male"] = "male";
    Gender["Female"] = "female";
    Gender["Other"] = "other";
})(Gender || (Gender = {}));
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    image_url: {
        type: String,
        default: ""
    },
    gender: {
        type: String,
        enum: Object.values(Gender), //restrict values to enum
        required: true
    }
}, {
    timestamps: true
});
export const User = mongoose.model("User", userSchema);
