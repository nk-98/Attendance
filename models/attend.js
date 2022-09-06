const mongoose = require("mongoose");

const AttendSchema = new mongoose.Schema( {
    date: {
        type: Date,
        required: true
    },
    start: {
        type: String,
    },
    end: {
        type: String
    },
    userId: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    }
})

AttendSchema.index({
	"$**": "text"
})

module.exports = mongoose.model("Attend", AttendSchema);