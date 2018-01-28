var mongoose = require("mongoose");
var projectSchema = new mongoose.Schema({
    contract_title: String,
    start_date_month: String,
    start_date_year: String,
    end_date_month: String,
    end_date_year: String,
    description: String,
    client: String,
    consultant: String,
    referee: String,
    cover_photo: String
})

/*var deepPopulate = require('mongoose-deep-populate')(mongoose);
newsSchema.plugin(deepPopulate,{});*/

module.exports = mongoose.model('project', projectSchema, 'project');
