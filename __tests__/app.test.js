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

describe("GET /api/users", () => {
  test("Return an array of users", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({body}) => {
      expect(body.users.length).toBeGreaterThanOrEqual(1)
      body.users.forEach((user) => {
        expect(user).toMatchObject({
          username:expect.any(String),
          name:expect.any(String),
          avatar_url:expect.any(String),
        })
      })
      })
  });
  test("Returns 404 on mistyped endpoint", () => {
    return request(app)
    .get("/api/user")
    .expect(404)
    .then(({body}) => {
      expect(body).toEqual({message:'Not Found'})
    })
  })
});

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

describe("/api/articles", () => {
  test("Returns all articles with comment count property", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles.length).toBeGreaterThanOrEqual(1);
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
  test("Returns articles ordered by date created in descending order", () => {
    return request(app)
      .get("/api/articles")
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy("created_at", { descending: true });
      });
  });
});

describe.only('/api/articles?topics', () => {
  test("Returns list of articles with correct topic property", () => {
    const topic = 'mitch'
    return request(app)
      .get(`/api/articles?topic=${topic}`)
      .expect(200)
      .then(({body}) => {
        body.articles.forEach((article) => {
          expect(article).toMatchObject({
            article_id: expect.any(Number),
            title: expect.any(String),
            topic: 'mitch',
            author: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
          })
        })
      })
  })
  test("Returns 404 when querying a valid topic with no entries", ()=> {
    const topic = 'paper'
    return request(app)
      .get(`/api/articles?topic=${topic}`)
      .expect(404)
      .then(({body}) => {
        expect(body).toEqual({msg: 'No articles found'})
      })
  })
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
        expect(body).toEqual({ msg: "Bad Request" });
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

describe("GET /api/articles/:article_id/comments", () => {
  test("Returns comments with correct properties", () => {
    const article_id = 1;
    return request(app)
      .get(`/api/articles/${article_id}/comments`)
      .expect(200)
      .then(({ body }) => {
        body.comments.forEach((comment) => {
          expect(comment).toMatchObject({
            comment_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            article_id: article_id,
          });
        });
      });
  });
  test("Comments are sorted by newest to oldest", () => {
    const article_id = 1;
    return request(app)
      .get(`/api/articles/${article_id}/comments`)
      .then(({ body }) => {
        expect(body.comments).toBeSortedBy("created_at", { ascending: true });
      });
  });
  test("Returns 200 and empty for article with no comments", () => {
    const article_id = 2;
    return request(app)
      .get(`/api/articles/${article_id}/comments`)
      .expect(200)
      .then(({ body }) => {
        expect(body.comments).toEqual([]);
      });
  });
  test("Returns 404 if ID is valid but not present in DB", () => {
    const article_id = 9999;
    return request(app)
      .get(`/api/articles/${article_id}/comments`)
      .expect(404)
      .then(({ body }) => {
        expect(body).toEqual({ msg: "ID not found" });
      });
  });
  test("Returns 400 if ID is invalid", () => {
    const article_id = "a";
    return request(app)
      .get(`/api/articles/${article_id}/comments`)
      .expect(400)
      .then(({ body }) => {
        expect(body).toEqual({ msg: "Bad Request" });
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  test("Returns 201 and the posted comment", () => {
    const article_id = 1;
    return request(app)
      .post(`/api/articles/${article_id}/comments`)
      .send({ username: "lurker", body: "Hi, my name is Frank" })
      .expect(201)
      .then(({ body }) => {
        expect(body.comment).toMatchObject({
          article_id: 1,
          author: "lurker",
          body: "Hi, my name is Frank",
          comment_id: expect.any(Number),
          created_at: expect.any(String),
          votes: 0,
        });
      });
  });

  test("Returns 201 when passed additional unnecessary request properties", () => {
    const article_id = 1;
    return request(app)
      .post(`/api/articles/${article_id}/comments`)
      .send({
        username: "lurker",
        body: "Hi, my name is Frank",
        legs: 8,
        spinsWebs: true,
      })
      .expect(201)
      .then(({ body }) => {
        expect(body.comment).toMatchObject({
          article_id: 1,
          author: "lurker",
          body: "Hi, my name is Frank",
          comment_id: expect.any(Number),
          created_at: expect.any(String),
          votes: 0,
        });
      });
  });

  test("Returns 400 for missing username or body", () => {
    const article_id = 1;
    return request(app)
      .post(`/api/articles/${article_id}/comments`)
      .send({})
      .expect(400)
      .then(({ body }) => {
        expect(body).toEqual({
          msg: "Missing required property for db update",
        });
      });
  });
  test("Returns 400 on incorrect username", () => {
    const article_id = 1;
    return request(app)
      .post(`/api/articles/${article_id}/comments`)
      .send({ username: "fr4nk", body: "Hi, my name is Frank" })
      .expect(400)
      .then(({ body }) => {
        expect(body).toEqual({ msg: "Request body conflicts with db" });
      });
  });
  test("Returns 404 if ID is valid but not present in DB", () => {
    const article_id = 9999;
    return request(app)
      .post(`/api/articles/${article_id}/comments`)
      .send({ username: "fr4nk", body: "Hi, my name is Frank" })
      .expect(404)
      .then(({ body }) => {
        expect(body).toEqual({ msg: "ID not found" });
      });
  });
  test("Returns 400 on invalid ID", () => {
    const article_id = "a";
    return request(app)
      .post(`/api/articles/${article_id}/comments`)
      .send({ username: "fr4nk", body: "Hi, my name is Frank" })
      .expect(400)
      .then(({ body }) => {
        expect(body).toEqual({ msg: "Bad Request" });
      });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test("Returns 201 and article with correct updated vote count", () => {
    const article_id = 1;
    return request(app)
      .patch(`/api/articles/${article_id}`)
      .send({ inc_votes: 10 })
      .expect(201)
      .then(({ body }) => {
        expect(body.article).toMatchObject({
          article_id: article_id,
          title: expect.any(String),
          topic: expect.any(String),
          author: expect.any(String),
          body: expect.any(String),
          created_at: expect.any(String),
          votes: 110,
          article_img_url: expect.any(String),
        });
      });
  });

  test("Ignores unnecessary properties in request body", () => {
    const article_id = 1;
    return request(app)
      .patch(`/api/articles/${article_id}`)
      .send({ inc_votes: 10, hasWings: true, legs: 6 })
      .expect(201)
      .then(({ body }) => {
        expect(body.article).toMatchObject({
          article_id: article_id,
          title: expect.any(String),
          topic: expect.any(String),
          author: expect.any(String),
          body: expect.any(String),
          created_at: expect.any(String),
          votes: 110,
          article_img_url: expect.any(String),
        });
      });
  });

  test('err for wrong inc_votes type', () => {
    const article_id = 1;
    return request(app)
      .patch(`/api/articles/${article_id}`)
      .send({ inc_votes: 'aphid' })
      .expect(400)
      .expect(({body}) => {
        expect(body).toEqual({msg: 'Bad Request'})
      })
  })

  test("Has correct vote count with negative vote numbers", () => {
    const article_id = 1;
    return request(app)
      .patch(`/api/articles/${article_id}`)
      .send({ inc_votes: -10 })
      .expect(201)
      .then(({ body }) => {
        expect(body.article).toMatchObject({
          article_id: article_id,
          title: expect.any(String),
          topic: expect.any(String),
          author: expect.any(String),
          body: expect.any(String),
          created_at: expect.any(String),
          votes: 90,
          article_img_url: expect.any(String),
        });
      });
  });

  test("Returns 404 if ID is valid but not present in DB", () => {
    const article_id = 9999;
    return request(app)
      .patch(`/api/articles/${article_id}`)
      .send({ inc_votes: 1 })
      .expect(404)
      .then(({ body }) => {
        expect(body).toEqual({ msg: "ID not found" });
      });
  });

  test("Returns 400 for missing vote property in request body", () => {
    const article_id = 1;
    return request(app)
      .patch(`/api/articles/${article_id}`)
      .send({})
      .expect(400)
      .then(({ body }) => {
        expect(body).toEqual({ msg: "Bad Request" });
      });
  });

  test("Returns 400 for invalid id", () => {
    const article_id = "a";
    return request(app)
      .patch(`/api/articles/${article_id}`)
      .send({ inc_votes: 1 })
      .expect(400)
      .then(({ body }) => {
        expect(body).toEqual({ msg: "Bad Request" });
      });
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  test("Returns 204 and empty object", () => {
    const comment_id = 1;
    return request(app)
      .delete(`/api/comments/${comment_id}`)
      .expect(204)
      .then(({ body }) => {
        expect(body).toEqual({});
      });
  });
  test("Returns 404 if ID is valid but not present in DB", () => {
    const comment_id = 9999;
    return request(app)
      .delete(`/api/comments/${comment_id}`)
      .expect(404)
      .then(({ body }) => {
        expect(body).toEqual({ msg: "ID not found" });
      });
  });
  test("Returns 400 if ID is invalid", () => {
    const comment_id = "a";
    return request(app)
      .delete(`/api/comments/${comment_id}`)
      .expect(400)
      .then(({ body }) => {
        expect(body).toEqual({ msg: "Bad Request" });
      });
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
