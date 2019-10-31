# TeamTrees API

This Api was made to allow developers to obtain information from https://teamtrees.org/  
The plan of TeamTrees is to plant 20 million trees by the 1st of January 2020

**Usage:**
```JS
const teamTrees = require("teamtrees");

teamTrees.getAllStatistics().then(console.log).catch(console.error); //Returns all statistics of the website
teamTrees.getTrees().then(console.log).catch(console.error); //Returns the total amount of trees planted until now
teamTrees.getRecent().then(console.log).catch(console.error); //Returns the most recent donations
teamTrees.getTop().then(console.log).catch(console.error); //Returns the top donations
```

**Github:**
https://github.com/Auxority/teamtrees
