'use strict';

const tname = 'subjects';
const Model = require("./../models")[tname];
//const Model = require("./../models/Subject.js");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable(tname, Model.getAttributes())}
  ,
  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable(tname);
  }
};
