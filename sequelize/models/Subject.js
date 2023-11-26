const Sequelize = require("sequelize");
//const db = require("./../../db");
//module.exports = db.sequelize.define('subjects', {
module.exports = (sequelize, DataTypes)=> {
	return sequelize.define('subjects', {
		name: {
			primaryKey: true,
			type: DataTypes.STRING(80),
			allowNull: false
		}
	},
	{
		timestamps: false
	})
};