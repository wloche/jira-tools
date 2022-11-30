/**
 * Jira search and update summary on items
 *
 * This class is used by bulk-rename.js
 *
 * @licence Wilfried Loche <wilfried.wl.loche@gmail.com>
 * @license GPL-3.0-or-later
 * @package bulk-rename
 */

const Config = require('./config.js');
var requestPromise = require('request-promise');

class JiraSearch {

    constructor(jiraId) {
    }

    static getUrl(jql, jiraId) {
        const regex = /jiraId/gi;
        let url =
            Config.DOMAIN_NAME + Config.BASE_URL_REST_V2
            + 'search?jql='
            + encodeURI(jql.replace(regex, jiraId));

        console.log(url);
        return url;
    }

    static putUrl(jiraId) {
        let url =
            Config.DOMAIN_NAME + Config.BASE_URL_REST_V2
            + 'issue/'
            + jiraId;

        console.log(url);
        return url;
    }

    static get(jql, jiraId, startAt = 0) {

        const auth = Buffer.from(Config.USER + ':' + Config.PASSWORD).toString('base64');
        const options = {
            uri: JiraSearch.getUrl(jql, jiraId),
            method: 'GET',
            headers: {
                Authorization: 'Basic ' + auth,
                'Content-Type': 'application/json'
            },
            rejectUnauthorized: false
        };

        // ASync calls
        return requestPromise(options, (error, response, data) => {
            let json = null;

            try {
                json = JSON.parse(data);
            } catch (e) {
                console.log(e);
                console.log(data);

                console.log('!!1!! Err');
                return {};
            }

            // console.log(json);
            return JiraSearch.json = json;
        });
    }

    static parse() {
        let items = [];
        for (let key in JiraSearch.json.issues) {

            items.push(
                {
                    id: JiraSearch.json.issues[key].id,
                    key: JiraSearch.json.issues[key].key,
                    summary: JiraSearch.json.issues[key].fields.summary
                }
            )
        }

        return items;
    }

    static updateSummary(jiraId, summary) {

        const auth = Buffer.from(Config.USER + ':' + Config.PASSWORD).toString('base64');
        const options = {
            uri: JiraSearch.putUrl(jiraId),
            method: 'PUT',
            headers: {
                Authorization: 'Basic ' + auth,
                'Content-Type': 'application/json'
            },
            body: {
                "fields": {
                    "summary": summary
                }
            },
            rejectUnauthorized: false,
            json: true // Automatically stringifies the body to JSON
        };

        // ASync calls

        return requestPromise(options, (error, response, data) => {
            console.log(response.statusCode); // 204 expected
            return;
        });
    }

    static updateDescription(jiraId, description) {

        const auth = Buffer.from(Config.USER + ':' + Config.PASSWORD).toString('base64');
        const options = {
            uri: JiraSearch.putUrl(jiraId),
            method: 'PUT',
            headers: {
                Authorization: 'Basic ' + auth,
                'Content-Type': 'application/json'
            },
            body: {
                "fields": {
                    "description": description
                }
            },
            rejectUnauthorized: false,
            json: true // Automatically stringifies the body to JSON
        };

        console.log(options);

        // ASync calls

        return requestPromise(options, (error, response, data) => {
            console.log(response.statusCode); // 204 expected
            // console.log(response); // 204 expected
            return;
        });
    }

}

module.exports = JiraSearch;
