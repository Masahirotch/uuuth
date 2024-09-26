/////////////////////////////////////////////////////////////////////////////////////////////
//////////  HIYOSHI DASHBORAD API ///////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////

const express = require('express')
const api = express()

    // for parsing application/json
    api.use(express.json())

    // for parsing application/x-www-form-urlencoded
    api.use( express.urlencoded({ extended: true, limit: '10mb' }) )
    api.use( express.json({ extended: true, limit: '10mb' }) )





// maria DB Connection Setting ////////
const mariadb = require('mariadb');

const maria = mariadb.createPool({
     host     : process.env.DB_HOST,
     user     : process.env.DB_USER,
     password : process.env.DB_PASS,
     database : process.env.DB_API,
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

function jpShortDate( da ){

  var d     = new Date( da );
  var year  = d.getFullYear();
  var month = d.getMonth() + 1;
  var day   = d.getDate();
  return `${year}年${month}月${day}日`

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

    res.json({ message: 'bad request!' })

})


/* test Call 'https://domain/api/test' : test code
*****************************************************/
api.post('/test', function( req, res , next){

    res.json( 'api test ok.' )

})


/**************************************************************************
 * ログインチェックに必要な管理者リストを取得する
***************************************************************************/
api.post('/getAdministrators', function( req, res , next){

    const conn = null
    maria.getConnection().then( conn => {

        var sql = `select * from administrators where privilege = 1 `

        conn.query( sql ).then( (results) => {

            res.json( results )
            conn.release()

        }).catch(err => { res.json( sql );conn.release(); }).finally( function() { if(conn) conn.release(); });

    }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally( function() { if(conn) conn.release(); });

})

/**************************************************************************
 * ログインチェックに必要な管理者リストを取得する
***************************************************************************/
api.post('/getAllAdministrators', function( req, res , next){

    const conn = null
    maria.getConnection().then( conn => {

        var sql = `select * from administrators `

        conn.query( sql ).then( (results) => {

            res.json( results )
            conn.release();

        }).catch(err => { res.json( sql );conn.release(); }).finally( function() { if(conn) conn.release(); });

    }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally( function() { if(conn) conn.release(); }); 

})




/**************************************************************************
 * 新規管理者追加
***************************************************************************/
api.post('/addNewAdminUser', function( req, res , next){

    var addUser = JSON.parse( req.body.addUser )

    const conn = null
    maria.getConnection().then( conn => {

        var sql = `insert into administrators ( userId , displayName ) values ( '${addUser.userId}' , '${addUser.displayName}' ) `

        conn.query( sql ).then( (results) => {

            res.json( { msg : '追加しました' } )
            conn.release();

        }).catch(err => { res.json( sql );conn.release(); }).finally( function() { if(conn) conn.release(); });

    }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally( function() { if(conn) conn.release(); }); 

})


/**************************************************************************
 * 管理ユーザー削除
***************************************************************************/
api.post('/deleteAdminUser', function( req, res , next){

    var user = JSON.parse( req.body.user )

    const conn = null
    maria.getConnection().then( conn => {

        var sql = `update administrators set privilege = 0 where userId = '${user.userId}' `

        conn.query( sql ).then( (results) => {

            res.json( results )
            conn.release();

        }).catch(err => { res.json( sql );conn.release(); }).finally( function() { if(conn) conn.release(); });

    }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally( function() { if(conn) conn.release(); }); 

})

/**************************************************************************
 * 管理ユーザー再利用
***************************************************************************/
api.post('/restartAdminUser', function( req, res , next){

    var user = JSON.parse( req.body.user )

    const conn = null
    maria.getConnection().then( conn => {

        var sql = `update administrators set privilege = 1 where userId = '${user.userId}' `

        conn.query( sql ).then( (results) => {

            res.json( results )
            conn.release();

        }).catch(err => { res.json( sql );conn.release(); }).finally( function() { if(conn) conn.release(); });

    }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally( function() { if(conn) conn.release(); }); 

})










/****************************************************
 * 画像を DB : api images テーブルに保存
*****************************************************/
api.post('/apiSaveImage', function( req, res , next){

    const conn = null
    maria.getConnection().then( conn => {

        var origin    = req.body.origin
        var thumb     = req.body.thumb
        var file_name = req.body.file_name
        var file_type = req.body.file_type

        var sql = `insert into images ( origin, thumb, file_name, file_type ) values ( '${origin}' , '${thumb}' , '${file_name}' , '${file_type}' )`

        conn.query( sql ).then( (results) => {

            var re = `select gid , file_type , file_name from images where gid in( SELECT gid FROM images WHERE gid = ${results.insertId} )`

            conn.query( re ).then( (results) => {

                res.json( results[0] )
                conn.release();

            }).catch(err => { res.json( re );conn.release(); }).finally( function() { if(conn) conn.release(); });

        }).catch(err => { res.json( sql );conn.release(); }).finally( function() { if(conn) conn.release(); });

    }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally( function() { if(conn) conn.release(); }); 


})















//// Export /////////////////////////////////////
module.exports = api

