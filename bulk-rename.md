# Bulk Rename

## Pre-requisite
So far, tested on [Atlassian Jira](https://www.atlassian.com/software/jira) v8.5.1, might work on other versions... or not :).

## Purpose
Based on a `JQL`, it will search in the summaries for `PATTERN_SEARCH` and replace it by `PATTERN_REPLACE`.


## Install
```bash
# install the dependencies with npm
$ npm install
```

## How to use it

### `config.js`
Copy `classes/config-dist.js` and renamed it to `classes/config.js`
Replace the values with your credentials and Jira domain name.

```javascript
const Config = {
    USER: '##USER##',
    PASSWORD: '##PASSWORD##',
    BASE_URL: 'https://##your-jira-server##/jira/rest/api/2/',
}

### `bulk-rename.js`
Update the 4 constants as you please, supposedly self-explanatory:

```javascript
const JQL = '"Epic Link" = jiraId OR issueFunction in subtasksOf("\\"Epic Link\\"=jiraId")';
const JIRA_ID_PARENT = 'BAUS-5314';
const PATTERN_SEARCH = 'DS-';
const PATTERN_REPLACE = 'Recall-';
```

## Run
```bash
$ node bulk-rename.js
```
