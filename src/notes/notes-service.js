const xss = require("xss");

const NotesService = {
  getAllNotes(db) {
    return db.from("notes").select("*");
  },
  getById(db, id) {
    return NotesService.getAllNotes(db)
    .where("notes.id", id)
    .first()
  },
  insertNote(db, note) {
      return db
      .insert(note)
      .into('notes')
      .returning('*')
      .then(([upnote]) => upnote)
  },
  getNotesForProject(db, id) {
    return NotesService.getAllNotes(db)
    .where("notes.project_id", id);
  },
  deleteNote(db, id) {
    return db.from('notes')
      .where({ id })
      .delete()
  },
};

module.exports = NotesService;
