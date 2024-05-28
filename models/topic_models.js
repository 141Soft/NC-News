const db = require('../db/connection');

exports.fetchTopics = () => {
    return db
    .query(`SELECT * FROM topics`)
    .then(({rows}) => {
        if(rows.length === 0){
            return Promise.reject({status:404, msg:"No Topics Found"})
        }
        return rows
    });
}