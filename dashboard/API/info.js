/////////////////////////////////////////////////////////////////////////////////////////////
//////////  HIYOSHI INFO DASHBORAD //////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////

const express = require('express')
const api = express()

    // for parsing application/json
    api.use(express.json())

    // for parsing application/x-www-form-urlencoded
    api.use(express.urlencoded({ extended: true })) 


// maria DB Connection Setting ////////
const mariadb = require('mariadb');

const maria = mariadb.createPool({
     host     : process.env.DB_HOST,
     user     : process.env.DB_USER,
     password : process.env.DB_PASS,
     database : process.env.DB_INFO,
     connectionLimit: 1
});


// LINE bot Setting
const line = require('@line/bot-sdk');
/*
const client = new line.Client({
  channelAccessToken: process.env.ACCESS_TOKEN
});
*/


/// HELPER FUNCTIONS ///////////////////////////////////////////////////////////////////////

// 日付処理系
function getNow(){

  var d     = new Date();
  var year  = d.getFullYear();
  var month = d.getMonth() + 1;
  var day   = d.getDate();
  var hour  = ( '00' + d.getHours() ).slice( -2 );
  var min   = ( '00' + d.getMinutes() ).slice( -2 );
  var sec   = ( '00' + d.getSeconds() ).slice( -2 );
  return `${year}-${month}-${day} ${hour}:${min}:${sec}`

}

function enDate( da ){

  var d     = new Date( da );
  var year  = d.getFullYear();
  var month = d.getMonth() + 1;
  var day   = d.getDate();
  var hour  = ( '00' + d.getHours() ).slice( -2 );
  var min   = ( '00' + d.getMinutes() ).slice( -2 );
  var sec   = ( '00' + d.getSeconds() ).slice( -2 );
  return `${year}/${month}/${day} ${hour}:${min}`

}

function unixTime(){

    var date = new Date()
    var a = date.getTime()
    return Math.floor( a / 1000 )

}



