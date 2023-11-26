const NATS = require('nats');
const helpers = require('../helpers');
//const nc = await NATS.connect({ servers: "192.162.246.63:4222" });
module.exports = class Nats {
    typedEventSource; //@run
    _nc; //@run
    _sc; //@run
    constructor(chart) {}

    async run(bin) {
        this.typedEventSource = new helpers.TypedEventSource();

        const server = { servers: process.env.NATS_ADDR };
        const nc = await NATS.connect(server);
        this._nc = nc;
        console.log(`connected to ${nc.getServer()}`);

        // create a codec
        const sc = NATS.StringCodec();
        this._sc = sc;

        const sub = nc.subscribe(process.env.NATS_EVENT_GRADE);

        (async () => {
            for await (const m of sub) {
                //@ m is not an instance of Promise
                //@ [1]: {"data":{"personalCode":"2966FA629336","grade":5,"subject":"geography"}}
                console.log(`[${sub.getProcessed()}]: ${sc.decode(m.data)}`);
                const data = sc.decode(m.data);
                //this.request_student(JSON.parse(data).data.personalCode);

                this._broadcast(process.env.NATS_EVENT_GRADE, data);
            }
            console.log("subscription closed");
        })();

        console.log("here the code resumes...")
        const done = nc.closed();
        //await nc.close();
        return this;
    }

    subscribe(evName, cb) {
        this.typedEventSource.subscribe(evName, cb);
    }
    unsubscribe(evName, cb) {
        this.typedEventSource.unsubscribe(evName, cb);
    }
    _broadcast(evName, data) {
        this.typedEventSource.broadcast(evName, data);
    }

    async requestStudent(personalCode, callback) {
        console.log("request_student: personalCode=", personalCode)
    
        const data = { personalCode }
    
        this._nc.request(process.env.NATS_REQ_STUDENT, data, { timeout: 2000 })
            .then((m) => {
                const res = this._sc.decode(m.data);
                console.log(`request_student: ${res}`);
                callback(null, res);
            })
            .catch((err) => {
                console.log(`problem with request: ${err.code}: ${err.message}`);
                callback(err);
            });
    }

    async closeConnection(nc) {
        await nc.close();
    }
}
