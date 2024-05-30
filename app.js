const express = require('express')
const { getTopics } = require('./controllers/topics_controllers');
const { getEndpoints } = require('./controllers/endpoints_controllers');
const { getArticleByID, getArticles, getCommentsByID, postCommentByID, patchArticleByID } = require('./controllers/articles_controllers');
const { deleteCommentByID } = require('./controllers/comment_controllers')
const { getUsers } = require('./controllers/users_controllers')

const app = express();

app.use(express.json());

app.get('/api', getEndpoints);

app.get('/api/users', getUsers);

app.get('/api/topics', getTopics);

app.get('/api/articles', getArticles);

app.get('/api/articles/:article_id', getArticleByID);

app.get('/api/articles/:article_id/comments', getCommentsByID)

app.post('/api/articles/:article_id/comments', postCommentByID)

app.patch('/api/articles/:article_id', patchArticleByID)

app.delete('/api/comments/:comment_id', deleteCommentByID)

//Error Handling
app.all('*', (req, res) => {
  res.status(404).send({message: "Not Found"})
})

app.use((err, req, res, next) => {
    if (err.status && err.msg) {
      res.status(err.status).send({ msg: err.msg });
    }
    else { next(err); }
})
app.use((err, req, res, next) => {
  if(err.code === '22P02') {
    res.status(400).send({msg: 'Invalid ID'})
  }
  next(err)
})
app.use((err, req, res, next) => {
  if(err.code === '23502'){
    res.status(400).send({msg: 'Missing required property for db update'})
  }
  next(err)
})
app.use((err, req, res, next) => {
  if(err.code === '23503'){
    res.status(400).send({msg: 'Request body conflicts with db'})
  }
  next(err)
})
app.use((err, req, res, next) => {
    if(err.code === '42P01') {
        res.status(404).send({msg: 'Table Does Not Exist'})
    }
    next(err)
})
app.use((err, req, res, next) => {
    console.log(err)
    res.status(500).send({msg: 'Internal Server Error'});
    next(err)
})

module.exports = app;