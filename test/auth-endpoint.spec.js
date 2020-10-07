const { assert, expect } = require("chai");
const knex = require("knex");
const app = require("../src/app.js");
const helpers = require("./test-helpers");

describe("Auth Endpoints", function () {
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

  describe(`POST /api/auth/loguin`, () => {
    beforeEach("insert users", () =>
      helpers.seedProjectTables(db, testUsers, testProjects)
    );

    it(`logs in a user`, function () {
      const testUser = testUsers[1];

      return supertest(app)
        .post(`/api/auth/login`)
        .set("Authorization", helpers.makeAuthHeader(testUser))
        .send(testUser)
        .expect(200)
        .expect((res) => {
            expect(res.body).to.have.property("authToken");
          })
    });
  });
});
