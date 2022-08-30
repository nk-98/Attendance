const mongoose = require("mongoose");

const LeaveSchema = new mongoose.Schema( {
    date: {
        type: String,
        required: true
    },
    absent: {
        type: String,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
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

LeaveSchema.index({
	"$**": "text"
})

module.exports = mongoose.model("Leave", LeaveSchema);