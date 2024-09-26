/////////////////////////////////////////////////////////////////////////////////////////////
//////////  HIYOSHI B2B DASHBORAD ///////////////////////////////////////////////////////////
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
     database : process.env.DB_B2B,
     connectionLimit: 1
});

// LINE bot Setting
const line = require('@line/bot-sdk');



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

function jpDate( da ){

  var d     = new Date( da );
  var year  = d.getFullYear();
  var month = d.getMonth() + 1;
  var day   = d.getDate();
  var hour  = ( '00' + d.getHours() ).slice( -2 );
  var min   = ( '00' + d.getMinutes() ).slice( -2 );
  var sec   = ( '00' + d.getSeconds() ).slice( -2 );
  return `${year}年${month}月${day}日 ${hour}時${min}分${sec}秒`

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


/////////////////////////////////////////
api.get('/', (req, res) => {

    res.json({ message: 'b - bad request!' })

})


/* test Call 'https://domain/api/test' : test code
*****************************************************/
api.post('/test', function( req, res , next){

    res.json( 'b2b api test ok' )

})






















//// Export /////////////////////////////////////
module.exports = api

