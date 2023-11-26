
module.exports = class GradesLog {
    _chart;
    _natsService;
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
        //@ say to natsService for connect to external Nats Server events
        const evName = process.env.NATS_EVENT_GRADE;
        this._deps["natsService"].subscribe(evName, (gradeInfo)=>{
            console.log("GradesLogService: Event: gradeInfo= ", gradeInfo);
            const gradeJson = JSON.parse(gradeInfo);
            this._deps["subjectService"].getSubjectDbId(gradeJson.data.subject, (err, res)=>{});
            this._deps["studentService"].getStudentDbId(gradeJson.data.personalCode, (err, res)=>{});
        })
        //this.natsService.run();
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

    //@ data example: {"data":{"personalCode":"4580FD982276","grade":5,"subject":"maths"}}
    addGrade(data) {
        this.check_addGrade_data(data);
        new StoredGrade().init(pars, common).run(data);
    }

    check_addGrade_data(data) {
        if(typeof data != "object" && typeof data.data != "object" && typeof data.data.personalCode != "string") {}
    }
}

class StoredGrade {
    constructor() {}

    init(chart, bin) {
        return this;
    }

    run(data) {
        return this;
    }
}