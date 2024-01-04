// Tag Document Schema
const mongoose = require('mongoose')
const Schema = mongoose.Schema


//NOTE Created by should be a Account Name of a user in the database because each user uniquely creates a tag
//NOTE I think created_by should be the email//Account Name because its the only unique identifier
const TagSchema = new Schema({
    name: {type: String, required: true},
    created_by: {type: String, required: true}
}
);

TagSchema.virtual('url').get(function(){
    return 'posts/tag/' + this._id;
})

module.exports = mongoose.model('Tag',TagSchema);