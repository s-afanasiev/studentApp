module.exports = function GradeStatistic(sch) {
    this.deps = {
        "subjectService": null,
        "studentService": null,
        "natsService": null,
    }
    this.run = (ctr) => {
        console.log("GradeStatisticService.run...")
    }
}