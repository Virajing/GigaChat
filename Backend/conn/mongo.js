const mongoose = require("mongoose");
require("dotenv").config();
const mongoURL = process.env.MONGO_URL;
mongoose.connect(mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
});
module.exports = mongoose;
