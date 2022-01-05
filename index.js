const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');

const config = require('./config.json')

const app = express()
app.disable('etag').disable('x-powered-by');

const { exec } = require('child_process')
app.post('/', (req, res) => {
    if(!req.query.token) return res.sendStatus(401)
    if(!req.query.port) return res.sendStatus(400)
    if(req.query.token !== config.Keys.Token) return res.sendStatus(401)
    let port = parseInt(req.query.port.toString(8))
    if(port < 1 || port > 65535) return res.sendStatus(400)
    
    exec(config.Commands.Post.join(" && ").replace("<port>", port),
     (error, stdout, stderr) => {
        if (error) {
            console.log(`err: ${error}`)
            return res.sendStatus(500)
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return res.sendStatus(500)
        }
        if(stdout.includes("success")) {
            console.log(`stdout: ${stdout}`)
            return res.sendStatus(200)
        }
        console.log(`stdout: ${stdout}`)
        res.sendStatus(200)
    });
})

app.delete('/', (req, res) => {
    if(!req.query.token) return res.sendStatus(401)
    if(!req.query.port) return res.sendStatus(400)
    if(req.query.token !== config.Keys.Token) return res.sendStatus(401)
    let port = parseInt(req.query.port.toString(8))
    if(port < 1 || port > 65535) return res.sendStatus(400)
    
    exec(config.Commands.Delete.join(" && ").replace("<port>", port),
     (error, stdout, stderr) => {
        if (error) {
            console.log(`err: ${error}`)
            return res.sendStatus(500)
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return res.sendStatus(500)
        }
        if(stdout.includes("success")) {
            console.log(`stdout: ${stdout}`)
            return res.sendStatus(200)
        }
        console.log(`stdout: ${stdout}`)
        res.sendStatus(200)
    });
})
if(config.Port === "8080"){
    const httpServer = http.createServer(app);

    httpServer.listen(8080, ()=>{
        console.log("[HTTP] Running on port " + 8080)
        exec('sudo service firewalld start');
    })
    
} else if (config.Port === "8443"){
    const privateKey  = fs.readFileSync(config.Keys.Private, 'utf8');
    const certificate = fs.readFileSync(config.Keys.Public, 'utf8');
    const credentials = {key: privateKey, cert: certificate};
    const httpsServer = https.createServer(credentials, app);
    httpsServer.listen(8443, () => {
        console.log("[HTTPS] Running on port " + 8443)
        exec('sudo service firewalld start');
    })
}


