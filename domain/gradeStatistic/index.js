module.exports = class GradeStatistic {
    _storedGradeEventName = "grade";
    _deps = {
        "gradesLogService": null,
        "natsService": null,
    }
    constructor(chart) {}

    run(bin) {
        console.log("GradeStatisticService.run...", this._storedGradeEventName)
        this._gradesLogService = bin.get("gradesLogService");
        this._gradesLogService.subscribe(this._storedGradeEventName, storedGradeJson => {
            const storedGradeStat = new StoredGradeStat(storedGradeJson);
            storedGradeStat.run(bin);
        });
    }
}

class StoredGradeStat {
    _storedGradeJson;
    _modelName = "grade_statistic";
    constructor(storedGradeJson) {
        //@ {"id":170,"grade":4,"subjectName":"music","studentPersonalCode":"6335FC113011","updatedAt":"2023-11-26T19:42:17.472Z","createdAt":"2023-11-26T19:42:17.472Z"}
        this._storedGradeJson = storedGradeJson;
    }

    async run(bin) {
        console.log("StoredGradeStat.run... ");
        const dbService = bin.get("dbService");
        const model = dbService.getModel(this._modelName);
        const res = await model.findOne({ where: {
            studentPersonalCode: this._storedGradeJson.studentPersonalCode,
            subjectName: this._storedGradeJson.subjectName
        }});

        if (res) {
            //@ res == { dataValues: { id: 9, grade_avg: 2, grade_max: 2, grades_count: null, createdAt: ..., updatedAt: ..., studentPersonalCode: '0425AB018373', subjectName: 'english' },
            //console.log("!!!!!___ StoredGradeStat: TODO_______!!!!!!!!");
            //console.log("StoredGradeStat: res=", JSON.stringify(res.dataValues),typeof res.dataValues.grades_count);
            await model.update({
                grade_avg: (res.dataValues.grade_avg + this._storedGradeJson.grade) / 2,
                grade_max: (res.dataValues.grade_max > this._storedGradeJson.grade) ? res.dataValues.grade_max : this._storedGradeJson.grade,
                grades_count: (res.dataValues.grades_count ? (res.dataValues.grades_count+1) : 1)
            }, {
                where: {
                    studentPersonalCode: this._storedGradeJson.studentPersonalCode,
                    subjectName: this._storedGradeJson.subjectName
                }
              });
            //const next_avg = this._storedGradeJson.grade + res.grade
        } else {
            model.create({
                grade_avg: this._storedGradeJson.grade,
                grade_max: this._storedGradeJson.grade,
                grade_count: 1,
                studentPersonalCode: this._storedGradeJson.studentPersonalCode,
                subjectName: this._storedGradeJson.subjectName
            });
        }
    }
}