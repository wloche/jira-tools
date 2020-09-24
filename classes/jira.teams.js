/**
 * Sprints statistics
 *
 * @licence Wilfried Loche <wilfried.wl.loche@gmail.com>
 * @license GPL-3.0-or-later
 * @package sprints-stats
 */

class JiraTeams {
    
    static addSprint(team, sprint, jiraItems) {
        if (!JiraTeams.teams) {
            JiraTeams.teams = {};
        }
        if (!JiraTeams.teams[team.name]) {
            JiraTeams.teams[team.name] = {};
        }
        JiraTeams.teams[team.name][sprint.id] = jiraItems;
    }
    
    static toString(team) {
        let s = "<< Teams / Sprints " + team + " >>\n";
        
        for (let sprintId in this.teams[team]) {
            s += "Sprint: " + sprintId + "\n";
            s += this.teams[team][sprintId];
        }
        
        return s;
    }
    

    static get(team) {
        if (this.teams == undefined || !this.teams.hasOwnProperty(team)) {
            return [];
        }

        // @todo order by sprintName column / jiraSprints.getName(sprintId)... or not :)

        return this.teams[team];
    }

    static deleteJiraId(team, key){
        for (let sprintId in this.teams[team]) {

            if (this.teams[team][sprintId].items.hasOwnProperty(key)) {
                delete this.teams[team][sprintId].items[key];
            }
        }
    }

    static getJiraIds(team) {
        let ids = [];

        if (this.teams == undefined || !this.teams.hasOwnProperty(team)) {
            return [];
        }

        for (let sprintId in this.teams[team]) {
            for (let key in this.teams[team][sprintId].items) {
                ids.push(key);
            }
        }

        return ids;
    }
    
}

module.exports = JiraTeams;
