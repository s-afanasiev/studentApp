module.exports = (sequelize, DataTypes)=> { 
	return sequelize.define('grade_statistic', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        grade_avg: {
            type: DataTypes.FLOAT
        },
        grade_max: {
            type: DataTypes.INTEGER
        },
        grades_count: {
            type: DataTypes.INTEGER
        }
    }, {
        tableName: 'grade_statistic'
    });
}