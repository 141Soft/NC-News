const app = require('../app');
const db = require('../db/connection');
const request = require('supertest');
const seed = require('../db/seeds/seed');
const data = require('../db/data/test-data/index');
const fs = require('fs/promises')

beforeEach(() => {return seed(data)});
afterAll(() => db.end());

describe('/api/topics', () => {
    test('returns an array of objects containing the correct properties', ()=> {
        return request(app)
        .get('/api/topics')
        .expect(200)
        .then(({body}) => {
            body.topics.forEach((topic) => {
                expect(topic).toMatchObject({
                    slug: expect.any(String),
                    description: expect.any(String),
                })
            })
        })
    })
});

describe('/api', ()=> {
    test('returns a JSON object matching the contents of endpoints.json', () => {
        return fs.readFile('endpoints.json','utf-8').then((endpoints) => {
            return request(app)
            .get('/api')
            .expect(200)
            .then(({body})=> {
                expect(body.endpoints).toEqual(endpoints)
            })
        })
    });
})

describe.only('/api/articles', () => {
    test('Returns all articles with comment count property', () => {
        return request(app)
        .get('/api/articles')
        .expect(200)
        .then(({body}) => {
            body.articles.forEach((article) => {
                expect(article).toMatchObject({
                    article_id:expect.any(Number),
                    title: expect.any(String),
                    topic:expect.any(String),
                    author: expect.any(String),
                    created_at:expect.any(String),
                    votes:expect.any(Number),
                    article_img_url:expect.any(String),
                    comment_count:expect.any(Number)
                })
            })
        })
    });
});

describe('/api/articles/:article_id', () => {
    test('Returns an article with the correct id', () => {
        const article_id = 1
        return request(app)
        .get(`/api/articles/${article_id}`)
        .expect(200)
        .then(({body}) => {
            expect(body.article.article_id).toEqual(article_id)
        })
    });
    test('Returns a 400 error if an invalid ID parameter is used', () => {
        const article_id = "a"
        return request(app)
        .get(`/api/articles/${article_id}`)
        .expect(400)
        .then(({body}) => {
            expect(body).toEqual({msg: "Invalid article id"})
        })
    })
    test('Returns a 404 error when a valid ID is passed that does not correspond to a row in the DB', () => {
        const article_id = 9999
        return request(app)
        .get(`/api/articles/${article_id}`)
        .expect(404)
        .then(({body}) => {
            expect(body).toEqual({msg: "No article with this ID"})
        })
    });
});