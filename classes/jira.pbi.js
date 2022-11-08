/**
 * Jira operations on generic PBIs
 *
 * This class is used by bulk-sub_task.js
 *
 * @licence Wilfried Loche <wilfried.wl.loche@gmail.com>
 * @license GPL-3.0-or-later
 * @package bulk-duplicate
 */

const Config = require('./config.js');
var requestPromise = require('request-promise');

class JiraPbi {

    static get(jiraId) {

        const auth = Buffer.from(Config.USER + ':' + Config.PASSWORD).toString('base64');
        const options = {
            uri: Config.getIssueUrl().replace("%jiraId%", jiraId),
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
            JiraPbi.json = json;

            // console.log(JiraPbi.json.key);
            // console.log(JiraPbi.json.fields.project.id);
            // console.log(JiraPbi.json.fields.summary);
            return JiraPbi.json;
        });
    }


    static post(assignee) {
        console.debug(assignee);

        const body = {
            "fields": {
                "summary": "[" + assignee.name + "] " + JiraPbi.json.fields.summary,
                "parent": {
                    "key": JiraPbi.json.key
                },
                "issuetype": {
                    "id": "10003" // sub-task
                },
                "project": {
                  "id": JiraPbi.json.fields.project.id
                },
                "assignee": {
                    "id": assignee.id
                },
                "description": {
                    "version": 1,
                    "type": "doc",
                    "content": [{
                        "type": "heading",
                        "attrs": {"level": 3},
                        "content": [{"type": "text", "text": "Acceptance Criteria"}]
                    }, {
                        "type": "bulletList",
                        "content": [{
                            "type": "listItem",
                            "content": [{
                                "type": "paragraph",
                                "content": [{"type": "text", "text": "Refer the parent task"}]
                            }]
                        }]
                    }]
                }
            }
        };

        const auth = Buffer.from(Config.USER + ':' + Config.PASSWORD).toString('base64');
        const options = {
            uri: Config.DOMAIN_NAME + "/rest/api/3/issue",
            method: 'POST',
            headers: {
                Authorization: 'Basic ' + auth,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body),
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

            console.log(json);
        });
    }
}

module.exports = JiraPbi;
