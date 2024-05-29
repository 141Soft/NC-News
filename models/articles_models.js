const db = require('../db/connection');

exports.fetchArticleByID = (id) => {
    if(isNaN(id)){
        return Promise.reject({status:400, msg:"Invalid article id"})
    }
    const idQuery = `WHERE article_id = ${id}`
    return db
    .query(`SELECT * FROM articles ${idQuery}`)
    .then(({rows}) => {
        if(rows.length === 0){
            return Promise.reject({status:404, msg:"No article with this ID"})
        }
        console.log(rows[0])
        return rows[0];
    })
}