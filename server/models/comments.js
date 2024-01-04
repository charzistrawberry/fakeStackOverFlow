const mongoose = require('mongoose')
const Schema = mongoose.Schema


const CommentSchema = new Schema({
    text: {type:String, required: true},
    comment_by: {type:String, required: true},
    comment_date_time: {type: Date, default:Date.now},
    userEmail: {type : String, required: true},
    up_votes: {type: Number, default: 0}
})

CommentSchema.virtual('url').get(function(){
    return 'posts/comment/' + this._id;
});

module.exports = mongoose.model('Comment',CommentSchema);
