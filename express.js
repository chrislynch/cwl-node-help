const express = require('express')
const session = require('express-session');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');

const helmet = require("helmet");

const fs = require('fs')
const ejs = require('ejs');

const app = express()

function ready(){
    
    app.use(helmet())

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(bodyParser.json({ extended: true }));

    app.use(session({
        resave: false, // don't save session if unmodified
        saveUninitialized: false, // don't create session until something stored
        secret: 'keyboard cat'
    }));

    app.use(fileUpload())

    app.use(express.static(process.cwd() + '/static'))

    return app
}

function go(){
    if(process.env['PORT'] !== undefined) { var port = process.env['PORT'] } else { var port = 3000}
    app.listen(port, () => {
        console.log("=============================")
        console.log("=============================")
        console.log(`App listening on port ${port}`)
        console.log("=============================")
        console.log("=============================")
    })

    return app
}

function steady(){

    app.get('*', (req, res) => {
        defaultHander(req,res)
    })

    app.post('*', (req, res) => {
        defaultHander(req,res)
    })

    app.put('*', (req, res) => {
        defaultHander(req,res)
    })

    app.patch('*', (req, res) => {
        defaultHander(req,res)
    })

    app.delete('*', (req, res) => {
        defaultHander(req,res)
    })
}

async function defaultHander(req,res) {  

    var html = ''

    var routefile = process.cwd() + '/routes' + req.path + '.js'
    if(routefile == process.cwd() + '/routes/.js') { routefile = process.cwd() + '/routes/index.js' }
    console.log('Route: ' + routefile)  

    if(fs.existsSync(routefile)){
        var route = require(routefile);
        data = req.session.data
        if(data == undefined) { data = {} }
        console.log('Start Data: ' + JSON.stringify(data,null,2))

        if(route.go){    
            res.setHeader('Content-Type', 'application/json');
            next = await route.go(req, res, data)
            req.session.data = data
            console.log('End Data: ' + JSON.stringify(data,null,2))
            if(next !== undefined){
                if(next.length > 0){
                    console.log('Redirection: ' + next)
                    res.redirect(next)
                    return
                }
            }
        }

        var templatefile = process.cwd() + '/views' + req.path + '.html'
        if(templatefile == process.cwd() + '/views/.html') { templatefile = process.cwd() + '/views/index.html'; }
        console.log('Template: ' + templatefile)
        
        if(fs.existsSync(templatefile)){
            template = fs.readFileSync(templatefile,'utf8')
            html = ejs.render(template,data,{
                    root: process.cwd(),
                    _with: false
            })
            
        } else {
            console.log('No template')
            html = ''
        }

        if(html !== ''){
            res.header('Content-type', 'text/html')
            res.send(
                html
            )
        }

    } else {
        console.log('Error: 404')
        res.status(404).send("Page not found")
    }

}


module.exports = { ready,steady,go }