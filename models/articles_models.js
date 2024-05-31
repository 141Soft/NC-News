const db = require('../db/connection');
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

exports.fetchArticles = (topic) => {
    const queryValues = [];
    let queryString = 'SELECT article_id, title, topic, author, created_at, votes, article_img_url FROM articles'

    if(topic) {
        queryValues.push(topic)
        queryString += ' WHERE topic = $1'
    }

    queryString += ' ORDER BY created_at DESC'

    return db
    .query(queryString, queryValues)
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

exports.updateVotes = (article_id, numVotes) => {
    return this.checkID((article_id))
    .then(() => {
        return db
        .query("SELECT * FROM articles WHERE article_id = $1", [article_id])
    })
    .then(({ rows }) => {
        const updatedVotes = rows[0].votes += numVotes
        return db
        .query("UPDATE articles SET votes = $1 WHERE article_id = $2 RETURNING *", [updatedVotes, article_id])
    })
    .then(({ rows }) => {
        return rows[0]
    })
}