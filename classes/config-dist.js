/**
 * Jira Tools-Config
 *
 * @licence Wilfried Loche <wilfried.wl.loche@gmail.com>
 * @license GPL-3.0-or-later
 * @package jira-tools
 */

const Config = {
    /* ###### Parameters to be updated ###### */
    USER: '##USER##',
    PASSWORD: '##PASSWORD##',
    DOMAIN_NAME: 'https://##your-jira-server##',
    BASE_URL_REST_V2: '/jira/rest/api/2/',

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
        pointsUrl:  "/jira/rest/agile/1.0/issue/%jiraId%?fields=%customFieldStoryPoints%,issuetype",
        sprintsUrl: "/jira/rest/agile/1.0/board/%boardId%/sprint?startAt=%startAt%",
        scoreChangelUrl: '/jira/rest/greenhopper/1.0/rapid/charts/scopechangeburndownchart?rapidViewId=%boardId%&sprintId=%sprintId%',
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
        return Config.DOMAIN_NAME
            + Config.jira.pointsUrl.replace("%customFieldStoryPoints%", Config.jira.customFieldStoryPoints);
    },

    getSprintsUrl() {
        return Config.DOMAIN_NAME + Config.jira.sprintsUrl;
    },

    getJqlUrl() {
        return Config.DOMAIN_NAME + Config.jira.jql;
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
        return Config.DOMAIN_NAME + Config.jira.scoreChangelUrl;
    },

    constructScoreChangelUrl(boardId, sprintId) {
        return Config.getScoreChangelUrl()
            .replace("%boardId%", boardId)
            .replace("%sprintId%",  sprintId);
    }

}

module.exports = Config;
