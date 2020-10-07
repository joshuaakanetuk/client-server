const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

function makeUsersArray() {
  return [
    {
      id: 1,
      user_name: "client",
      full_name: "Test Client",
      email: "client@client.com",
      password: "password",
      date_created: "2029-01-22T16:28:32.615Z",
      type: "client",
    },
    {
      id: 2,
      user_name: "admin",
      full_name: "Test Admin",
      password: "password",
      email: "admin@admin.com",
      date_created: "2029-01-22T16:28:32.615Z",
      type: "admin",
    },
  ];
}

function makeProjectArray(users) {
  return [
    {
      id: "fa51edde-afd2-420b-b5e0-6e19d372571c",
      name: "Transcof",
      status: "FINISHED",
      deliverables: "Shopify",
      admin_approval: true,
      client_approval: false,
      end_timeframe: "2020-05-10T16:47:24.000Z",
      type: "Portfolio",
      price: 3604.57,
      date_modified: null,
      proposal: null,
      date_created: "2020-03-06T07:11:42.000Z",
      user_id: users[0].id,
    },
    {
      id: "c482f778-5115-49c9-87ad-74d197867fc1",
      name: "Aerified",
      status: "ARCHIVED",
      deliverables: "Shopify",
      admin_approval: true,
      client_approval: false,
      end_timeframe: "2020-04-24T20:12:43.000Z",
      type: "Portfolio",
      price: 1704.02,
      date_created: "2020-04-29T17:42:17.000Z",
      date_modified: null,
      proposal: null,
      user_id: users[1].id,
    },
    {
      id: "3613b2dc-2d36-4305-8431-e6d3df28700b",
      name: "Span",
      status: "DESIGN",
      deliverables: "Shopify",
      admin_approval: false,
      client_approval: false,
      end_timeframe: "2020-06-27T10:46:20.000Z",
      type: "Portfolio",
      price: 2348.36,
      date_created: "2020-06-03T13:52:47.000Z",
      date_modified: null,
      proposal: null,
      user_id: users[0].id,
    },
    {
      id: "0c1a5fb9-cf98-4beb-acdc-04d4fbc385b3",
      name: "Sonair",
      status: "DESIGN",
      deliverables: "Shopify",
      admin_approval: false,
      client_approval: true,
      end_timeframe: "2020-02-10T08:37:51.000Z",
      type: "Single Product Store",
      price: 3185.99,
      date_created: "2020-08-27T01:08:04.000Z",
      date_modified: null,
      proposal: null,
      user_id: users[0].id,
    },
  ];
}

function makeNotesArray(users, projects) {
  return [
    {
      id: 1,
      content:
        "Maecenas ut massa quis augue luctus tincidunt. Nulla mollis molestie lorem. Quisque ut erat.\n\nCurabitur gravida nisi at nibh. In hac habitasse platea dictumst. Aliquam augue quam, sollicitudin vitae, consectetuer eget, rutrum at, lorem.",
      type: "notes",
      date_created: "2019-12-04T19:46:15.000Z",
      created_by: users[1].type,
      project_id: projects[0].id,
    },
    {
      id: 2,
      content:
        "Integer tincidunt ante vel ipsum. Praesent blandit lacinia erat. Vestibulum sed magna at nunc commodo placerat.",
      type: "changelog",
      date_created: "2020-05-22T21:44:30.000Z",
      created_by: users[0].type,
      project_id: projects[1].id,
    },
    {
      id: 3,
      content:
        "Maecenas tristique, est et tempus semper, est quam pharetra magna, ac consequat metus sapien ut nunc. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Mauris viverra diam vitae quam. Suspendisse potenti.\n\nNullam porttitor lacus at turpis. Donec posuere metus vitae ipsum. Aliquam non mauris.",
      type: "notes",
      date_created: "2020-07-25T15:25:19.000Z",
      created_by: users[0].type,
      project_id: projects[1].id,
    },
  ];
}

function makeExpectedProject(users, project, notes = []) {
  const user = users.find((user) => user.id === project.user_id);
  //   const num_of_notes = notes.filter((note) => note.project_id === project.id);
  if (user.type === "client" && project.user_id === user.id) {
    return {
      id: project.id,
      name: project.name,
      status: project.status,
      deliverables: project.deliverables,
      admin_approval: project.admin_approval,
      client_approval: project.client_approval,
      end_timeframe: project.end_timeframe,
      type: project.type,
      price: project.price,
      proposal: project.proposal,
      date_created: project.date_created,
      date_modified: project.date_modified,
      user_id: user.id,
    };
  } else {
    return {
      id: project.id,
      name: project.name,
      status: project.status,
      deliverables: project.deliverables,
      admin_approval: project.admin_approval,
      client_approval: project.client_approval,
      end_timeframe: project.end_timeframe,
      type: project.type,
      price: project.price,
      proposal: project.proposal,
      date_created: project.date_created,
      date_modified: project.date_modified,
      user_id: user.id,
    };
  }
}

function makeExpectedNotes(users, project_id, notes) {
  const expectedNotes = notes.filter((note) => note.project_id === project_id);
  return expectedNotes.map((note) => {
    const noteUser = users.find((user) => user.id === note.created_by);
    return {
      id: note.id,
      content: note.content,
      type: note.type,
      date_created: note.date_created,
      created_by: noteUser.id,
      project_id: project_id,
    };
  });
}

function makeProjectFixtures() {
  const testUsers = makeUsersArray();
  const testProjects = makeProjectArray(testUsers);
  const testNotes = makeNotesArray(testUsers, testProjects);
  return { testUsers, testProjects, testNotes };
}

function cleanTables(db) {
  return db.raw(
    `TRUNCATE
        projects,
        users,
        notes`
  );
}

function seedUsers(db, users) {
  const preppedUsers = users.map((user) => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1),
  }));
  return db
    .into("users")
    .insert(preppedUsers)
    .then(() =>
      // update the auto sequence to stay in sync
      db.raw(`SELECT setval('users_id_seq', ?)`, [users[users.length - 1].id])
    );
}

function seedProjectTables(db, users, projects, notes = []) {
  // use a transaction to group the queries and auto rollback on any failure
  return db.transaction(async (trx) => {
    await seedUsers(trx, users);
    await trx.into("projects").insert(projects);
    // only insert comments if there are some, also update the sequence counter
    if (notes.length) {
      await trx.into("notes").insert(notes);
      await trx.raw(`SELECT setval('notes_id_seq', ?)`, [
        notes[notes.length - 1].id,
      ]);
    }
  });
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.user_name,
    algorithm: "HS256",
  });
  return `Bearer ${token}`;
}

//   function seedMaliciousThing(db , user, project) {
//     return db
//       .into('users')
//       .insert([user])
//       .then(() =>
//         db
//           .into('projects')
//           .insert([project])
//       )
//   }

module.exports = {
  makeUsersArray,
  makeProjectArray,
  makeExpectedProject,
  makeExpectedNotes,
  makeNotesArray,
  makeProjectFixtures,
  cleanTables,
  seedProjectTables,
  seedUsers,
  makeAuthHeader,
};
