const { assert, expect } = require("chai");
const knex = require("knex");
const app = require("../src/app.js");
const helpers = require("./test-helpers");

describe("Users Endpoints", function () {
  let db;

  const { testUsers, testProjects, testNotes } = helpers.makeProjectFixtures();

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set("db", db);
  });

  after("disconnect from db", () => db.destroy());

  before("cleanup", () => helpers.cleanTables(db));

  afterEach("cleanup", () => helpers.cleanTables(db));

  describe(`POST /api/users`, () => {
    it(`registers a user `, function () {
      const testUser = {
        user_name: "admin",
        password: "passwOrd1@",
        full_name: "I'm Admin",
        email: "admin@gmail.com",
        type: "admin",
      };

      return supertest(app)
        .post(`/api/users`)
        .set("Authorization", helpers.makeAuthHeader(testUser))
        .send(testUser)
        .expect(201)
        .expect((res) => {
            expect(res.body).to.have.property("id");
            expect(res.body).to.have.property("date_created");
            expect(res.body.email).to.eql(testUser.email);
            expect(res.body.type).to.eql(testUser.type);
            expect(res.body.full_name).to.eql(testUser.full_name);
            expect(res.body.user_name).to.eql(testUser.user_name);
          })
    });
  });
});
