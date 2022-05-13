// const items = ['MAR-29', 'MAR-28', 'MAR-27', 'MAR-23', 'MAR-18', 'MAR-17', 'MAR-15', 'MAR-14', 'MAR-11', 'MAR-2', 'MAR-47', 'MAR-35', 'MAR-1', 'MAR-21', 'MAR-13', 'MAR-12', 'MAR-49', 'MAR-46', 'MAR-45', 'MAR-40', 'MAR-38', 'MAR-20', 'MAR-19', 'MAR-10', 'MAR-43', 'MAR-42', 'MAR-33', 'MAR-22', 'MAR-9', 'MAR-8', 'MAR-7', 'MAR-6', 'MAR-5', 'MAR-4', 'MAR-3', 'MAR-52', 'MAR-51', 'MAR-50', 'MAR-41', 'MAR-16', 'MAR-26', 'MAR-25', 'MAR-44', 'MAR-31', 'MAR-30', 'MAR-32', 'MAR-34'];
const items = ['CWP-1092'];
// const items = ['CWP-1165', 'CWP-1164', 'CWP-1163', 'CWP-1162', 'CWP-1161', 'CWP-1160', 'CWP-1159', 'CWP-1158', 'CWP-1157', 'CWP-1100', 'CWP-1098', 'CWP-1097', 'CWP-1095', 'CWP-1093'];
// url = 'https://spotonteam.atlassian.net/rest/internal/2/issue/MAR-17/activityfeed';s

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
const JiraItemsHistory = require('./classes/jira.items.history.js');



items.forEach(function (jiraId) {
    JiraItemsHistory.get(jiraId).then(() => {
        console.log('/' + jiraId);

        // PUT https://spotonteam.atlassian.net/rest/internal/3/issue/CWP-1114/description


        /*

         */

        // PUT /rest/api/3/issue/{issueIdOrKey}

        /*
         {
          "update": {
    "summary": [
      {
        "set": "Bug in business logic"
      }
    ]
    }

    ---or---
    { "fields": { "description": "Completed orders still displaying in pending" } }
         */
    });
});


// jira = new JiraItemsHistory('description');
// jira.parse()




