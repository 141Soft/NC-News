const app = require('../app');
const db = require('../db/connection');
const request = require('supertest');
const seed = require('../db/seeds/seed');
const data = require('../db/data/test-data/index');

beforeEach(() => {return seed(data)});
afterAll(() => db.end());

describe('/api/topics', () => {
    test('returns status code 200', ()=> {
        return request(app)
        .get('/api/topics')
        .expect(200);
    })
    test('returns an array of objects containing the correct properties', ()=> {
        return request(app)
        .get('/api/topics')
        .then(({body}) => {
            body.topics.forEach((topic) => {
                expect(topic).toMatchObject({
                    slug: expect.any(String),
                    description: expect.any(String),
                })
            })
        })
    })
    test('returns 404 if no topics found', ()=> {
        return db.query(` DELETE FROM comments; DELETE FROM articles; DELETE FROM topics`).then(()=> {
            return request(app)
            .get('/api/topics')
            .expect(404)
            .then(({body}) => {
                expect(body).toEqual({msg: "No Topics Found"})
            })
        })
    })
    test('returns 404 if table does not exist', ()=> {
        return db.query(` DROP TABLE comments; DROP TABLE articles; DROP TABLE topics`).then(()=> {
            return request(app)
            .get('/api/topics')
            .expect(404)
            .then(({body}) => {
                expect(body).toEqual({msg: "Table Does Not Exist"})
            })
        })
    })
});