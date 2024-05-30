const { fetchArticleByID, fetchArticles } = require('../models/articles_models')
const { fetchCommentsByID, postComment } = require('../models/comments_models')


exports.getArticleByID = (req, res, next) => {
    const { article_id } = req.params;
    fetchArticleByID(article_id).then((article) => {
        res.status(200).send({ article })
    }).catch(next);
}

exports.getArticles = (req, res, next) => {
    fetchArticles().then((articles) => {
        res.status(200).send({ articles })
    }).catch(next);
}

exports.getCommentsByID = (req, res, next) => {
    const { article_id } = req.params;
    fetchCommentsByID(article_id).then((comments) => {
        res.status(200).send({ comments })
    }).catch(next);
}

exports.postCommentByID = (req, res, next) => {
    const { article_id } = req.params;
    const newComment = req.body;
    postComment(article_id, newComment).then((comment) => {
        res.status(201).send({comment})
    }).catch(next)
    
}