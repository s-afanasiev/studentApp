'use strict';
const tname = 'grade_statistic';
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