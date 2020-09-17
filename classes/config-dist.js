/**
 * Jira configuration
 *
 * This file has to be copied and rename as `config.js` and updated accordingly.
 *
 * @licence Wilfried Loche <wilfried.wl.loche@gmail.com>
 * @license GPL-3.0-or-later
 * @package jira-tools
 */

const Config = {
    /* ###### Parameters to be updated ###### */
    USER: '##USER##',
    PASSWORD: '##PASSWORD##',
    BASE_URL: 'https://##your-jira-server##/jira/rest/api/2/',

    async: false,
    useSecuredJira: true,
    debug: false,

    teams: [
        {
            'name': '99 Luftballons',
            'boardId': 99,
        },
        {
            'name': 'Kraftwerk',
            'boardId': 2,
        },
    ],

    jira: {
        customFieldStoryPoints: 'customfield_10006',
        secure: {
            'pointsUrl':  "https://##your-jira-server##/jira/rest/agile/1.0/issue/%jiraId%?fields=customfield_10006,issuetype",
            'sprintsUrl': "https://##your-jira-server##/jira/rest/agile/1.0/board/%boardId%/sprint?startAt=%startAt%",
        },
        scoreChangelUrl: '##your-jira-server##/jira/rest/greenhopper/1.0/rapid/charts/scopechangeburndownchart?rapidViewId=%boardId%&sprintId=%sprintId%',
    },
    /* ###### End of parameters section ###### */

    getBoardId(teamName) {
        for (var i = 0, len = Config.teams.length; i < len; i++) {
            if (Config.teams[i].name == teamName) {
                return Config.teams[i].boardId;
            }
        }
        return null;
    },

    getTeam(teamName) {
        for (var i = 0, len = Config.teams.length; i < len; i++) {
            if (Config.teams[i].name == teamName) {
                return Config.teams[i];
            }
        }
        return null;
    },

    getPointsUrl() {
        if (Config.useSecuredJira) {
            return Config.jira.secure.pointsUrl;
        } else {
            return Config.jira.unSecure.pointsUrl;
        }
    },

    getSprintsUrl() {
        if (Config.useSecuredJira) {
            return Config.jira.secure.sprintsUrl;
        } else {
            return Config.jira.unSecure.sprintsUrl;
        }
    },

    getJqlUrl() {
        if (Config.useSecuredJira) {
            return Config.jira.secure.jql;
        } else {
            return Config.jira.unSecure.jql;
        }
    },

    constructJqlUrl(structure, jiraId, startAt = 0) {
        let jql = Config.jira.jql
            .replace("%structure%", structure)
            .replace("%jiraId%",    jiraId);

        return Config.getJqlUrl()
            .replace("%jql%",     encodeURI(jql))
            .replace("%startAt%", startAt);
    },

    getScoreChangelUrl() {
        if (Config.useSecuredJira) {
            return 'https://' + Config.jira.scoreChangelUrl;
        } else {
            return 'http://' + Config.jira.scoreChangelUrl;
        }
    },

    constructScoreChangelUrl(boardId, sprintId) {
        return Config.getScoreChangelUrl()
            .replace("%boardId%", boardId)
            .replace("%sprintId%",  sprintId);
    }

}

module.exports = Config;
