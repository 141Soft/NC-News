const { fetchArticleByID, fetchArticles } = require('../models/articles_models')

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