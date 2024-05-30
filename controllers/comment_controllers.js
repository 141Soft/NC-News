const { deleteComment } = require('../models/comments_models')

exports.deleteCommentByID = (req, res, next) => {
    const { comment_id } = req.params;
    deleteComment(comment_id).then((comment) => {
        res.status(204).send(comment)
    }).catch(next);
}