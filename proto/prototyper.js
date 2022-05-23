const sqlite3 = require('sqlite3').verbose();
const { v1: uuidv1, v4: uuidv4, } = require('uuid');
var db = new sqlite3.Database(':memory:');

async function tableExists(table){
    var ret = false
    db.serialize(() => {
        db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='" + table + "'",
            (err,row) => {
                if(row == undefined){
                    ret = false
                } else {
                    if(row.name == table){
                        ret = true
                    } else {
                        ret = false
                    }
                }
                console.log('tableExists(' + table + '): ' + ret)
                return ret
            })
        }
    )
}

async function connect(path) {
    db.close()
    db = new sqlite3.Database(path)
}

function init(){
    if(tableExists('index') == false){
        db.serialize(() => {
            db.run(`
            CREATE TABLE "index" (
                guid TEXT,
                "type" TEXT,
                class TEXT,
                template TEXT,
                name TEXT,
                uri TEXT,
                code TEXT,
                status INTEGER,
                flag INTEGER,
                rank INTEGER,
                system INTEGER,
                domain INTEGER,
                integration INTEGER,
                indexation INTEGER,
                parent TEXT,
                created TEXT,
                updated TEXT,
                data TEXT,
                CONSTRAINT index_PK PRIMARY KEY (guid)
            );
            `)
        })
    }
}

function prepare(obj){
    // guid check
    if(obj.guid == '' || obj.guid == undefined){ obj.guid = uuidv1() + '-' + uuidv4() }
    // Type

    // Class?

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

function save(obj){
    // Prepare the object
    prepare(obj)
    console.log(obj)
    return false

    // Save to the database
    /*
    db.serialize(() => {
        const stmt = db.prepare(`
            INSERT INTO index(
                guid,
                type,
                class,
                template,
                name,
                uri,
                code,
                status,
                flag,
                rank,
                system,
                domain,
                integration,
                indexation,
                parent,
                created,
                updated,
                data
            ) 
            VALUES (?)`);
        stmt.run(
            obj.guid,
            obj.type,
            obj.class,
            obj.template,
            obj.name,
            obj.uri,
            obj.code,
            obj.status,
            obj.flag,
            obj.rank,
            obj.system,
            obj.domain,
            obj.integration,
            obj.indexation,
            obj.parent,
            obj.created,
            obj.updated,
            JSON.stringify(data)
        );
        stmt.finalize();
    })
    return obj
    */
}

function load(guid){
    /*
    db.serialize(() => {
        db.each("SELECT rowid AS id, info FROM lorem", (err, row) => {
            console.log(row.id + ": " + row.info);
        });
    })
    */
}

function search(){

}

function del(){

}

module.exports = {connect,init,load,save,search,del}

/*

*/