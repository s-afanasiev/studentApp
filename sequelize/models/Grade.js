module.exports = (sequelize, DataTypes)=> { 
	return sequelize.define('grades', {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
		allowNull: false
	},
	personalCode: {
		type: DataTypes.STRING(100),
		allowNull: false
        // references: {
        //     // This is a reference to another model
        //     model: "students",
        //     key: 'personalCode'
        // }
	},
	name: {
		type: DataTypes.STRING(100),
		allowNull: false
	},
	lastName: {
		type: DataTypes.STRING(100)
	}
	},
	{
		timestamps: true
	});
}