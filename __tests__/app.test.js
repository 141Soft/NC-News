const app = require("../app");
const db = require("../db/connection");
const request = require("supertest");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data/index");
const fs = require("fs/promises");
const { commentCount } = require("../models/model_utils/commentCount");

beforeEach(() => {
  return seed(data);
});
afterAll(() => db.end());

describe("/api/topics", () => {
  test("returns an array of objects containing the correct properties", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        body.topics.forEach((topic) => {
          expect(topic).toMatchObject({
            slug: expect.any(String),
            description: expect.any(String),
          });
        });
      });
  });
});

describe("/api", () => {
  test("returns a JSON object matching the contents of endpoints.json", () => {
    return fs.readFile("endpoints.json", "utf-8").then((endpoints) => {
      return request(app)
        .get("/api")
        .expect(200)
        .then(({ body }) => {
          expect(body.endpoints).toEqual(endpoints);
        });
    });
  });
});

describe("/api/articles", () => {
  test("Returns all articles with comment count property", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        body.articles.forEach((article) => {
          expect(article).toMatchObject({
            article_id: expect.any(Number),
            title: expect.any(String),
            topic: expect.any(String),
            author: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(Number),
          });
        });
      });
  });
  test('Returns articles ordered by date created in descending order', () => {
    return request(app)
    .get("/api/articles")
    .then(({body}) => {
        expect(body.articles).toBeSortedBy('created_at', { descending: true})
    })
  });
});

describe("/api/articles/:article_id", () => {
  test("Returns an article with the correct id", () => {
    const article_id = 1;
    return request(app)
      .get(`/api/articles/${article_id}`)
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toMatchObject({
          article_id: expect.any(Number),
          title: expect.any(String),
          topic: expect.any(String),
          author: expect.any(String),
          body: expect.any(String),
          created_at: expect.any(String),
          votes: expect.any(Number),
          article_img_url: expect.any(String),
        });
      });
  });
  test("Returns a 400 error if an invalid ID parameter is used", () => {
    const article_id = "a";
    return request(app)
      .get(`/api/articles/${article_id}`)
      .expect(400)
      .then(({ body }) => {
        expect(body).toEqual({ msg: "Invalid article id" });
      });
  });
  test("Returns a 404 error when a valid ID is passed that does not correspond to a row in the DB", () => {
    const article_id = 9999;
    return request(app)
      .get(`/api/articles/${article_id}`)
      .expect(404)
      .then(({ body }) => {
        expect(body).toEqual({ msg: "No article with this ID" });
      });
  });
});

describe('GET /api/articles/:article_id/comments', () => {
  test('Returns comments with correct properties', () => {
    const article_id = 1;
    return request(app)
    .get(`/api/articles/${article_id}/comments`)
    .expect(200)
    .then(({ body }) => {
      body.comments.forEach((comment) => {
        expect(comment).toMatchObject({
          comment_id:expect.any(Number),
          votes: expect.any(Number),
          created_at: expect.any(String),
          author: expect.any(String),
          body: expect.any(String),
          article_id: expect.any(Number)
        })
      })
    })
  });
  test('Comments are sorted by newest to oldest', () => {
    const article_id = 1;
    return request(app)
    .get(`/api/articles/${article_id}/comments`)
    .then(({ body }) => {
      expect(body.comments).toBeSortedBy('created_at', {ascending:true})
    })
  })
  test('Returns 404 if ID is valid but not present in DB', () => {
    const article_id = 9999;
    return request(app)
    .get(`/api/articles/${article_id}/comments`)
    .expect(404)
    .then(({body}) => {
      expect(body).toEqual({msg:'ID not found'})
    })
  })
});

describe.only('POST /api/articles/:article_id/comments', () => {
  test('Returns 201 and the posted comment', () => {
    const article_id = 1;
    return request(app)
    .post(`/api/articles/${article_id}/comments`)
    .send({username: "lurker", body: "Hi, my name is Frank"})
    .expect(201)
    .then(({body}) => {
      expect(body.comment).toMatchObject({
        article_id: 1,
        author: "lurker",
        body: "Hi, my name is Frank",
        comment_id: expect.any(Number),
        created_at: expect.any(String),
        votes: expect.any(Number)
      })
    })
  });
});

//utility/helper functions

describe("commentCount", () => {
  test("Should return the correct number of comments for a passed article_id ", () => {
    return commentCount(1).then((count) => {
      expect(count).toBe(11);
    });
  });
});
