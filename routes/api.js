'use strict';

const mongoose = require('mongoose');

mongoose.connect(
  process.env['MONGO_URI'],
  { useNewUrlParser: true, useUnifiedTopology: true }
);

const issueSchema = new mongoose.Schema({
  project : String,
  issue_title : String,
  issue_text : String,
  created_on : Date,
  updated_on : Date,
  created_by : String,
  assigned_to : String,
  open : Boolean,
  status_text : String
});

let Issue = mongoose.model('Issue', issueSchema);

module.exports = function (app) {

  app.route('/api/issues/:project')
    .get(function (req, res){
      let project = req.params.project;

      let findObjectByProps = {project : project};
      if(req.query.open)
        findObjectByProps['open'] = req.query.open;
      if(req.query.issue_title)
        findObjectByProps['issue_title'] = req.query.issue_title;
      if(req.query.issue_text)
        findObjectByProps['issue_text'] = req.query.issue_text;
      if(req.query.created_on)
        findObjectByProps['created_on'] = req.query.created_on;
      if(req.query.updated_on)
        findObjectByProps['updated_on'] = req.query.updated_on;
      if(req.query.created_by)
        findObjectByProps['created_by'] = req.query.created_by;
      if(req.query.assigned_to)
        findObjectByProps['assigned_to'] = req.query.assigned_to;
      if(req.query.status_text)
        findObjectByProps['status_text'] = req.query.status_text;
      if(req.query._id)
        findObjectByProps['_id'] = req.query._id;     

      Issue.find(findObjectByProps, (err, data) => {
        if(err)
          return console.error(err);
        res.json(data);
      });
    })
    
    .post(function (req, res){
      let project = req.params.project;

      if(req.body.issue_title == null || req.body.issue_text == null || req.body.created_by == null)
        return res.json({error : 'required field(s) missing' });

      let document = Issue({
        project : project,
        issue_title : req.body.issue_title,
        issue_text : req.body.issue_text,
        created_on : new Date().toUTCString(),
        updated_on : new Date().toUTCString(),
        created_by : req.body.created_by,
        assigned_to : req.body.assigned_to || "",
        open : true,
        status_text : req.body.status_text || ""
      });
      document.save((err, data) => {
        if(err)
          return console.error(err);
        return res.json(data);
      });
    })
    
    .put(function (req, res){
      let project = req.params.project;

      if(req.body._id == null)
        return res.json({error : 'missing _id'});

      if(Object.keys(req.body).length  == 1)
        return res.json({error : 'no update field(s) sent' , _id : req.body._id});

      Issue.findById(req.body._id, (err, issue) => {
        if(err || !issue)
          return res.json({error : "could not update", _id : req.body._id});

        Object.keys(req.body).forEach(key => { issue[key] = req.body[key] });
        issue['updated_on'] = new Date().toUTCString();

        issue.save((err, data) => {
          if(err)
            return res.json({error : "could not save", _id : req.body._id});
          return res.json({result : "successfully updated", _id : data._id});
        });
      });
    })
    
    .delete(function (req, res){
      let project = req.params.project;
      
      if(req.body._id == null)
        return res.json({error : 'missing _id'}); 

      Issue.findOneAndDelete({_id :req.body._id}, {useFindAndModify : false}, (err, data) => {
        if(err || !data)
          return res.json({error:"could not delete", _id : req.body._id});
        return res.json({result : "successfully deleted" , _id : req.body._id});
      });
    });
    
};
