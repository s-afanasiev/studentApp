module.exports = (sequelize, DataTypes)=> { 
	return sequelize.define('grades', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        grade: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
        // personalCode: {
            // type: DataTypes.STRING(100),
            // allowNull: false
            // references: {
            //     // This is a reference to another model
            //     model: "students",
            //     key: 'personalCode'
            // }
        // },
	},
	{
		timestamps: true
	});
}