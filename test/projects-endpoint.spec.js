const { assert, expect } = require("chai");
const knex = require("knex");
const app = require("../src/app.js");
const helpers = require("./test-helpers");

describe("Project Endpoints", function () {
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

  describe(`GET /api/projects`, () => {
    context(`Given no articles`, () => {
      beforeEach(() => helpers.seedUsers(db, testUsers));

      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get("/api/projects")
          .set("authorization", helpers.makeAuthHeader(testUsers[1]))
          .expect(200, []);
      });
    });

    context("Given there are articles in the database", () => {
      beforeEach("insert projects", () =>
        helpers.seedProjectTables(db, testUsers, testProjects, testNotes)
      );

      it("responds with 200 and get all of the projects (admin)", () => {
        const expectedProjects = testProjects.map((project) =>
          helpers.makeExpectedProject(testUsers, project, testNotes)
        );
        return supertest(app)
          .get("/api/projects")
          .set("authorization", helpers.makeAuthHeader(testUsers[1]))
          .expect(200, expectedProjects);
      });

      it("responds with 200 and get all of the projects for user", () => {
        const expectedProjects = testProjects.map((project) =>
          helpers.makeExpectedProject(testUsers, project, testNotes)
        );
        return supertest(app)
          .get("/api/projects")
          .set("authorization", helpers.makeAuthHeader(testUsers[1]))
          .expect(200, expectedProjects);
      });
    });
  });

  describe(`POST /api/projects`, () => {
    beforeEach("insert projects", () =>
      helpers.seedProjectTables(db, testUsers, testProjects)
    );

    it(`creates an project, responding with 201 and the new project`, function () {
      this.retries(3);
      const testProject = testProjects[0];
      const testUser = testUsers[0];
      const newProject = {
        name: "A NEW THING",
        status: "INITAL",
        deliverables: "Shopify",
        admin_approval: true,
        client_approval: false,
        end_timeframe: '2020-12-29T17:42:17.000Z',
        type: "Portfolio",
        price: 123704,
        date_created: "2020-04-29T17:42:17.000Z",
        proposal: "",
        user_id: testUser.id,
      };
      return supertest(app)
        .post("/api/projects")
        .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
        .send(newProject)
        .expect(201)
        .expect((res) => {
          expect(res.body).to.have.property("id");
          expect(res.body.name).to.eql(newProject.name);
          expect(res.body.status).to.eql(newProject.status);
          expect(res.body.deliverables).to.eql(newProject.deliverables);
          expect(res.body.admin_approval).to.eql(newProject.admin_approval);
          expect(res.body.client_approval).to.eql(newProject.client_approval);
          expect(res.body.type).to.eql(newProject.type);
          expect(res.body.price).to.eql(newProject.price);
          expect(res.body.proposal).to.eql(newProject.proposal);
          expect(res.body.user_id).to.eql(testUser.id);
          assert(
            new Date(res.body.end_timeframe).getTime(),
            new Date(newProject.end_timeframe)
          );
          expect(res.headers.location).to.eql(`/api/projects/${res.body.id}`);
          assert(
            new Date(res.body.date_created).getTime(),
            new Date(newProject.date_created)
          );
        });
    });
  });

  describe(`GET /api/projects/:project_id`, () => {
    context(`Given no projects`, () => {
      beforeEach(() => helpers.seedUsers(db, testUsers));

      it(`responds with 404`, () => {
        const projectId = 123456;
        return supertest(app)
          .get(`/api/projects/${projectId}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .expect(404, { error: `Project doesn't exist` });
      });
    });

    context("Given there are projects in the database", () => {
      beforeEach("insert projects", () =>
        helpers.seedProjectTables(db, testUsers, testProjects, testNotes)
      );

      it("responds with 200 and the specified project (admin)", () => {
        const projectId = 1;
        const expectedProject = helpers.makeExpectedProject(
          testUsers,
          testProjects[projectId - 1],
          testNotes
        );

        return supertest(app)
          .get(`/api/projects/${testProjects[projectId - 1].id}`)
          .set("authorization", helpers.makeAuthHeader(testUsers[1]))
          .expect(200, expectedProject);
      });

      it("responds with 200 and the specified project (client)", () => {
        const projectId = 1;
        const expectedProject = helpers.makeExpectedProject(
          testUsers,
          testProjects[projectId - 1],
          testNotes
        );

        return supertest(app)
          .get(`/api/projects/${testProjects[projectId - 1].id}`)
          .set("authorization", helpers.makeAuthHeader(testUsers[0]))
          .expect(200, expectedProject);
      });
    });
  });

  describe(`PATCH /api/projects/:project_id`, () => {
    const testProject = testProjects[0];
    const testUser = testUsers[0];
    const updatedProject = {
      status: "INITIAL",
      end_timeframe: "2020-04-24T20:12:43.000Z",
    };

    context(`Given no projects`, () => {
      beforeEach(() => helpers.seedUsers(db, testUsers));

      it(`responds with 404`, () => {
        const projectId = 123456;
        return supertest(app)
          .patch(`/api/projects/${projectId}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .send(updatedProject)
          .expect(404, { error: `Project doesn't exist` });
      });
    });

    context("Given there are projects in the database", () => {
      beforeEach("insert projects", () =>
        helpers.seedProjectTables(db, testUsers, testProjects, testNotes)
      );

      it("responds with 200 and the specified project (admin)", () => {
        const projectId = 1;
        const expectedProject = helpers.makeExpectedProject(
          testUsers,
          testProjects[projectId - 1],
          testNotes
        );

        expectedProject.status = updatedProject.status;
        expectedProject.end_timeframe = updatedProject.end_timeframe;

        return supertest(app)
          .patch(`/api/projects/${testProjects[projectId - 1].id}`)
          .set("authorization", helpers.makeAuthHeader(testUsers[1]))
          .send(updatedProject)
          .expect(200, expectedProject);
      });

      it("responds with 200 and the specified project (client)", () => {
        const projectId = 1;
        const expectedProject = helpers.makeExpectedProject(
          testUsers,
          testProjects[projectId - 1],
          testNotes
        );

        expectedProject.status = updatedProject.status;
        expectedProject.end_timeframe = updatedProject.end_timeframe;

        return supertest(app)
          .patch(`/api/projects/${testProjects[projectId - 1].id}`)
          .set("authorization", helpers.makeAuthHeader(testUsers[1]))
          .send(updatedProject)
          .expect(200, expectedProject);
      });
    });
  });

  describe(`GET /api/projects/:project_id/notes`, () => {
    const testProject = testProjects[0];
    const testUser = testUsers[0];

    context(`Given no notes`, () => {
      beforeEach(() => helpers.seedUsers(db, testUsers));

      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get("/api/projects")
          .set("authorization", helpers.makeAuthHeader(testUsers[1]))
          .expect(200, []);
      });
    });

    context("Given there are projects in the database", () => {
      beforeEach("insert projects", () =>
        helpers.seedProjectTables(db, testUsers, testProjects, testNotes)
      );

      it("responds with 202 and the specified project (admin)", () => {
        const projectId = "0c1a5fb9-cf98-4beb-acdc-04d4fbc385b3";
        const expectedNotes = helpers.makeExpectedNotes(
          testUsers,
          projectId,
          testNotes
        );

        return supertest(app)
          .get(`/api/projects/${projectId}/notes`)
          .set("authorization", helpers.makeAuthHeader(testUsers[1]))
          .expect(200, expectedNotes);
      });
    });
  });
});
