const express = require("express");
const NotesService = require("./notes-service");
const { requireAuth } = require('../middleware/jwt-auth')

const notesRouter = express.Router();

notesRouter.route("/").get(requireAuth, (req, res, next) => {
  NotesService.getAllNotes(req.app.get("db"))
    .then((notes) => {
      res.json(notes);
    })
    .catch(next);
});

notesRouter
  .route("/:note_id")
  .all(requireAuth)
  .all(checkNotesExists)
  .delete((req, res, next) => {
    NotesService.deleteNote(req.app.get("db"), req.params.note_id)
      .then((notes) => {
        res.status(204).send();
      })
      .catch(next);
  });

/* async/await syntax for promises */
async function checkNotesExists(req, res, next) {
  try {
    const note = await NotesService.getById(
      req.app.get("db"),
      req.params.note_id
    );

    if (!note)
      return res.status(404).json({
        error: `Note doesn't exist`,
      });
    res.note = note;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = notesRouter;
