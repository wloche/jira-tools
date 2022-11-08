/**
 * Bulk sub-task a JIRA item
 *
 * @licence Wilfried Loche <wilfried.wl.loche@gmail.com>
 * @license GPL-3.0-or-later
 * @package bulk-duplicates
 */

/* ###### Parameters to be updated ###### */
const JIRA_ID_PARENT = "DREG-642";
const users = [
    { "name" : "Jorge", "id": "5f04b6341a26ad0014f24136" },
    { "name" : "Artem", "id": "61bb53004fc7af00716b6e2f" },
    { "name" : "Kate", "id": "60b1474dc5196d007009e5ee" },
    { "name" : "Valera", "id": "6148f26578b7a1006aa9660f" },
    // { "name" : "Shou", "id": "605bce1bb18de5007101d957" },
];

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

const JiraPbi = require('./classes/jira.pbi.js');

process.on('unhandledRejection', error => {
    // Won't execute
    console.log('uxnhandledRejection', error);
    console.log('unhandledRejection', error.message);
});

JiraPbi.get(JIRA_ID_PARENT).then(() => {
    for (let assignee in users) {
        JiraPbi.post(users[assignee]);
    }
});