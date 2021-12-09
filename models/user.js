const connection = require('../db-config');
const Joi = require('joi');

const argon2 = require('argon2');
const { calculateToken } = require('../helpers/users');

const hashingOptions = {
  type: argon2.argon2id,
  memoryCost: 2 ** 16,
  timeCost: 5,
  parallelism: 1
};

const hashPassword = (plainPassword) => {
  return argon2.hash(plainPassword, hashingOptions);
};

const verifyPassword = (plainPassword, hashedPassword) => {
  return argon2.verify(hashedPassword, plainPassword, hashingOptions);
};

const db = connection.promise();

const validate = (data, forCreation = true) => {
  const presence = forCreation ? 'required' : 'optional';
  return Joi.object({
    email: Joi.string().email().max(255).presence(presence),
    firstname: Joi.string().max(255).presence(presence),
    lastname: Joi.string().max(255).presence(presence),
    city: Joi.string().allow(null, '').max(255),
    language: Joi.string().allow(null, '').max(255),
    password: Joi.string().min(8),
  }).validate(data, { abortEarly: false }).error;
};

const findMany = ({ filters: { language } }) => {
  let sql = 'SELECT id, firstname, lastname, city, language FROM users';
  const sqlValues = [];
  if (language) {
    sql += ' WHERE language = ?';
    sqlValues.push(language);
  }

  return db.query(sql, sqlValues).then(([results]) => results);
};

const findOne = (id) => {
  return db
    .query('SELECT id, firstname, lastname, city, language  FROM users WHERE id = ?', [id])
    .then(([results]) => results[0]);
};

const findByEmail = (email) => {
  return db
    .query('SELECT email, hashedPassword FROM users WHERE email = ?', [email])
    .then(([results]) => results[0]);
};

const findEmailById = (id) => {
  return db
    .query('SELECT email FROM users WHERE id = ?', [id])
    .then(([results]) => results[0]);
};

const findByEmailWithDifferentId = (email, id) => {
  return db
    .query('SELECT * FROM users WHERE email = ? AND id <> ?', [email, id])
    .then(([results]) => results[0]);
};

const create = async (data) => {
  const hashedPassword = await hashPassword(data.password);
  const token = await calculateToken(data.email);
  
  const newUser = {
    firstname: data.firstname,
    lastname: data.lastname,
    email: data.email,
    city: data.city,
    language: data.language,
    hashedPassword: hashedPassword,
    token: token,
  };
  console.log(data.password + ' - ' + hashPassword(data.password));
  return db.query('INSERT INTO users SET ?', newUser).then(([result]) => {
    const id = result.insertId;
    return { ...newUser, id };
  });
};

const update = async (id, newAttributes) => {
  const email = await findEmailById(id);
  const token = await calculateToken(email);
  newAttributes = {...newAttributes, token};
  console.log(newAttributes);
  return db.query('UPDATE users SET ? WHERE id = ?', [newAttributes, id]);
};

const destroy = (id) => {
  return db
    .query('DELETE FROM users WHERE id = ?', [id])
    .then(([result]) => result.affectedRows !== 0);
};

module.exports = {
  findMany,
  findOne,
  validate,
  create,
  update,
  destroy,
  findByEmail,
  findByEmailWithDifferentId,
  hashPassword,
  verifyPassword,
};
