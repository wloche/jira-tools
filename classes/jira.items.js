/**
 * Sprints statistics
 *
 * @licence Wilfried Loche <wilfried.wl.loche@gmail.com>
 * @license GPL-3.0-or-later
 * @package sprints-stats
 */

var requestPromise = require('request-promise');
const JiraTeams = require('./jira.teams.js');

class JiraItems {

    constructor(startTime, endTime) {
      this.startTime = startTime;
      this.endTime   = endTime;

      this.items = {};
    }


    /**
     * Output the estimated and completed story points for the given sprint and team
     *
     * @param team {'name', 'sprintPrefix', 'rapidViewId'}
     * @param sprintParam sprint
     * @returns void
     */
    static get(dataSet, team, sprint) {
        if (dataSet.debug) {
            console.log('... ' + team.name);
        }

        const auth = Buffer.from(dataSet.USER + ':' + dataSet.PASSWORD).toString('base64');
        const options = {
            uri: dataSet.constructScoreChangelUrl(team.boardId, sprint.id),
            method: 'GET',
            headers: {
                Authorization: 'Basic ' + auth,
                'Content-Type': 'application/json'
            },
            rejectUnauthorized: false
        };

        return requestPromise(options, (error, response, data) => {
            //console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
            if (dataSet.debug) {
                console.log('?? ' + team.name);
            }
            //console.log(`BODY: ${chunk}`);

            var sprintId = 0;
            var sprintName = '';
            var json = null;

            try {
                json = JSON.parse(data);
            } catch (e) {
                console.log(e);

                console.log(data);

                console.log('!!1!! ' + team.name + ', Err');
                return;
            }

            JiraItems.parseJson(dataSet, team, sprint, json);
            return;
        });
    }

    static parseJson(dataSet, team, sprint, json) {
        var startTime    = json.startTime;
        var endTime      = json.endTime;
        // var completeTime = json.completeTime;


        var jiraItems = new JiraItems(startTime, endTime);

        // console.log('!! team=' + team.name + ', sprint: ' + sprint.name + ', startTime: ' + startTime + ', endTime: ' + endTime + ', completeTime: ' + completeTime);

        for (var timestamp in json.changes) {
            if (dataSet.debug) {
                console.log("> key:" + timestamp + ", value:" + JSON.stringify(json.changes[timestamp]));
            }
            jiraItems.add(timestamp, json.changes[timestamp]);
        }

        JiraTeams.addSprint(team, sprint, jiraItems);
        //console.log(jiraItems.toString());
    }

    addOne(ts, item) {
        /*
        {
            "key": "BMWO-77433",
            "column": {
                "notDone": true,
                "newStatus": "10000"
            }
        }
        {
            "key": "BMWO-76465",
            "statC": {
                "newValue": 0.0
            }
        }
        */

        var i = {
            "key":   item.key,
            //"added": null
        };
        var notDone = null;
        var done    = null;
        var added   = null;


        if (item.hasOwnProperty('statC') && item.statC.hasOwnProperty('newValue')) {
            i.points = item.statC.newValue;
        }
        //if (item.hasOwnProperty('column') && item.column.hasOwnProperty('notDone')) {
        //    notDone = item.column.notDone;
        //    i.completed = !notDone;
        //}
        if (item.hasOwnProperty('column') && item.column.hasOwnProperty('done')) {
            done = item.column.done;
            i.completed = done;
        }
        if (item.hasOwnProperty('added')) {
            added = item.added;
            if (added) {
                if (ts <= this.startTime) {
                    i.committed = true;
                } else {
                    i.added = true;
                }
            } else {
                i.added = false;
            }
        }

        //if (ts <= this.startTime) {
        if (i.added && done && ts <= this.startTime) {
            i.completeOutside = true;
        }

        if (this.items.hasOwnProperty(item.key)) {
            this.items[item.key] = Object.assign({}, this.items[item.key], i);
        } else {
            this.items[item.key] = i;
        }
    }



    add(ts, items) {
        if (Array.isArray(items)) {
            for (var i = 0, len = items.length; i < len; i++) {
                this.addOne(ts, items[i]);
            }
        } else {
            this.addOne(ts, items);
        }
        return this;
    }

    parse() {
        var items = {
            "committed":     [],
            "committedDone": [],
            "added":         [],
            "addedDone":     [],
            "removed":       [],
            "others":        []
        };

        for (var key in this.items) {
            if (/*this.items[key].committed &&*/ this.items[key].added === false) {
                items.removed.push(key);
                //if (this.items[key].completed) {
                //    items.removedDone.push(key);
                //}
            } else if (this.items[key].committed) {
                items.committed.push(key);
                if (this.items[key].completed) {
                    items.committedDone.push(key);
                }
            } else if (this.items[key].added === true) {
                items.added.push(key);
                if (this.items[key].completed) {
                    items.addedDone.push(key);
                }
            } else {
                items.others.push(key);
            }
        }

        return items;
    }

    toString() {
        if (false) {
            var s = "<< items >>\n";

            for (var key in this.items) {
                s += JSON.stringify(this.items[key]) + "\n";
            }
        }

        var items = this.parse();
        s += "\n<< parsed >>";
        s += "\ncommitted: " + items.committed.length;
        s += "\n- Done  : " + items.committedDone.length;
        s += "\n- % Done: " + Math.round((items.committedDone.length / items.committed.length) * 100);
        s += "\n- {}    : " + JSON.stringify(items.committed);
        s += "\n- {Done}: " + JSON.stringify(items.committedDone);

        s += "\nadded   : " + items.added.length;
        s += "\n- Done  : " + items.addedDone.length;
        s += "\n- % Done: " + Math.round((items.addedDone.length / items.added.length) * 100);
        s += "\n- {}    : " + JSON.stringify(items.added);
        s += "\n- {Done}: " + JSON.stringify(items.addedDone);

        s += "\nremoved   : " + items.removed.length;
        s += "\n- {}    : " + JSON.stringify(items.removed);

        s += "\nothers   : " + items.others.length;
        s += "\n- {}    : " + JSON.stringify(items.others);

        return s;
    }

}

module.exports = JiraItems;


/*
console.log("!! UnitTests !!");

var jiraItems = new JiraItems(1000, 5000);
jiraItems.add(500, [{
    "key": "BMWO-77436",
    "column": {
        "notDone": true,
        "newStatus": "10000"
    }
}, {
    "key": "BMWO-76465",
    "statC": {
        "newValue": 0.0
    }
}]);
jiraItems.add(4000, [{
    "key": "BMWO-77436",
    "column": {
        "notDone": false,
        "newStatus": "10001"
    }
}, {
    "key": "BMWO-83677",
    "added": true
}]);

console.log(jiraItems.toString());
*/
