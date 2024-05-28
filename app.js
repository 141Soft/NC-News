const express = require('express')
const { getTopics } = require('./controllers/topics_controllers');
const { getEndpoints } = require('./controllers/endpoints_controllers');

const app = express();

app.get('/api/topics', getTopics);

app.get('/api', getEndpoints);

app.use((err, req, res, next) => {
    if (err.status && err.msg) {
      res.status(err.status).send({ msg: err.msg });
    }
    next(err);
  });

app.use((err, req, res, next) => {
    if(err.code === '42P01') {
        console.log("hit")
        res.status(404).send({msg: 'Table Does Not Exist'})
    }
})

app.use((err,req,res,next) => {
    console.log(err)
    res.status(500).send({msg: 'Internal Server Error'});
})

module.exports = app;