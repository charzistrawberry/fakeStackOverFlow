const mongoose = require('mongoose')
const Schema = mongoose.Schema
// So far we only need i think the password hash the usernam and the account name
// We could add in here question, answer, comment references?


// Account Name is email
// questions will denote the list of questions posted by the user
const UserSchema = new Schema(
    {
        email: { type : String, required: true },
        username: { type: String, required: true },
        passwordHash: { type: String, required: true },
        reputation: {type: Number, default: 0},
        isAdmin: {type: Boolean, default: false},
        questions: [{type: Schema.Types.ObjectId,ref: 'Question',default:[]}],
        questionsAnswered: [{type: Schema.Types.ObjectId,ref: 'Question',default:[]}],
        tags:[{type: Schema.Types.ObjectId,ref: 'Tag',default:[]}]
    },
    { timestamps: true },
)

module.exports = mongoose.model('User', UserSchema)
