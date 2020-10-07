const { assert, expect } = require("chai");
const knex = require("knex");
const app = require("../src/app.js");
const helpers = require("./test-helpers");

describe("Notes Endpoints", function () {
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

  describe(`POST /api/project_id/notes`, () => {
    beforeEach("insert projects", () =>
      helpers.seedProjectTables(db, testUsers, testProjects)
    );
    it(`creates an note, responding with 201 and the new note`, function () {
      this.retries(3);
      const testProject = testProjects[0];
      const testUser = testUsers[1];
      const newNote = {
        content:
          "Maecenas ut massa quis augue luctus tincidunt. Nulla mollis molestie lorem. Quisque ut erat.\n\nCurabitur gravida nisi at nibh. In hac habitasse platea dictumst. Aliquam augue quam, sollicitudin vitae, consectetuer eget, rutrum at, lorem.",
        type: "notes",
        date_created: "2019-12-04T19:46:15.000Z",
        created_by: testUser.type,
        project_id: testProject.id,
      };

      return supertest(app)
        .post(`/api/projects/${testProject.id}/notes`)
        .set("Authorization", helpers.makeAuthHeader(testUser))
        .send(newNote)
        .expect(201)
        .expect((res) => {
          expect(res.body).to.have.property("id");
          expect(res.body.content).to.eql(newNote.content);
          expect(res.body.type).to.eql(newNote.type);
          assert(
            new Date(res.body.date_created).getTime(),
            new Date(newNote.date_created)
          );
          expect((res.body.created_by)).to.eql(newNote.created_by);
          expect(res.body.project_id).to.eql(newNote.project_id);
        })
        .expect((res) =>
          db
            .from("notes")
            .select("*")
            .where({ id: res.body.id })
            .first()
            .then((row) => {
              expect(row.content).to.eql(newNote.content);
              expect(row.type).to.eql(newNote.type);
              expect((row.created_by)).to.eql(newNote.created_by);
              expect(row.project_id).to.eql(newNote.project_id);
              assert(
                new Date(row.date_created).getTime(),
                new Date(newNote.date_created)
              );
            })
        );
    });
  });

  describe(`DELETE /api/project_id/notes/note_id`, () => {
    beforeEach("insert projects", () =>
      helpers.seedProjectTables(db, testUsers, testProjects, testNotes)
    );

    it(`delete an note, responding with 204`,  async function (done) {
      const testProject = testProjects[0];
      const testUser = testUsers[1];
      const testNote = testNotes[0];

      return supertest(app)
        .delete(`/api/projects/${testProject.id}/notes`)
        .set("Authorization", helpers.makeAuthHeader(testUser))
        .send({note_id: testNote.id})
        .expect(204, done());
    });
  });
});
