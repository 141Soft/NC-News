const db = require('../db/connection');

exports.fetchUsers = () => {
    return db
    .query('SELECT * FROM users')
    .then(({ rows }) => {
        if(rows.length === 0){return Promise.reject({status:404, msg:"No Users Found"})}
        return rows
    })
}