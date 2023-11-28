
module.exports = class GradesLogService {
    _chart;
    _natsService;
    _processingGrades = {};
    _typedEventSource;
    _storedGradeEventName = "grade";
    constructor(chart) {
        this._chart = chart;
    }
    _deps = {
        "subjectService": null,
        "studentService": null,
        "natsService": null,
    }
    run(bin) {
        console.log("GradesLogService.run...")
        this._get_deps_by_link(bin);
        this._express = bin.get("express");

        this._typedEventSource = new bin.shared.helpers.TypedEventSource("GradesLog");
        
        //@ say to natsService for connect to external Nats Server events
        const evName = process.env.NATS_EVENT_GRADE;
        this._deps["natsService"].subscribe(evName, (gradeInfo)=>{
            const gradeJson = JSON.parse(gradeInfo);
            const storedGrade = new StoredGrade(gradeJson);
            storedGrade.onStored(storedGrade=>{
                console.log("storedGrade.onStored event!");
                this._typedEventSource.broadcast(this._storedGradeEventName, storedGrade);
            });
            storedGrade.run(bin);
            
        })
    }

    subscribe(evName, cb) {
        console.log("GradesLogService.subscribe: ", evName);
        this._typedEventSource.subscribe(evName, cb);
    }

    _get_deps_by_link(bin) {
        if(!Array.isArray(this._chart.link)) { throw new Error("GradesLog: no sch.link"); }
        for (let i in this._chart.link) {
            const depName = this._chart.link[i];
            this._deps[depName] = bin.get(depName);
        }
        //@ check tha all dependencies was imported
        if (Object.values(this._deps).includes(null)) { throw new Error("GradesLog: deps DISMATCH!"); }
    }
}

class StoredGrade {
    _gradeJson;
    _modelName = "grades";
    _onStoredCallback = () => {console.log("StoredGrade: _onStoredCallback was not overrided")};
    constructor(gradeJson) {
        this._gradeJson = gradeJson;
    }

    async run(bin) {
        this._subjectService = bin.get("subjectService");
        this._studentService = bin.get("studentService");
        this._dbService = bin.get("dbService");
        
        const subjName = this._gradeJson.data.subject;
        const persCode = this._gradeJson.data.personalCode;
        console.log("___StoredGrade: requesting subjName=", subjName, ", persCode=", persCode);
        const values = await Promise.all([
            this._getSubjectName(subjName),
            this._getStudentCode(persCode)
        ]).catch(err=>{
            console.error(">>> StoredGrade: Errors after Promise.all: ", err);
        });
        const [name, personalCode] = values;
        console.log("_____StoredGrade: responsed: name=", name, ", personalCode=", personalCode);

        const model = this._dbService.getModel(this._modelName);
        const storedGrade = await model.create({
            grade: this._gradeJson.data.grade,
            subjectName: name,
            studentPersonalCode: personalCode
        });
        console.log("StoredGrade: saved:", JSON.stringify(storedGrade.dataValues));
        this._onStoredCallback(storedGrade.dataValues);
        
        return this;
    }

    onStored(cb) { this._onStoredCallback = cb; }

    _getSubjectName(subjectname) {
        return new Promise((resolve, reject)=>{
            this._subjectService.getSubjectDbId(subjectname, (err, res)=>{
                if (err) {
                    reject(err);
                } else {
                    resolve(res)
                }
            });
        });
    }

    _getStudentCode(personalCode) {
        return new Promise((resolve, reject)=>{
            this._studentService.getStudentDbId(personalCode, (err, res)=>{
                if (err) {
                    reject(err);
                } else {
                    resolve(res)
                }
            });
        });
    }
}