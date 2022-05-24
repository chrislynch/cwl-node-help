const sqlite3 = require('sqlite3').verbose();
const { v1: uuidv1, v4: uuidv4, } = require('uuid');
/*
var db = new sqlite3.Database(':memory:');
*/
const options = {};

function path(newPath){
    if(newPath !== undefined){
        options.path = newPath
    }
    return options.path
}

function tableExists(table,callback){
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='" + table + "'",
    (err,row) => {
        if(row == undefined){
            callback(false)
        } else {
            if(row.name == table){
                callback(true)
            } else {
                callback(false)
            }
        }
        // console.log('tableExists(' + table + '): ' + ret)
    })
}

function connect(callback) {
    db = new sqlite3.Database(options.path)
    console.log('Opened ' + options.path)
    tableExists('proto',(indexExists) => {
        if(indexExists == false){
            console.log('Creating proto table')
            db.run(`
            CREATE TABLE proto (
                guid TEXT,
                "type" TEXT, class TEXT, template TEXT,
                name TEXT, uri TEXT, code TEXT,
                status INTEGER, flag INTEGER, rank INTEGER, system INTEGER,
                domain INTEGER, integration INTEGER, indexation INTEGER,
                parent TEXT,
                created TEXT, updated TEXT,
                data TEXT,
                CONSTRAINT index_PK PRIMARY KEY (guid)
            );
            `,undefined,function (err) {
                if(err == null){
                    console.log('Table proto created')
                    callback(db)
                } else {
                    callback(undefined,err)
                }
            })                
        } else {
            console.log('Table proto already exists')
            callback(db)    
        }
    })
}

function prepare(obj){
    // guid check
    if(obj.guid == '' || obj.guid == undefined){ obj.guid = uuidv1() + '-' + uuidv4() }
    // Type
    if(obj.type == '' || obj.type == undefined) { obj.type = '' } 
    // Class?
    if(obj.class == '' || obj.class == undefined) { obj.class = '' } 
    // Template?
    if(obj.template == '' || obj.template == undefined) { obj.template = '' } 
    // URI?
    if(obj.uri == '' || obj.uri == undefined) { obj.uri = '' } 
    // Code?
    if(obj.code == '' || obj.code == undefined) { obj.code = '' } 
    // Parent
    if(obj.parent == '' || obj.parent == undefined) { obj.parent = '' } 
    
    // Integer defaults
    integerProperties = ['status','flag','rank','system',
                         'domain','integration','integration','indexation']
    for(const i in integerProperties){
        obj[integerProperties[i]] = 0
    }
    // Date defaults
    var now = new Date()
    now = now.toISOString()
    if(obj.created == '' || obj.created == undefined){
        obj.created = now
    }
    obj.updated = now
}

function save(obj,callback){
    connect((db,err) => {
        if(err == undefined){
            // Prepare the object
            prepare(obj)
                
            // Save to the database
            db.run(`
                INSERT INTO proto(
                    guid,
                    type, class, template,
                    name, uri,
                    code, status, flag, rank,
                    system, domain, integration, indexation,
                    parent,
                    created, updated,
                    data
                ) 
                VALUES (?,
                        ?,?,?,
                        ?,?,
                        ?,?,?,?,
                        ?,?,?,?,
                        ?,
                        ?,?,
                        ?)`,
                [
                    obj.guid,
                    obj.type, obj.class, obj.template,
                    obj.name, obj.uri,
                    obj.code, obj.status, obj.flag, obj.rank,
                    obj.system, obj.domain, obj.integration, obj.indexation,
                    obj.parent,
                    obj.created, obj.updated,
                    JSON.stringify(obj)
                ],
                db.close(() => {
                    callback(obj)
                })
            )
        }
    })
}

function load(guid,callback){
    var obj = {}
    console.log("Loading " + guid)
    connect((db,err) => {
        db.each("SELECT * FROM proto WHERE guid = ?", [guid], 
                (err, row) => {
                    obj = JSON.parse(row.data)    
                },
                (err,rows) => {
                    console.log("Found " + rows + " rows")
                    db.close(() => {
                        callback(obj)
                    })
                });
    })    
}

function search(sql,params,callback){
    var objs = []
    console.log("Searching:" + sql)
    connect((db,err) => {
        db.each(sql, params, 
                (err, row) => {
                    objs.push(JSON.parse(row.data))    
                },
                (err,rows) => {
                    console.log("Found " + rows + " rows")
                    db.close(() => {
                        callback(objs)
                    })
                });
    })
}

function del(guid,callback){
    connect((db,err) => {
        db.run("DELETE FROM proto WHERE guid = ?", [guid], 
                () => {
                    callback(this)    
                });
    })

}

module.exports = {path,load,save,search,del}

/*

*/