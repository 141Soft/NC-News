const { fetchUsers } = require('../models/users_models')

exports.getUsers = (req, res, next) => {
    fetchUsers()
    .then((users) => {
        res.status(200).send({ users })
    })
    .catch(next);
}