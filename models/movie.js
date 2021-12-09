const connection = require('../db-config');
const Joi = require('joi');

const db = connection.promise();

const validate = (data, forCreation = true) => {
  const presence = forCreation ? 'required' : 'optional';
  console.log(data);
  return Joi.object({
    title: Joi.string().max(255).presence(presence),
    director: Joi.string().max(255).presence(presence),
    year: Joi.number().integer().min(1888).presence(presence),
    color: Joi.boolean().presence(presence),
    duration: Joi.number().integer().min(1).presence(presence),
    user_id: Joi.number().integer().min(1).presence(presence),
  }).validate(data, { abortEarly: false }).error;
};

const findMany = ({ filters: { color, max_duration } }) => {
  let sql = 'SELECT * FROM movies';
  const sqlValues = [];

  if (color) {
    sql += ' WHERE color = ?';
    sqlValues.push(color);
  }
  if (max_duration) {
    if (color) sql += ' AND duration <= ? ;';
    else sql += ' WHERE duration <= ?';

    sqlValues.push(max_duration);
  }
  console.log(sql);
  return db.query(sql, sqlValues).then(([results]) => results);
};

const findOne = (id) => {
  return db
    .query('SELECT * FROM movies WHERE id = ?', [id])
    .then(([results]) => results[0]);
};

const create = ({ title, director, year, color, duration, user_id }) => {
  console.log('starting create');
  return db
    .query(
      'INSERT INTO movies (title, director, year, color, duration, user_id) VALUES (?, ?, ?, ?, ?, ?)',
      [title, director, year, color, duration, user_id]
    )
    .then(([result]) => {
      console.log('in then');
      const id = result.insertId;
      return { id, title, director, year, color, duration, user_id };
    });
};

const update = (id, newAttributes) => {
  return db.query('UPDATE movies SET ? WHERE id = ?', [newAttributes, id]);
};

const destroy = (id) => {
  return db
    .query('DELETE FROM movies WHERE id = ?', [id])
    .then(([result]) => result.affectedRows !== 0);
};

module.exports = {
  findMany,
  findOne,
  validate,
  create,
  update,
  destroy,
};
