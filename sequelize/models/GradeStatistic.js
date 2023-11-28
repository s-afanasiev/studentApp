module.exports = (sequelize, DataTypes)=> { 
	return sequelize.define('grade_statistic', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        maxGrade: {
            type: DataTypes.INTEGER
        },
        minGrade: {
            type: DataTypes.INTEGER
        },
        avgGrade: {
            type: DataTypes.FLOAT
        },
        totalGrades: {
            type: DataTypes.INTEGER
        }
    }, {
        tableName: 'grade_statistic'
    });
}