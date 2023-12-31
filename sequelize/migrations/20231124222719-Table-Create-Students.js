'use strict';
/** @type {import('sequelize-cli').Migration} */
const tname = 'students';
const Model = require("./../models")[tname];
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable(tname, Model.getAttributes())
  }
  ,
  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable(tname);
  }
};
