var mongoose= require('mongoose');

var dataShema = mongoose.Schema({

    local	: {
        xyz     : {type:String},
        temp     : {type:String},
        battery     : {type:String},
        datetime:{type: Date, default: Date.now() }
    }
});
module.exports = mongoose.model('data', dataShema);