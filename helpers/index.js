module.exports.TypedEventSource = function TypedEventSource(parent_name){
    this.eventTargets = {};
    this.subscribe =function(evtype, fn){
        if(!this.eventTargets[evtype]){this.eventTargets[evtype] =[];}
        const already_subscribed =this.eventTargets[evtype].filter(targetFn => targetFn === fn);
        if(already_subscribed.length > 0){this.unsubscribe(evtype, fn);}
        this.eventTargets[evtype].push(fn);
        console.log("TypedEventSource: "+parent_name+": subscribe on '"+evtype+"' event: "+this.eventTargets[evtype].length);
    }
    this.unsubscribe =function(evtype, fn){
        if(this.eventTargets[evtype]){
            this.eventTargets[evtype] = this.eventTargets[evtype].filter(targetFn => targetFn !== fn);
            console.log("TypedEventSource: "+parent_name+": unsubscribe of "+evtype+": "+this.eventTargets[evtype].length);
        }
    }
    this.broadcast =function(evtype, data){
        if(this.eventTargets[evtype]){
            this.eventTargets[evtype].forEach(targetFn => targetFn(data));
        }
    }
}

module.exports.SimpleEventSource =function SimpleEventSource(id){
    this.id =id;
    this.eventTargets = [];
    this.subscribe =function(fn){
        this.unsubscribe(fn);
        this.eventTargets.push(fn);
    }
    this.unsubscribe =function(fn){
        this.eventTargets = this.eventTargets.filter(targetFn => targetFn !== fn);
    }
    this.broadcast =function(err, data){
        this.eventTargets.forEach(targetFn => targetFn(err, data));
    }
}
