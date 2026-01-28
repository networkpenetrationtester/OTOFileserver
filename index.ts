import express from 'express'
import fs from 'node:fs';
import path from 'path';

const app = express();
const dir = import.meta.dirname;

type $config = {
    "mode": "old" | "modern",
    "resource_url": {
        "modern": string,
        "old": string
    }
}

const config: $config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

// I thought I'd do path.join for crossplatform but now I realize the game only has builds for windows :facepalm:

console.log(config);
let resources_url = new URL(config.resource_url[config.mode]);
const is_web = (resources_url.host != null && resources_url.origin !== 'null');
console.log(`Configured resource path is ${is_web ? 'web' : 'local'}`);

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

async function GetResource(url: string, is_web: boolean, _config?: $config): Promise<string | null> {
    // I have no clue what I'm doing bro
    // Array buffers ain't work figure this shit out
    _config ??= config;
    if (is_web) {
        let webpath = _config.resource_url[_config.mode];
        console.log(`Forwarding to ${webpath + url}`);
        try {
            return (await (await fetch(webpath + url)).text());
        } catch (e) {
            console.log(e);
            return null;
        }
    } else {
        let filepath = path.join(_config.resource_url[_config.mode], url.split('?')[0]);
        if (fs.existsSync(filepath) && !fs.statSync(filepath).isDirectory()) {
            let file = fs.readFileSync(filepath, 'utf8');
            return file;
        } else {
            return null;
        }
    }
}

app.get('/resources/*resource', async (req, res) => {
    // if protocol is not http or https, or origin is null, then its a local path maybe
    // switch mode, direct to downloaded resources/otgithub if "modern", otherwise, forward to real resources server
    if (resources_url.href !== '' && resources_url.pathname !== '') { // try ig
        let resource = await GetResource(req.url, is_web);
        if (resource) {
            try {
                res.type(path.basename(req.url).split('\.')[1]);
                res.send(resource);
                // this breaks if for example a 404 error page appears in HTML
            } catch (e) {
                console.log(e);
                res.sendStatus(500);
            }
        } else {
            res.sendStatus(404);
        }
    }
});

app.listen(8080);