const Request = require("./Request.js");

function fixMessage(message) {
    message = message.replace(/&#x2019;/g, "'");
    message = message.replace(/&amp;/g, "&");
    message = message.replace(/&#x27;/g, "'");
    message = message.replace(/&#x1F332;/g, "🌲");

    return message;
}

/**
 * @returns {{trees: number, top: Array<{name: string, trees: number, message: string, timestamp: number}>, recent: Array<{name: string, trees: number, message: string, timestamp: number>}}
 */
function getAllStatistics() {
    return new Promise((resolve, reject) => {
        Request.get("https://teamtrees.org").then(res => {
            let data = {};
            let match = res.match(/<div id="totalTrees" class=".*?" data-count="([0-9]*)">[0-9]*?<\/div>/);
            if (match) {
                data.totalTrees = Number(match[1]);
            }

            let top = [];
            let matches = res.match(/<div class=".*?" data-trees-top="[0-9]+">.*?<\/div>/gms);
            if (matches) {
                for (let i = 0; i < matches.length; i++) {
                    const match = matches[i].match(/<div class=".*?" data-trees-top="([0-9]+)">.*?<strong class=".*?">(.*?)<\/strong>.*?<span class="feed-datetime .*?">(.*?)<\/span>.*?<span class=".*?">(.*?)<\/span>.*?<\/div>/ms);
                    if (match) {
                        match[4] = fixMessage(match[4]);
                        top.push({
                            name: match[2],
                            trees: Number(match[1]),
                            message: match[4],
                            timestamp: new Date(match[3]).getTime()
                        });
                    }
                }
            }
            data.top = top;
        
            let recent = [];
            matches = res.match(/<div class="media pt-3">.*?<\/div>/gms);
            if (matches) {
                for (let i = 0; i < matches.length; i++) {
                    const match = matches[i].match(/<strong class=".*?">(.*?)<\/strong>.*?<span class=".*?">([0-9]*) trees<\/span>.*?<span class=".*?">(.*?)<\/span>.*?<span class=".*?">(.*?)<\/span>/ms);
                    if (match) {
                        match[4] = fixMessage(match[4]);
                        recent.push({
                            name: match[1],
                            trees: Number(match[2]),
                            message: match[4],
                            timestamp: new Date(match[3]).getTime()
                        });
                    }
                }
            }
            data.recent = recent;
            return resolve(data);
        }).catch(err => {
            return reject(err);
        });
    });
}

/**
 * @returns {number} Total amount of trees planted until now
 */
function getTotalTrees() {
    return new Promise((resolve, reject) => {
        getAllStatistics().then(data => {
            return resolve(data.totalTrees);
        }).catch(err => {
            return reject(err);
        })
    });
}

/**
 * @returns {[{name: string, trees: number, message: string, timestamp: number}]} Array of most recent donations
 */
function getRecentDonations() {
    return new Promise((resolve, reject) => {
        getAllStatistics().then(data => {
            return resolve(data.recent);
        }).catch(err => {
            return reject(err);
        })
    });
}

/**
 * @returns {[{name: string, trees: number, message: string, timestamp: number}]} Array of top donations
 */
function getTopDonations() {
    return new Promise((resolve, reject) => {
        getAllStatistics().then(data => {
            return resolve(data.top);
        }).catch(err => {
            return reject(err);
        })
    });
}

module.exports = {
    "getAllStatistics": getAllStatistics,
    "getTrees": getTotalTrees,
    "getRecent": getRecentDonations,
    "getTop": getTopDonations
};