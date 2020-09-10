/**
 * Bulk rename JIRA items
 *
 * @licence Wilfried Loche <wilfried.wl.loche@gmail.com>
 * @license GPL-3.0-or-later
 * @package jira-tools
 */

/* ###### Parameters to be updated ###### */
const JQL = '"Epic Link" = jiraId OR issueFunction in subtasksOf("\\"Epic Link\\"=jiraId")';
const JIRA_ID_PARENT = 'BAUS-5314';
const PATTERN_SEARCH = 'DS-';
const PATTERN_REPLACE = 'Recall-';
/* ###### End of parameters section ###### */

const fs = require('fs')

if (!fs.existsSync('classes/config.js')) {
    console.error(
        '/!\\ classes/config.js is not found /!\\'
        + '\n- Make sure you copied classes/config-dist.js and renamed it to classes/config.js.'
        + '\n- Finally, you\'ll need to replace the values with your credentials and Jira domain name'
    );
    return;
}

const JiraSearch = require('./classes/jira.search.js');

process.on('unhandledRejection', error => {
    // Won't execute
    console.log('uxnhandledRejection', error);
    console.log('unhandledRejection', error.message);
});


JiraSearch.get(JQL, JIRA_ID_PARENT).then(() => {
    JiraSearch.parse().forEach(function (item) {
        let summary = item.summary;
        if (summary.indexOf(PATTERN_SEARCH) < 0) {
            return;
        }

        const s = summary.replace(PATTERN_SEARCH, PATTERN_REPLACE);
        JiraSearch.updateSummary(item.key, s);
    });
});

