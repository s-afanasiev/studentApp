module.exports = class StudentService {
    _chart;
    _bin;
    _dbService;
    _natsService;
    _processingStudents = {};
    _modelName = 'students';
    
    constructor(chart) {
        this._chart = chart;
    }

    run(bin) {
        console.log("StudentService.run...")
        this._bin = bin;
        this._dbService = bin.get("dbService");
        this._natsService = bin.get("natsService")
        this._fakeStudentService = new FakeStudentService().run(bin, this._modelName);
        
        //@test
        // this.getStudentDbId("0986BC068044", (err, res)=>{
        //     console.log("StudentService: student ID=", res);
        // });

        return this;
    }

    async getStudentDbId(studentCode, callback) {
        const student = this._processingStudents[studentCode];
        if(student && student.isActive()) {
            student.addSubscriber(callback);
        } else {        
            const storedStudent = new StoredStudent(studentCode);
            this._processingStudents[studentCode] = storedStudent;
            const model = this._dbService.getModel(this._modelName);
            storedStudent.run(this._bin, this._fakeStudentService, model);
            storedStudent.addSubscriber(callback);
            storedStudent.onEnd(this._storedStudentEndLife.bind(this));
        }
    }

    _storedStudentEndLife(studentCode) {
        delete this._processingStudents[studentCode];
        //console.log("StudentService: queue length:", Object.keys(this._processingStudents).length)
    }
    
}

class FakeStudentService {
    _fakeStudents = [
        {name: "Иван", lastName: "Иванов"},
        {name: "Пётр", lastName: "Петров"},
        {name: "Сергей", lastName: "Сергеев"},
        {name: "Алексей", lastName: "Алексеев"},
        {name: "Николай", lastName: "Николаев"},
        {name: "Владимир", lastName: "Владимиров"},
        {name: "Михаил", lastName: "Михайлов"},
        {name: "Фёдор", lastName: "Фёдоров"},
        {name: "Анатолий", lastName: "Анатольев"},
        {name: "Александр", lastName: "Александров"},
        {name: "Андрей", lastName: "Андреев"},
        {name: "Дмитрий", lastName: "Дмитриев"}
    ]
    _fake_counter = 0;

    run(bin, modelName) {
        const dbService = bin.get("dbService");
        const sequelize = dbService.sequelize;
        const model = dbService.getModel(modelName);

        //@SELECT foo, COUNT(hats) AS n_hats, bar FROM ...
        model.count()
        // model.findAll({
        //     attributes: [
        //         [sequelize.fn('COUNT', sequelize.col('personalCode')), 'count'],
        //     ]
        //}).then(res=>{
        .then(res=>{
            console.log("FakeStudentService: init res:", res, typeof res);
            this._fake_counter = parseInt(res);
        })

            
        return this;
    }

    /** @param {String} id*/
    fakeStudent(id) {
        if (this._fake_counter >= this._fakeStudents.length) {
            this._fake_counter = -1;
        }
        return Object.assign(this._fakeStudents[this._fake_counter+=1], {personalCode: id});
    }
}

class StoredStudent {
    _personalCode;
    _fakeStudentService;
    _natsService;
    _model;
    _onEndCallback = () => {"StoredStudent: _onEndCallback was not overrided!"};
    constructor(personalCode) {
        this._personalCode = personalCode;
    }

    async run(bin, fakeStudentService, model) {
        console.log("StoredStudent.run...");
        this._activate(true);
        this._bin = bin;
        this._simpleEventSource = new bin.shared.helpers.SimpleEventSource();
        this._natsService = bin.get("natsService");
        this._fakeStudentService = fakeStudentService;

        //@ 1. спросить в БД
        const stud = await model.findOne({
            where: { personalCode: this._personalCode }
        });
        if (stud) {
            //console.log("StoredStudent: already in DB:", stud.dataValues.id);
            return this._finish(null, stud.dataValues.personalCode);
        }
        //@ 2. спросить в NATS
        this._natsService.requestStudent(this._personalCode, async (err, res)=>{
            console.log("StoredStudent: natsAnswer:", res);
            if (res) {
                console.log("StoredStudent: NATS answer:", res);
                return this._finish(null, res);
            } else {
                //@ 3. взять из собственной моковой базы
                const fakeStudent = this._fakeStudentService.fakeStudent(this._personalCode);
                //@ 4. сохранить в БД и вернуть
                
                const dbRes = await model.create(fakeStudent);
                console.log("StoredSubject: dbRes =", dbRes.dataValues.id);
                this._finish(null, dbRes.dataValues.id);
            }
        });

        return this;
    }

    addSubscriber(callback) {
        this._simpleEventSource.subscribe(callback);
        return this;
    }

    isActive() { return this._is_active; }

    onEnd(cb) { this._onEndCallback = cb; }

    _finish(err, data) {
        this._activate(false);
        this._broadcast(err, data);
        setTimeout(()=>{
            this._onEndCallback(this._personalCode);
        }, 3000);
    }

    _activate(is_active) { this._is_active = is_active; }

    _broadcast(err, data) { this._simpleEventSource.broadcast(err, data); }
}