const PHP = {
    stdClass: function() {},
    stringify(val) {
        const hash = new Map([[Infinity, "d:INF;"], [-Infinity, "d:-INF;"], [NaN, "d:NAN;"], [null, "N;"], [undefined, "N;"]]); 
        const utf8length = str => str ? encodeURI(str).match(/(%.)?./g).length : 0;
        const serializeString = (s,delim='"') => `${utf8length(s)}:${delim[0]}${s}${delim[delim.length-1]}`;
        let ref = 0;
        
        function serialize(val, canReference = true) {
            if (hash.has(val)) return hash.get(val);
            ref += canReference;
            if (typeof val === "string") return `s:${serializeString(val)};`;
            if (typeof val === "number") return  `${Math.round(val) === val ? "i" : "d"}:${(""+val).toUpperCase().replace(/(-?\d)E/, "$1.0E")};`;
            if (typeof val === "boolean") return  `b:${+val};`;
            const a = Array.isArray(val) || val.constructor === Object;
            hash.set(val, `${"rR"[+a]}:${ref};`);
            if (typeof val.serialize === "function") {
                return `C:${serializeString(val.constructor.name)}:${serializeString(val.serialize(), "{}")}`;
            }
            const vals = Object.entries(val).filter(([k, v]) => typeof v !== "function");
            return (a ? "a" : `O:${serializeString(val.constructor.name)}`) 
                + `:${vals.length}:{${vals.map(([k, v]) => serialize(a && /^\d{1,16}$/.test(k) ? +k : k, false) + serialize(v)).join("")}}`;
        }
        return serialize(val);
    },
    // Provide in second argument the classes that may be instantiated
    //  e.g.  { MyClass1, MyClass2 }
    parse(str, allowedClasses = {}) {
        allowedClasses.stdClass = PHP.stdClass; // Always allowed.
        let offset = 0;
        const values = [null];
        const specialNums = { "INF": Infinity, "-INF": -Infinity, "NAN": NaN };

        const kick = (msg, i = offset) => { throw new Error(`Error at ${i}: ${msg}\n${str}\n${" ".repeat(i)}^`) }
        const read = (expected, ret) => expected === str.slice(offset, offset+=expected.length) ? ret 
                                         : kick(`Expected '${expected}'`, offset-expected.length);
        
        function readMatch(regex, msg, terminator=";") {
            read(":");
            const match = regex.exec(str.slice(offset));
            if (!match) kick(`Exected ${msg}, but got '${str.slice(offset).match(/^[:;{}]|[^:;{}]*/)[0]}'`);
            offset += match[0].length;
            return read(terminator, match[0]);
        }
        
        function readUtf8chars(numUtf8Bytes, terminator="") {
            const i = offset;
            while (numUtf8Bytes > 0) {
                const code = str.charCodeAt(offset++);
                numUtf8Bytes -= code < 0x80 ? 1 : code < 0x800 || code>>11 === 0x1B ? 2 : 3;
            }
            return numUtf8Bytes ? kick("Invalid string length", i-2) : read(terminator, str.slice(i, offset));
        }
        
        const create = className => !className ? {}
                    : allowedClasses[className] ? Object.create(allowedClasses[className].prototype)
                    : new {[className]: function() {} }[className]; // Create a mock class for this name
        const readBoolean = () => readMatch(/^[01]/, "a '0' or '1'", ";");
        const readInt     = () => +readMatch(/^-?\d+/, "an integer", ";");
        const readUInt    = terminator => +readMatch(/^\d+/, "an unsigned integer", terminator);
        const readString  = (terminator="") => readUtf8chars(readUInt(':"'), '"'+terminator);
        
        function readDecimal() {
            const num = readMatch(/^-?(\d+(\.\d+)?(E[+-]\d+)?|INF)|NAN/, "a decimal number", ";");
            return num in specialNums ? specialNums[num] : +num;
        }
        
        function readKey() {
            const typ = str[offset++];
            return typ === "s" ? readString(";") 
                 : typ === "i" ? readUInt(";")
                 : kick("Expected 's' or 'i' as type for a key, but got ${str[offset-1]}", offset-1);
        }
       
        function readObject(obj) {
            for (let i = 0, length = readUInt(":{"); i < length; i++) obj[readKey()] = readValue();
            return read("}", obj);
        }
        
        function readArray() {
            const obj = readObject({});
            return Object.keys(obj).some((key, i) => key != i) ? obj : Object.values(obj);
        }
        
        function readCustomObject(obj) {
            if (typeof obj.unserialize !== "function") kick(`Instance of ${obj.constructor.name} does not have an "unserialize" method`);
            obj.unserialize(readUtf8chars(readUInt(":{")));
            return read("}", obj);
        }
        
        function readValue() {
            const typ = str[offset++].toLowerCase();
            const ref = values.push(null)-1;
            const val = typ === "n" ? read(";", null)
                      : typ === "s" ? readString(";")
                      : typ === "b" ? readBoolean()
                      : typ === "i" ? readInt()
                      : typ === "d" ? readDecimal()
                      : typ === "a" ? readArray()                            // Associative array
                      : typ === "o" ? readObject(create(readString()))       // Object
                      : typ === "c" ? readCustomObject(create(readString())) // Custom serialized object
                      : typ === "r" ? values[readInt()]                      // Backreference
                      : kick(`Unexpected type ${typ}`, offset-1);
            if (typ !== "r") values[ref] = val;
            return val;
        }
        
        const val = readValue();
        if (offset !== str.length) kick("Unexpected trailing character");
        return val;
    }
}































/////////////////////////////////////////
api.get('/', (req, res) => {

    res.json({ message: 'i - bad request!' })

})


/* test Call 'https://domain/api/test' : test code
*****************************************************/
api.post('/test', function( req, res , next){

    res.json( 'info api test ok.' )

})





















/////////////////////////////////////////////////////////////////////////////////////////////
//////////  LINEメッセージ関連 ////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////

/* 全てのメッセージの取得
*****************************************************/
api.post('/getMessages', function( req, res , next){

    var sql = `select * from hiyoshi_info.messages order by lastSendDate DESC`

    var mesages = ''

    maria.getConnection().then( function(conn){

        conn.query( sql ).then( async function(results){

            mesages = JSON.parse( JSON.stringify( results ))

            var result = await Promise.all( mesages.map( async ( m )=>{

                var buf1 = Buffer.from( m.destinationTo );
                var buf2 = Buffer.from( m.messages );

                m.des = buf1.toString('utf8');
                m.mes = buf2.toString('utf8');

            }))

            await res.json( mesages )
            await conn.release()

        }).catch( err => { res.json( sql );conn.release(); }).finally( function() { if(conn) conn.release(); }); 

    }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally( function() { if(conn) conn.release(); });

})


















//// Export /////////////////////////////////////
module.exports = api

