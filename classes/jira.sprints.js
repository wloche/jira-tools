/**
 * Sprints statistics
 *
 * @licence Wilfried Loche <wilfried.wl.loche@gmail.com>
 * @license GPL-3.0-or-later
 * @package sprints-stats
 */

var requestPromise = require('request-promise');
var request = require('sync-request');

const moment = require('moment');

class JiraSprints {

    constructor(config, team) {
      this.sprints = {};
      this.config  = config;
      this.team    = team;
    }

    static get(jiraSprints, startAt = 0) {
        if (!jiraSprints.sprints) {
            jiraSprints.sprints = {};
        }

        const auth = Buffer.from(jiraSprints.config.USER + ':' + jiraSprints.config.PASSWORD).toString('base64');
        const options = {
            uri: jiraSprints.config.getSprintsUrl()
                .replace("%boardId%", jiraSprints.team.boardId)
                .replace("%startAt%", startAt),
            method: 'GET',
            headers: {
                Authorization: 'Basic ' + auth,
                'Content-Type': 'application/json'
            },
            rejectUnauthorized: false
        };

        if (jiraSprints.config.async) {
            // ASync calls
            if (jiraSprints.config.debug) {
                console.debug("ASync Call for " + jiraSprints.team + ", startAt=" + startAt);
            }

            return requestPromise(options, (error, response, data) => {
                let json = null;

                try {
                    json = JSON.parse(data);
                } catch (e) {
                    console.log(e);
                    console.log(data);

                    console.log('!!1!! ' + jiraSprints.team.name + ', Err');
                    return {};
                }

                jiraSprints.sprints = jiraSprints.parseJson(json);
                //console.log(jiraSprints.sprints);
                return jiraSprints.sprints;
            });
        } else {
            // Sync calls
            if (jiraSprints.config.debug) {
                console.debug("SYNC Call for " + jiraSprints.team.name + ", startAt=" + startAt);
            }

            let res = null;
            try {
                res = request(options.method, options.uri, {
                    headers: {
                        Authorization: 'Basic ' + auth,
                        'Content-Type': 'application/json'
                    }, rejectUnauthorized: 0, strict: false
                });
            } catch (e) {
                console.log("Cannot fetch " + options.uri);
                console.log(e);
                return {};
            }

            let json = null;

            try {
                json = JSON.parse(res.getBody());
            } catch (e) {
                console.log(e);
                console.log(json);

                console.log('!!1!! ' + jiraSprints.team.name + ', Err');
                return {};
            }

            jiraSprints.sprints = Object.assign(jiraSprints.sprints, jiraSprints.parseJson(json));
            //console.log(jiraSprints.sprints);
            if (!json.isLast) {
                //console.log("Not last: jumping to", startAt + json.maxResults);
                return JiraSprints.get(jiraSprints, startAt + json.maxResults);
            }

            return jiraSprints.sprints;
        }
    }
    
    getName(id) {
        return this.sprints[id].name;
    }
    
    parseJson(json) {
        /*
         * [ { id: 1677,
         * self: 'http://suus0002.w10:8080/rest/agile/1.0/sprint/1677',
         * state: 'closed',
         * name: 'Bender V3.0 Sprint 16',
         * startDate: '2017-05-15T13:50:23.956-05:00',
         * endDate: '2017-05-22T13:50:00.000-05:00',
         * completeDate: '2017-05-22T11:02:01.690-05:00',
         * originBoardId: 90 },
         * //...
         * ]
         */
        //console.log(json);
        
        // Match // 2018.07 S2 Isetta
        //##var sprintRegExp = /20\d\d\.\d\d S[1-3]/i;
        
        // Match // 2018 WK42 Kraftwerk
        const sprintRegExp = /20\d\d WK ?\d+/i;
        let sprints = {};
        
        for (let i = 0, len = json.values.length; i < len; i++) {
            if (
                json.values[i].originBoardId == this.team.boardId
                && json.values[i].state == "closed"
                && json.values[i].name.match(sprintRegExp)
            ) {
                sprints[json.values[i].id] = {
                    "id":       json.values[i].id,
                    "name":     json.values[i].name,
                    "start":    json.values[i].startDate,
                    "end":      json.values[i].endDate,
                    "complete": json.values[i].completeDate
                };
                //console.log("++ Sprint ++: " + json.values[i].name);
            } /* else {
                let status
                    = (json.values[i].state == "closed")
                    ? (
                        (json.values[i].originBoardId == this.team.boardId)
                        ? "Wrong naming" : "Not the same Board ID"
                    )
                    : "Sprint not closed";
                console.log("-- Sprint --: " + json.values[i].name + "; " + status);
            } */
        }
        
        //console.log(sprints);
        return sprints;
    }

    /**
     * Get the Prefixes only, sorted.
     * f.e.  [ '2018 WK51', '2019 WK01', '2019 WK03', '2019 WK05' ]
     *
     * @returns {Array}
     */
    getPrefixes() {
        const sprintRegExp = /(20\d\d) WK ?(\d+) /i;
        let sprints = [];

        for (let key in this.sprints) {
            /*
            { id: 3994,
              name: '2019 WK05 Kraftwerk',
              start: '2019-01-30T09:58:16.513-06:00',
              end: '2019-02-11T18:00:00.000-06:00',
              complete: '2019-02-12T03:50:01.337-06:00' }
             */

            let res = this.sprints[key].name.match(sprintRegExp);
            if (!res) {
                console.error("Sprint bad format: " + this.sprints[key].name);
            } else {
                sprints.push(res[1] + "WK" + res[2]);
            }
        }
//        console.log(sprints.sort());

        return sprints.sort();
    }

    /**
     * Add 2 weeks at the given sprint
     *
     * @param prefix string  "2019WK05"
     * @param length integer 2 weeks
     *
     * @return string "2019WK07"
     */
    static getNextPrefix(prefix, length = 2) {
        let year = moment(prefix, "YYYYWKww").add(length, "weeks").format('YYYY');
        let week = moment(prefix, "YYYYWKww").add(length, "weeks").format('ww');

        return year + "WK"+ week;
    }

    toString() {
        var s = "<< Sprints >>\n";
        
        for (var key in this.sprints) {
            s += JSON.stringify(this.sprints[key]) + "\n";
        }
        
        return s;
    }
}

module.exports = JiraSprints;
