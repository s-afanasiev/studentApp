'use strict';

/** @type {import('sequelize-cli').Migration} */
const tname = 'subjects';
//const Model = require("./../models")[tname];
const Model = require("./../models/Subject.js");
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable(tname, Model)}
  ,
  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable(tname);
  }
};
