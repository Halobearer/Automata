const fetch = require('node-fetch');
const fs = require('fs');

const adGuardUrl = 'https://raw.githubusercontent.com/blocklistproject/Lists/master/adguard/ads-ags.txt';
const outputFilename = 'converse.json';

const convertAdGuardToDeclarativeNetRequest = (line, id) => {

    const urlFilter = line.replace(/^\|\|/, '*://*.').replace(/\^$/, '/*');
    const resourceTypes = ['script', 'image', 'sub_frame'];
    return {
        id,
        priority: id,
        action: {
            type: 'block'
        },
        condition: {
            urlFilter,
            resourceTypes
        }
    };
};

export default convertAdGuardToDeclarativeNetRequest;

const convertAdGuardFileToDeclarativeNetRequestFile = async (url, filename) => {

    try {
        const response = await fetch(url);
        const text = await response.text();

        const lines = text.split('\n').filter(line => !line.startsWith('!') && !line.startsWith('['));

        let id = 1;
        const rules = [];
        for (const line of lines) {
            const rule = convertAdGuardToDeclarativeNetRequest(line, id);
            rules.push(rule);
            id++;
        }

        const json = JSON.stringify(rules);

        fs.writeFile(filename, json, (err) => {
            if (err) throw err;
            console.log(`Successfully converted ${url} to ${filename}`);
        });
    } catch (err) {
        console.error(err);
    }
};

convertAdGuardFileToDeclarativeNetRequestFile(adGuardUrl, outputFilename);
