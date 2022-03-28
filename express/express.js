const express = require('express')
const session = require('express-session');
const fileUpload = require('express-fileupload');

const helmet = require("helmet");

const fs = require('fs')
const ejs = require('ejs');

const app = express()

function ready(){
    
    app.use(helmet())

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use(session({
        resave: false, // don't save session if unmodified
        saveUninitialized: false, // don't create session until something stored
        secret: 'keyboard cat'
    }));

    app.use(fileUpload())

    app.use(express.static(process.cwd() + '/static'))

    /*
    routes = require('./routes.js')
    routes.routes(app)
    */

    return app
}

function go(port = 3000){
    app.listen(port, () => {
        console.log(`App listening on port ${port}`)
    })

    return app
}

function addDefaultHandler(app){
    /*
    app.all('*', (req,res,next) => {
        if (fs.existsSync(routefile)){
            var bootstrap = require(routefile);
        }
        next()
    })
    */

    app.get('*', (req, res) => {
        defaultHander(req,res)
    })

    app.post('*', (req, res) => {
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

        if(route.go){    
            next = await route.go(req, res, data)
            // console.log('Data: ' + "\n" + JSON.stringify(data,null,2))
        
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
            html = ejs.render(template,data)
            
        } else {
            console.log('Error: No template')
            html = ''
        }

        res.send(
            `<html>
                <head>
                    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.min.js" integrity="sha384-QJHtvGhmr9XOIpI6YVutG+2QOK9T+ZnN4kzFN1RtK3zEFEIsxhlmWl5/YESvpZ13" crossorigin="anonymous"></script>
                    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">
                </head>
                <body>
            ` + html + `
                </body>
            </html>`
        )
        

    } else {
        console.log('Error: 404')
        res.status(404).send("Page not found")
    }

}


module.exports = { ready,addDefaultHandler,go }