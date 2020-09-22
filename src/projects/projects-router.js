const express = require("express");
const ProjectsService = require("./projects-service");
const NotesService = require("../notes/notes-service.js");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const projectsRouter = express.Router();
const jsonParser = express.json();
const { requireAuth } = require("../middleware/jwt-auth");

projectsRouter
  .route("/")
  .all(requireAuth)
  .get((req, res, next) => {
    if (req.user.type === "client")
      ProjectsService.getProjectsForUser(req.app.get("db"), req.user.id)
        .then((projects) => {
          res.json(projects);
        })
        .catch(next);
    else
      ProjectsService.getAllProjects(req.app.get("db"))
        .then((projects) => {
          res.json(projects);
        })
        .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const {
      name,
      status,
      admin_approval,
      client_approval,
      end_timeframe,
      type,
      price,
      date_created,
      date_modified,
      deliverables,
    } = req.body;
    const newProject = {
      id: uuidv4(),
      name,
      status,
      admin_approval,
      client_approval: false,
      end_timeframe,
      type,
      price,
      date_created,
      date_modified,
      deliverables,
      proposal: "",
      user_id: req.user.id,
    };

    for (const [key, value] of Object.entries(newProject)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` },
        });
      }
    }

    ProjectsService.insertProject(req.app.get("db"), newProject)
      .then((project) => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${project.id}`))
          .json(project);
      })
      .catch(next);
  });

projectsRouter
  .route("/:project_id")
  .all(requireAuth)
  .all(checkProjectExists)
  .get((req, res, next) => {
    if (req.user.type !== "admin" && req.user.id !== req.project.user_id)
      return res.status(400).json({
        error: { message: `You dont have access to this project.` },
      });
    res.json(req.project);
  })
  .patch(jsonParser, (req, res, next) => {
    let project = req.project;
    const {
      id,
      name,
      status,
      admin_approval,
      client_approval,
      start_timeframe,
      end_timeframe,
      type,
      price,
      proposal,
      date_created,
      date_modified,
      approval,
    } = req.body;
    let newProject = {};
    const keys = {
      id,
      name,
      status,
      admin_approval,
      client_approval,
      start_timeframe,
      end_timeframe,
      type,
      price,
      proposal,
      date_created,
      date_modified,
      approval,
    };

    const numberOfValues = Object.values(keys).filter(Boolean).length;
    if (numberOfValues === 0) {
      return res.status(400).json({
        error: {
          message: `Request body must contain one of the following: ${Object.keys(
            keys
          ).join(", ")}`,
        },
      });
    }

    newProject = keys;

    if (typeof approval != "undefined") {
      project[req.user.type + "_approval"] = approval;
    }
    if (project.status === "INITIAL" || project.status === "DESIGN") {
      if (!approval) {
        newProject.status = "ARCHIVED";
        newProject.client_approval = false;
        newProject.admin_approval = false;
      } else {
        if (project.client_approval && project.admin_approval) {
          if (project.status === "INITIAL") {
            newProject.status = "DESIGN";
          } else if (project.status === "DESIGN") {
            newProject.status = "PROGRESS";
          }
          newProject.client_approval = null;
          newProject.admin_approval = null;
        }
      }
    } else {
      if (project.status === "PROGRESS" && project.admin_approval) {
        newProject.status = "FINISHED";
      }
    }

    // removes superfluous keys
    Object.keys(newProject).forEach((key) =>
      newProject[key] === undefined ? delete newProject[key] : {}
    );

    ProjectsService.updateProject(
      req.app.get("db"),
      req.params.project_id,
      newProject
    )
      .then((project) => {
        res.status(202).json(project);
      })
      .catch(next);
  });

projectsRouter
  .route("/:project_id/notes")
  .all(requireAuth)
  .all(checkProjectExists)
  .get((req, res, next) => {
    NotesService.getNotesForProject(req.app.get("db"), req.params.project_id)
      .then((notes) => {
        res.json(notes);
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    NotesService.insertNote(req.app.get("db"), req.body)
      .then((notes) => {
        res.status(201).json(notes);
      })
      .catch(next);
  })
  .delete(jsonParser, (req, res, next) => {
    NotesService.deleteNote(req.app.get("db"), req.body.note_id)
      .then((notes) => {
        res.status(204).send;
      })
      .catch(next);
  });

/* async/await syntax for promises */
async function checkProjectExists(req, res, next) {
  try {
    const project = await ProjectsService.getById(
      req.app.get("db"),
      req.params.project_id
    );

    if (!project)
      return res.status(404).json({
        error: `Project doesn't exist`,
      });
    req.project = project;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = projectsRouter;
