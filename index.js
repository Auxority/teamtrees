const request = require("request-promise");

function fixMessage(message) {
    message = message.replace(/&#x2019;/g, "'");
    message = message.replace(/&amp;/g, "&");
    message = message.replace(/&#x27;/g, "'");
    message = message.replace(/&#x1F332;/g, "🌲");

    return message;
}

/**
 * Used to get current team trees statistics
 * @param {boolean} trees 
 * @param {boolean} topDonations 
 * @param {boolean} recentDonations
 * @returns {object} 
 */
async function getStatistics(trees, topDonations, recentDonations) {
    return new Promise(resolve => {
        request(`https://teamtrees.org/`).then(res => {
            let data = {};
            if (trees) {
                const match = res.match(/<div id="totalTrees" class=".*?" data-count="([0-9]*)">[0-9]*?<\/div>/);
                if (match) {
                    data.trees = Number(match[1]);
                }
            }
            if (topDonations) {
                let top = [];
                const matches = res.match(/<div class=".*?" data-trees-top="[0-9]+">.*?<\/div>/gms);
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
            }
            if (recentDonations) {
                let recent = [];
                const matches = res.match(/<div class="media pt-3">.*?<\/div>/gms);
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
            }
            return resolve(data);
        }).catch(err => {
            console.error(err);
            return resolve(null);
        });
    });
}

module.exports = getStatistics;