const { fetchEndpoints } = require('../models/endpoints_models')

exports.getEndpoints = (req, res, next) => {
    fetchEndpoints()
    .then((endpoints) => {
        res.status(200).send({ endpoints })
    })
    .catch(next);
}