/**
 * Sprints statistics
 *
 * @licence Wilfried Loche <wilfried.wl.loche@gmail.com>
 * @license GPL-3.0-or-later
 * @package sprints-stats
 */

var requestPromise = require('request-promise');
const JiraTeams = require('./jira.teams.js');

class JiraPoints {
    
    static add(id, points) {
        if (!JiraPoints.points) {
            JiraPoints.points = {};
        }
        JiraPoints.points[id] = points;
    }
    
    static exists(id) {
        if (!JiraPoints.points) {
            JiraPoints.points = {};
        }
        return JiraPoints.points.hasOwnProperty(id);
    }
    
    static get(id) {
        if (!JiraPoints.exists(id)) {
            return null;
        }
        return JiraPoints.points[id];
    }
    
    static toString() {
        let s = "<< Points >>\n";
        
        for (let key in JiraPoints.points) {
            s += "Id: " + key + ": " + JiraPoints.points[key] + "\n";
        }
        
        return s;
    }
    
    static fetch(config, team, jiraId) {
        if (JiraPoints.exists(jiraId)) {
            //console.log(`fetch(${team}, ${jiraId}): jiraId already exists`);
            return new Promise(function (fulfill, reject){
                fulfill();
              });
        }
        
        JiraPoints.add(jiraId, null);
        
        let boardId = config.getBoardId(team);
        if (boardId === null) {
            console.log('!!9!! fetchPoints(' + team + ", " + jiraId + "): boardId=null //Err");
            return new Promise(function (fulfill, reject){
                fulfill();
              });

        }
        
        const auth = Buffer.from(config.USER + ':' + config.PASSWORD).toString('base64');
        const options = {
            uri: config.getPointsUrl()
                .replace("%jiraId%", jiraId),
            method: 'GET',
            headers: {
                Authorization: 'Basic ' + auth,
                'Content-Type': 'application/json'
            },
            rejectUnauthorized: false
        };

        return requestPromise(options, (error, response, data) => {
            let json = null;

            try {
                json = JSON.parse(data);
            } catch (e) {
                console.log("Error fetching uri" + options.uri);
                /*
                console.log("data:" + data);
                console.log("uri:" + options.uri);
                
                console.log(e);
                
                console.log('!!9!! fetchPoints(' + team + ", " + jiraId + "): boardId=" + config.getBoadId(team) + "Err");
                //globalErrors += '!!9!! fetchPoints()' + team + ", " + jiraId + ', Err';
                */
                return;
            }

            if (json.errorMessages) {
                console.error("error: " + jiraId + "@" + team);
                console.error(json.errorMessages);
                return;
            }

            if (json.fields.issuetype.name != "Dependency" && !json.fields.issuetype.subtask) {
                //--- Not a dep nor a sub-task
                // JiraPoints.add(jiraId, json.fields.customfield_10002);
                // JiraPoints.add(jiraId, json.fields.customfield_10006);
                JiraPoints.add(jiraId, json.fields[config.jira.customFieldStoryPoints]);
            } else {
                //--- Delete this dependency/sub-task from the stats
                JiraTeams.deleteJiraId(team, json.key);
            }
            //console.log(JiraPoints.points);
            //console.log(JiraPoints.toString());
            return;
        }).catch((err) => { console.log(`fetch(${team}, ${jiraId})`); JiraPoints.add(jiraId, 0); });
        
        
    }
}

module.exports = JiraPoints;

/* ### UT ### */
//JiraPoints.fetch("Isetta", "BMWO-78667");
//JiraPoints.fetch("BB-8", "BMWO-93537");
