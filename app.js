

new App().run();

function App() {
    this.bin;
    this.run = () => {
        require('dotenv').config();
        const Express = require("express");

        const bin = {};
        this.bin = bin;

        bin.Home = require("./domain/home")
        bin.Students = require("./domain/students")
        bin.Subjects = require("./domain/subjects")
        bin.GradesLog = require("./domain/gradesLog")
        bin.GradeStatistic = require("./domain/gradeStatistic")

        bin.shared = {}

        bin.shared.helpers = require("./helpers");
        bin.shared.dbService = require("./domain/db");
        bin.shared.express = Express();
        bin.shared.router = Express.Router();
        const Nats = require("./nats");
        bin.shared.natsService = new Nats({
            events: { "graded": process.env.NATS_EVENT_GRADE },
            requests: {"getStudent": process.env.NATS_REQ_STUDENT}
        })
        bin.shared.natsService.run();
        
        bin.get = (depName) => {
            const res = bin.shared[depName];
            if (!res) {console.error(">>>>> App:No such dep:", depName);}
            return res;
        }
        
        bin.reg = (depName, dep) => {
            if (bin.shared[depName]) {
                throw new Error(`App: Error: ${depName} already exist!`);
            }
            bin.shared[depName] = dep;
            return dep;
        }

        this.v1();
    }

    this.v1 = () => {
        new this.bin.Home({
            route: "/",
            sub: {
                subjectService: this.bin.reg("subjectService", new this.bin.Subjects({
                    link: ["dbService"]
                })),
                studentService: this.bin.reg("studentService", new this.bin.Students({
                    link: ["dbService", "natsService"]
                })),
                gradesLogService: this.bin.reg("gradesLogService", new this.bin.GradesLog({
                    route: "/log",
                    link: ["dbService", "express", "router", "subjectService", "studentService", "natsService"]
                })),
                gradeStatisticService: this.bin.reg("gradeStatisticService", new this.bin.GradeStatistic({
                    route: "/statistic/:personalCode",
                    link: ["dbService"]
                }))
            }
        }).run(this.bin);
    }
}


