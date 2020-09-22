const xss = require("xss");

const ProjectsService = {
  getAllProjects(db) {
    return db.from("projects")
      .select("*");
  },
  getProjectsForUser(db, user_id) {
    return db.
    from("projects")
      .select("*")
      .where("projects.user_id", user_id)
  },
  getById(db, id) {
    return ProjectsService.getAllProjects(db)
      .where("projects.id", id)
      .first()
  },
  insertProject(db, newProject) {
    return db
      .insert(newProject)
      .into('projects')
      .returning('*')
      .then(rows => {
        return rows[0]
      })
  },
  getProjectsForUser(db, user) {
    return ProjectsService.getAllProjects(db)
      .where("projects.user_id", user);
  },
  updateProject(db, id, newNoteFields) {
    return db.from('projects')
      .where({ id })
      .update(newNoteFields)
      .returning('*')
      .then(rows => {
        return rows[0]
      })
  },
};

module.exports = ProjectsService;
