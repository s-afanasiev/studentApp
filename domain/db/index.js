const db = require("./../sequelize/models");

_checkConnection(db.sequelize);

function getModel(modelName) {
    if(db[modelName]) {
        return db[modelName];
    } else {
        console.error("db.getModel: NO such model name:", modelName, Object.keys(db));
    }
}

async function _checkConnection(sequelize) {
    try {
        await sequelize.authenticate()
        console.log('Соединение с БД было успешно установлено')
      } catch (e) {
        console.log('Невозможно выполнить подключение к БД: ', e)
      }
}

module.exports = {
    sequelize: db.sequelize,
    getModel
}