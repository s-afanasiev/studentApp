module.exports = class SubjectService {
    _bin; //@ run
    _chart; //@ constructor
    _processingSubjects;
    constructor(chart) {
        this._chart = chart;
        this._processingSubjects = {};
    }

    run(bin) {
        this._bin = bin;
        console.log("SubjectService.run...");

        //@test
        // this.getSubjectDbId("biology_test", (err, res)=>{
        //     console.log("SubjectService: subject ID=", res);
        // });

        return this;
    }

    getSubjectDbId(subjectName, callback) {
        const subject = this._processingSubjects[subjectName];
        if(subject && subject.isActive()) {
            subject.addSubscriber(callback);
        } else {
            const storedSubject = new StoredSubject(subjectName);
            this._processingSubjects[subjectName] = storedSubject;
            storedSubject.run(this._bin);
            storedSubject.addSubscriber(callback);
            storedSubject.onEnd(this._storedSubjectEndLife.bind(this));
        }
    }

    _storedSubjectEndLife(subjectName) {
        delete this._processingSubjects[subjectName];
        console.log("SubjectService: queue length:", Object.keys(this._processingSubjects).length)
    }
}

class StoredSubject {
    _subjectName; //@ constructor
    _bin; //@ run
    _simpleEventSource; //@ run
    _is_active; //@ run
    _onEndCallback; //@ onEnd
    _modelName = 'subjects';

    constructor(subjectName) {
        this._subjectName = subjectName;
    }

    async run(bin) {
        console.log("StoredSubject.run...");
        this._activate(true);
        this._bin = bin;
        this._simpleEventSource = new bin.shared.helpers.SimpleEventSource();
        const dbService = bin.shared.dbService;
        const model = dbService.getModel(this._modelName);
        //console.log("StoredSubject: model =", model);
        //const instance = model.create({name: this._subjectName});
        const [subject, is_created] = await model.findOrCreate({
            where: { name: this._subjectName }
          });
        //console.log("StoredSubject: subject =", subject.dataValues.id);

        this._finish(null, subject.dataValues.id);

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
            this._onEndCallback(this._subjectName);
        }, 3000);
        
        
    }

    _activate(is_active) { this._is_active = is_active; }

    _broadcast(err, data) { this._simpleEventSource.broadcast(err, data); }
}