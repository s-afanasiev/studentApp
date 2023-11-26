'use strict';
const tname = 'grades';
const Model = require("./../models")[tname];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable(tname, Model.getAttributes())}
  ,
  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable(tname);
  }
};
