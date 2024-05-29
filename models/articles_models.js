const db = require('../db/connection');
const { forEach } = require('../db/data/test-data/articles');
const { commentCount } = require('./model_utils/commentCount')

exports.fetchArticleByID = (id) => {
    if(isNaN(id)){
        return Promise.reject({status:400, msg:"Invalid article id"})
    }
    return db
    .query("SELECT * FROM articles WHERE article_id = $1;", [id])
    .then(({rows}) => {
        if(rows.length === 0){
            return Promise.reject({status:404, msg:"No article with this ID"})
        }
        console.log(rows[0])
        return rows[0];
    })
}

exports.fetchArticles = () => {
    return db
    .query("SELECT article_id, title, topic, author, created_at, votes, article_img_url FROM articles")
    .then(({ rows }) => {
        return Promise.all(rows.map((article) => {
            return commentCount(article.article_id)
            .then((result) => {
                article.comment_count = result
                return article
            })
        }))
    })
}