module.exports = class GradeStatistic {
    _storedGradeEventName = "grade";
    _chart;
    _deps = {
        "gradesLogService": null,
        "natsService": null,
    }
    constructor(chart) {
        this._chart = chart;
    }

    run(bin) {
        console.log("GradeStatisticService.run...", this._storedGradeEventName)
        this._gradesLogService = bin.get("gradesLogService");
        this._gradesLogService.subscribe(this._storedGradeEventName, storedGradeJson => {
            const storedGradeStat = new StoredGradeStat(storedGradeJson);
            storedGradeStat.run(bin);
        });

        this._express = bin.get("express");
        const rout = this._chart.route || "/statistic/:personalCode";
        this._express.route(rout).get((req, res) => {
            console.log("GradeStatisticService: request:", req.params.personalCode);
            const studentStat = new StudentStat();
            studentStat.run(bin, req, res);
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
            //@ res == { dataValues: { id: 9, avgGrade: 2, maxGrade: 2, minGrade: 2, totalGrades: 2, createdAt: ..., updatedAt: ..., studentPersonalCode: '0425AB018373', subjectName: 'english' },
            //console.log("!!!!!___ StoredGradeStat: TODO_______!!!!!!!!");
            //console.log("StoredGradeStat: res=", JSON.stringify(res.dataValues),typeof res.dataValues.totalGrades);
            await model.update({
                maxGrade: (res.dataValues.maxGrade < this._storedGradeJson.grade) ? res.dataValues.maxGrade : this._storedGradeJson.grade,
                maxGrade: (res.dataValues.maxGrade > this._storedGradeJson.grade) ? res.dataValues.maxGrade : this._storedGradeJson.grade,
                avgGrade: (res.dataValues.avgGrade + this._storedGradeJson.grade) / 2,
                totalGrades: (res.dataValues.totalGrades+1)
            }, {
                where: {
                    studentPersonalCode: this._storedGradeJson.studentPersonalCode,
                    subjectName: this._storedGradeJson.subjectName
                }
              });
            //const next_avg = this._storedGradeJson.grade + res.grade
        } else {
            model.create({
                maxGrade: this._storedGradeJson.grade,
                minGrade: this._storedGradeJson.grade,
                avgGrade: this._storedGradeJson.grade,
                totalGrades: 1,
                studentPersonalCode: this._storedGradeJson.studentPersonalCode,
                subjectName: this._storedGradeJson.subjectName
            });
        }
    }
}

class StudentStat {
    _modelGradeStatName = "grade_statistic";
    _modelStudentName = "students";

    async run(bin, req, res) {
        const persCode = req.params.personalCode;
        const dbService = bin.get("dbService");
        const modelGradeStat = dbService.getModel(this._modelGradeStatName);
        const modelStudent = dbService.getModel(this._modelStudentName);

        const result_stat = await modelGradeStat.findAll({
            where: {
                studentPersonalCode: persCode
            },
            logging: console.log
        });
        const resut_student = await modelStudent.findOne({
            where: {
                personalCode: persCode
            },
            logging: console.log
        });
        //@ result = [ { dataValues: {id, maxGrade, minGrade,..., studentPersonalCode}, { dataValues: {...} } } ]
        
        //@ TODO: convert answer from [{}, {}] to {student: {}, statistic: [{}, {}]}
        const final_result = this._convert_result(result_stat, resut_student);
        res.end(final_result);
    }

    _convert_result(result_stat, resut_student) {
        // const mapped_result = result.map(el=> el.dataValues);
        // console.log("StudentStat: mapped_result=", mapped_result);
        // final_result[persCode] = mapped_result;
        // console.log("StudentStat: final_result=", final_result);
        return "test";
    }
}