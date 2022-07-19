/* 
* A wrapper to make Mongo work in a predicatable way
* Borrows from proto.js to give all objects a predefined set of fields
* Allowing for easier interaction between objects
*/

const mongo = require('mongodb').MongoClient
const { v1: uuidv1, v4: uuidv4, } = require('uuid');
const { isNumber } = require("util")

// TODO: Make the url configurable and throw an error if it is not there
var url = 'mongodb://root:example@smr-mongo-1:27017'
var dbName = 'SMR'

function deepset(obj,path,value){
    if(typeof path == 'object'){
        for (const key in path) {
            deepset(obj,key,path[key])
        }
    } else {
        console.log("Setting " + path + " to " + value)
        path = path.toString().split('.')
        if(path.length > 1){
            key = path[0]
            if(obj[key] == undefined){
                if(isNumber(key)){
                    obj[key] = []
                } else {
                    obj[key] = {}
                }
            }
            path.shift()
            path = path.join('.')
            deepset(obj[key],path,value)
        } else {
            obj[path[0]] = value
        }
    }
}

function prepare(obj){
    // guid
    if(obj.guid == '' || obj.guid == undefined){ obj.guid = uuidv1() + '-' + uuidv4() }
        
    // Date defaults
    var now = new Date()
    now = now.toISOString()
    if(obj.created == '' || obj.created == undefined){
        obj.created = now
    }
    obj.updated = now
}

function prepareCollection(mydb,collectionName,callback){
    try {
        mydb.listCollections({ name: collectionName}).next((err,info) => {
            if(err) throw err
            if(info){
                console.log(collectionName + " collection exists")
                callback(null,true)
            } else {
                mydb.createCollection(collectionName, (err,res) => {
                    if(err) throw (err)
                    console.log(collectionName + " collection created")
                    mydb.collection(collectionName).createIndex( { "guid": 1}, { unique: true}, (err,info) => {
                        if(err) throw err
                        callback(null,true)
                    })
                })
            }
        })    
    } catch (error) {
        callback(error,false)        
    }
}

function get(collection,query,callback,sort = {}, limit = 0, skip = 0){
    // Retrieve one or more items from mongo
    mongo.connect(url,(err,db) => {
        if(err) { 
            callback(err)
        } else {
            console.log("Mongo lives")
            var mydb = db.db(dbName)
            mydb.collection(collection).find(query).sort(sort).limit(limit).skip(skip).toArray((err,result) =>{
                if(err) {
                    callback(err)
                } else {
                    /*
                    console.log('Retrieved')
                    console.log(result)
                    console.log('---------')
                    */
                    callback(err,result)
                    db.close()
                }
            })
        }
    })
}

function post(collection,obj,callback){
    // Saves this one item to mongo, if certain checks are passed.
    
    // Prepare the object
    prepare(obj)
    console.log("Prepared")
    console.log(obj)
    
    try {
        mongo.connect(url,(err,db) => {
            if(err) throw err
            console.log("Mongo lives")
            var mydb = db.db(dbName)
            // Check if our collection exists, if not create it
            prepareCollection(mydb,collection,(err,res) => {
                if(err) throw err
                // Now insert/upsert the item(s)
                if(obj.guid == undefined){
                    mydb.collection(collection).insertOne(obj,(err,res) => {
                        if(err) throw err
                        console.log(obj.guid + " saved to " + collection + " collection")
                        db.close()
                        callback(null,obj)
                    })
                } else {
                    mydb.collection(collection).replaceOne({ guid: obj.guid }, obj, { upsert: true}, (err,res) => {
                        if(err) throw err
                        console.log(obj.guid + " saved to " + collection + " collection")
                        db.close()
                        callback(null,obj)
                    })
                }
            })
        })
    } catch (error) {
        callback(error)
    }    
}

// Patches an object with some changes
function patch(obj,callback){
    throw new Error('PATCH not yet implemented')
}

// Deletes an object
// Only allow deletion of items by guid
function del(collection,guid){
    throw new Error('DELETE not yet implemented')
}

module.exports = { get, post, deepset}