const path = require("path");
module.exports = function Home(chart) {
    this.run = (bin) => {
        console.log("****** Home.run...")
        const natsService = bin.get("natsService");
        const express = bin.get("express");
        express.listen(process.env.PORT, () => {
            console.log(`app listening on port ${process.env.PORT}`)
          })
        express.route("/")
            .get((req, res) => {
            //common.router.get(par.route, (req, res) => {
                console.log("Home: ",chart.route);
                res.sendFile(path.resolve(__dirname, "./index.html"));
            });
        
        for (let subObjectName in chart.sub) {
            console.log("Home: starting ", subObjectName);
            const subObject = chart.sub[subObjectName];
            subObject.run(bin);
        }
    }
}