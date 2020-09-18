/**
 * Sprints statistics
 *
 * @licence Wilfried Loche <wilfried.wl.loche@gmail.com>
 * @license GPL-3.0-or-later
 * @package sprints-stats
 */

// var requestPromise = require('request-promise');


// const teams = [ ];
const teams = [ 'Kraftwerk' ];
// teams = [ '99 Luftballons' ];

const fs = require('fs')

if (!fs.existsSync('classes/config.js')) {
    console.error(
        '/!\\ classes/config.js is not found /!\\'
        + '\n- Make sure you copied classes/config-dist.js and renamed it to classes/config.js.'
        + '\n- Finally, you\'ll need to replace the values with your credentials and Jira domain name'
    );
    return;
}

const Config = require('./classes/config.js');

const JiraItems   = require('./classes/jira.items.js');
const JiraSprints = require('./classes/jira.sprints.js');
const JiraTeams   = require('./classes/jira.teams.js');
const JiraPoints  = require('./classes/jira.points.js');

process.on('unhandledRejection', error => {
    // Won't execute
    console.log('uxnhandledRejection', error);
    console.log('unhandledRejection', error.message);
});

/*
 * serial executes Promises sequentially.
 * @param {funcs} An array of funcs that return promises.
 * @example
 * const urls = ['/url1', '/url2', '/url3']sopn
 * serial(urls.map(url => () => $.ajax(url)))
 *     .then(console.log.bind(console))
 * @url https://stackoverflow.com/questions/24586110/resolve-promises-one-after-another-i-e-in-sequence
 */
const serial = funcs =>
    funcs.reduce((promise, func) =>
        promise.then(result => func().then(Array.prototype.concat.bind(result))), Promise.resolve([]))

Config.teams.forEach(function (team) {
    if (teams.length && teams.indexOf(team.name) === -1) {
        console.log("Discarding team " + team.name);
        return;
    }

    let jiraSprints = new JiraSprints(Config, team);

    if (Config.async) {
        JiraSprints.get(jiraSprints).then(() => {

            let sprints = [];

            for (var key in jiraSprints.sprints) {
                sprints.push(jiraSprints.sprints[key]);
            }

            serial(sprints.map(sprint => () => JiraItems.get(Config, team, sprint)))
                .then(() => {
                    return fetchPoints(team.name);
                })
                //.catch(error => { console.log('caught', err.message); });
                .then(() => {
                    teamChart(jiraSprints, team.name);
                });

        });
    } else {
        // Sync call because of the 50 results limitation
        JiraSprints.get(jiraSprints);

        let sprints = [];

        for (var key in jiraSprints.sprints) {
            sprints.push(jiraSprints.sprints[key]);
        }

        serial(sprints.map(sprint => () => JiraItems.get(Config, team, sprint)))
            .then(()=>{ return fetchPoints(team.name); })
            //.catch(error => { console.log('caught', err.message); });
            .then(()=>{ teamChart(jiraSprints, team.name); })
    }
});

function fetchPoints(teamName) {
    //console.log(`fetchPoints(${teamName})`);

    var jiraIds = JiraTeams.getJiraIds(teamName);
    if (null === jiraIds) {
        return;
    }
    //console.log(jiraIds);
    
    return serial(jiraIds.map(jiraId => () => JiraPoints.fetch(Config, teamName, jiraId)));
}
    
function teamChart(jiraSprints, teamName) {
    let jiraTeams = JiraTeams.get(teamName);
    let s = '';
    for (let sprintId in jiraTeams) {
        let items = jiraTeams[sprintId].parse();

        let points = getPoints(items);

        s += "\n" + teamName + "," 
            + sprintId + "," + jiraSprints.getName(sprintId) + ","
            + items.committed.length + ","     + points.committed + "," 
            + items.committedDone.length + "," + points.committedDone + ","
            + items.added.length + ","         + points.added + ","
            + items.addedDone.length + ","     + points.addedDone + ","
            + items.removed.length + ","       + points.removed;
    }

    if (s != '') {
        const header = "\n\nteam,sprintId,sprintName,"
            + "committed,committedPoints,"
            + "commDone,commDonePoints,"
            + "added,addedPoints,"
            + "addedDone,addedDonePoints,"
            + "removed,removedPoints";

        s = header + s;
    } else {
        s = "=== NO Sprint report for " + teamName + "===";
    }

    console.log(s);
    return s;
}

function getPoints(items) {
    var points = {
        "committed":     0,
        "committedDone": 0,
        "added":         0,
        "addedDone":     0,
        "removed":       0
    }
    
    for (var i = 0; i < items.committed.length; i++) {
        var p = JiraPoints.get(items.committed[i]);
        //console.log("teamChart:", teamName, ": ", items.committed[i], "=", p);
        if (p) {
            points.committed += JiraPoints.get(items.committed[i]);
        }
    }
    for (var i = 0; i < items.committedDone.length; i++) {
        var p = JiraPoints.get(items.committedDone[i]);
        if (p) {
            points.committedDone += JiraPoints.get(items.committedDone[i]);
        }
    }

    for (var i = 0; i < items.added.length; i++) {
        var p = JiraPoints.get(items.added[i]);
        if (p) {
            points.added += JiraPoints.get(items.added[i]);
        }
    }
    for (var i = 0; i < items.addedDone.length; i++) {
        var p = JiraPoints.get(items.addedDone[i]);
        if (p) {
            points.addedDone += JiraPoints.get(items.addedDone[i]);
        }
    }
    
    for (var i = 0; i < items.removed.length; i++) {
        var p = JiraPoints.get(items.removed[i]);
        if (p) {
            points.removed += JiraPoints.get(items.removed[i]);
        }
    }
    
    return points;
}
