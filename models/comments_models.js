const db = require('../db/connection');
const { checkID } = require('../models/articles_models')

exports.fetchCommentsByID = (article_id) => {
    return checkID(article_id)
    .then(()=>{
        return db
        .query("SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at ASC", [article_id])
    })
    .then(({rows}) => rows)
}

exports.postComment = (article_id, newComment) => {
    return checkID(article_id)
    .then(() => {
        const { username, body } = newComment;
        return db
        .query("INSERT INTO comments (author, body, article_id, votes) VALUES ($1, $2, $3, $4) RETURNING *;", [username, body, article_id, 0])
    })
    .then(({ rows }) => rows[0])
}