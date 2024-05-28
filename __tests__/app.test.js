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
});