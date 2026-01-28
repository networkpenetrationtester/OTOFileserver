import express from 'express'
import fs from 'node:fs';
import path from 'path';

const app = express();
const dir = import.meta.dirname;

type $config = {
    "mode": "old" | "modern",
    "resources": {
        "modern": string,
        "old": string
    }
}

const _config: $config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

// I thought I'd do path.join for crossplatform but now I realize the game only has builds for windows :facepalm:

console.log(_config);

const RequestStamper: express.RequestHandler = (req, res, next) => {
    console.log(
        [
            '[' + new Date().toUTCString() + ']',
            req.host,
            req.method,
            req.url,
            req.body ? 'Request Body:' + JSON.stringify(req.body) : '\b',
        ].join('\t'));
    return next();
}

app.use(RequestStamper);

app.get('/Prelauncher.swf', (req, res) => {
    res.sendFile(path.join(dir, 'www', 'Prelauncher.swf'));
    return;
});

app.get('/Loader.swf', (req, res) => {
    res.sendFile(path.join(dir, 'www', 'Loader.swf'));
    return;
});

app.get('/battles_test.swf', (req, res) => {
    res.sendFile(path.join(dir, 'www', 'battles_test.swf'));
    return;
});

app.get('/socket_test.cfg', (req, res) => {
    res.sendFile(path.join(dir, 'www', 'socket_test.cfg'));
    return;
});

function GetResource(version: 'old' | 'modern', is_web: boolean, res: express.Response<any>, config?: $config) {
    config ??= _config;
    if (is_web) {

    } else {
        // try file loading
        // fs.exists
    }
}

app.get('/resources/:resource', async (req, res) => {
    let url = new URL(_config.resources[_config.mode]);
    let is_web = (url.host != null && url.origin !== 'null') && url.href && url.pathname;
    // if protocol is not http or https, or origin is null, then its a local path maybe
    // switch mode, direct to downloaded resources/otgithub if "modern", otherwise, forward to real resources server
    switch (_config.mode) {
        case 'modern':
            if (is_web) {

            } else {

            }
            let filepath = path.join('', req.params.resource.split('?')[0]);
            res.sendFile(filepath);
            return;
        case 'old':
            let x = await (await (fetch('https://resources.oldtanksonline.ru/Loader.swf' + req.url))).arrayBuffer();
            res.send
            // let y = new DataView(x);
            // fs.writeFileSync('test.bin', y);
            return;
    }
    return;
});

app.listen(8080);