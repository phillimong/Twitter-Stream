require("dotenv").config(); // this is important!
module.exports = {
  "development": {
    "username": process.env.PGUSER,
    "password": process.env.PGPASSWORD,
    "database": process.env.PGDATABASE,
    "host": process.env.PGHOST,
    "dialect": 'postgres'
  },
  production: {
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_USERPASS,
    database: process.env.DATABASE_NAME,
    host: process.env.DATABASE_HOST,
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: false,
        rejectUnauthorized: false,
      },
    },
  },
};

// module.exports = {
//   development: {
//     username: process.env.PGUSER || process.env.DATABASE_USERNAME,
//     password: process.env.PGPASSWORD || process.env.DATABASE_USERPASS,
//     database: process.env.PGDATABASE || process.env.DATABASE_NAME,
//     host: process.env.PGHOST || process.env.DATABASE_HOST,
//     dialect: "postgres",
//   },
//   production: {
//     username: process.env.DATABASE_USERNAME,
//     password: process.env.DATABASE_USERPASS,
//     database: process.env.DATABASE_NAME,
//     host: process.env.DATABASE_HOST,
//     dialect: "postgres",
//     dialectOptions: {
//       ssl: {
//         require: false,
//         rejectUnauthorized: false,
//       },
//     },
//   },
// };
