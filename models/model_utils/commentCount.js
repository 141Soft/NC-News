const db = require('../../db/connection')

//Finds total number of comments that reference the passed article_id
exports.commentCount = (article_id) => {
    return db
    .query("SELECT * FROM comments WHERE article_id = $1;", [article_id])
    .then(({ rows }) => {
        return rows.length;
    })
}