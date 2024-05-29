const db = require('../db/connection');
const { checkID } = require('../models/articles_models')

exports.fetchCommentsByID = (article_id) => {
    return checkID(article_id).then(()=>{
        return db
        .query("SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at ASC", [article_id])
        .then(({rows}) => {
            return rows;
        })
    })
}