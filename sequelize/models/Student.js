// const Sequelize = require("sequelize");
// const db = require("./../../db");
module.exports = (sequelize, DataTypes)=> { 
	return sequelize.define('students', {
		personalCode: {
			primaryKey: true,
			type: DataTypes.STRING(100),
			allowNull: false
		},
		name: {
			type: DataTypes.STRING(100),
			allowNull: false
		},
		lastName: {
			type: DataTypes.STRING(100),
		}
	},
	{
		timestamps: false
	});
}