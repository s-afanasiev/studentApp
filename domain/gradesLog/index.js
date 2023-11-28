
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
                //console.log("storedGrade.onStored event!");
                this._typedEventSource.broadcast(this._storedGradeEventName, storedGrade);
            });
            storedGrade.run(bin);
            
        })

        this._express = bin.get("express");
        const rout = this._chart.route || "/log";
        this._express.route(rout).get((req, res) => {
            const paginatedLog = new PaginatedLog();
            paginatedLog.run(bin, req, res);
        });
    }

    subscribe(evName, cb) {
        //console.log("GradesLogService.subscribe: ", evName);
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

class PaginatedLog {
    _modelGradeStatName = "grades";
    _modelStudentName = "students";
    async run(bin, req, res) {
        //console.log("req.query=", req.query, typeof req.query);
        const page = parseInt(req.query.page) || 0;
        const size = parseInt(req.query.size) || 3;
        const from = (page*size)+1;
        const to = (page*size)+size;
        console.log("page, size=", page, size);
        console.log("from, to=", from, to);
        const dbService = bin.get("dbService");
        const modelGrade = dbService.getModel(this._modelGradeStatName);
        const modelStudent = dbService.getModel(this._modelStudentName);
        const result = await modelGrade.findAll({
            //where:{id},
            //logging: console.log,
            offset: (page*size),
            limit: size,
            attributes: [["createdAt", "date"], ["subjectName", "subject"], "grade"],
            order: [['createdAt', 'ASC']],
            include:[{
                model:modelStudent, as:'student', 
                // where:{ 
                //     "personalCode": "grades.studentPersonalCode", 
                // },   
                required:false
            }]
        });
        res.header("Content-Type",'application/json');
        res.end(this._convert_answer(result));
        
    }

    _convert_answer(result) {
        const res1 = result.map(el=>el.dataValues);
        const res2 = res1.map(el=>{
            el.student = el.student.dataValues;
            return el;
        })
        const res3 = JSON.stringify(res2);
        //console.log("result: res3=", res3);
        return res3;
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
        //console.log("___StoredGrade: requesting subjName=", subjName, ", persCode=", persCode);
        const values = await Promise.all([
            this._getSubjectName(subjName),
            this._getStudentCode(persCode)
        ]).catch(err=>{
            console.error(">>> StoredGrade: Errors after Promise.all: ", err);
        });
        const [name, personalCode] = values;
        const grade_to_save = this._gradeJson.data.grade;
        console.log("_StoredGrade: saving:", grade_to_save, name, personalCode);

        const model = this._dbService.getModel(this._modelName);
        const storedGrade = await model.create({
            grade: grade_to_save,
            subjectName: name,
            studentPersonalCode: personalCode
        });
        //console.log("StoredGrade: saved:", JSON.stringify(storedGrade.dataValues));
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