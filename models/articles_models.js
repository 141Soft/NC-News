const db = require('../db/connection');
const { forEach } = require('../db/data/test-data/articles');
const { commentCount } = require('./model_utils/commentCount')

exports.fetchArticleByID = (id) => {
    return db
    .query("SELECT * FROM articles WHERE article_id = $1;", [id])
    .then(({rows}) => {
        if(rows.length === 0){
            return Promise.reject({status:404, msg:"No article with this ID"})
        }
        return rows[0];
    })
}

exports.fetchArticles = () => {
    return db
    .query("SELECT article_id, title, topic, author, created_at, votes, article_img_url FROM articles ORDER BY created_at DESC")
    .then(({ rows }) => {
        if(rows.length === 0){
            return Promise.reject({status:404,msg:"No articles found"})
        }
        return Promise.all(rows.map((article) => {
            return commentCount(article.article_id)
            .then((commentTotal) => {
                article.comment_count = commentTotal
                return article
            })
        }))
    })
}

exports.checkID = (article_id) => {
    return db
    .query("SELECT * FROM articles WHERE article_id = $1", [article_id])
    .then(({ rows }) => {
        if(rows.length === 0){
            return Promise.reject({status:404, msg: 'ID not found'})
        }
    })
}