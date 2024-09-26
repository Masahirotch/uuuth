/////////////////////////////////////////////////////////////////////////////////////////////
////////// HIYOSHI B2C アプリケーションAPI 初期設定関係 /////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////

const express = require('express')
const api = express()

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);


// for parsing application/json
api.use(express.json())

// for parsing application/x-www-form-urlencoded
api.use(express.urlencoded({ extended: true })) 

// maria DB Connection Setting
const mariadb = require('mariadb');
const maria = mariadb.createPool({
     host     : process.env.DB_HOST,
     user     : process.env.DB_USER,
     password : process.env.DB_PASS,
     database : process.env.DB_NAME,
     connectionLimit: 1,
     multipleStatements: true,
});

// LINE bot Setting
const line = require('@line/bot-sdk');

// ログ出力処理モジュール読込
const morganMiddleware = require("./morgan")
const log = require("./log")

// ロガーを使用
api.use(morganMiddleware)
// プロキシを信頼
api.set('trust proxy', 'loopback')

/////////////////////////////////////////////////////////////////////////////////////////////
////////// HELPER FUNCTIONS /////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////

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

// クエリ文字列をエスケープする
function escapeQuery(query){
    if (!query) { return query }

    return query
        .replace(/\\/g, "\\\\")
        .replace(/\'/g, "\\\'")
        .replace(/\"/g, "\\\"")
        .replace(/\n/g, "\\\n")
        .replace(/\r/g, "\\\r")
        .replace(/\x00/g, "\\\x00")
        .replace(/\x1a/g, "\\\x1a")
}

/*
file_id からデータを取得

getFile(req.body.file_id).then(async function(result) {
    await res.json(result)
})

*/
function getFile(file_id){

    var sql = `select * from cdn.upload_files where file_id = ${file_id}`

    return new Promise( function( resolve ) {

        let conn = null
        maria.getConnection().then(  function(conn) {

             conn.query( sql ).then( async function(results){

                resolve(results);
                conn.release();

            }).catch(err => { res.json( sql ); conn.release(); }).finally( function() { if (conn) conn.release(); });

        }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally( function() { if (conn) conn.release(); });

    });      

}




/* 記事IDから記事を取得
*****************************************************/
function getArticle( article_id ){

    var article  = {}
    var sectionList = []

    var sql = `
SELECT
    media.articles.*, 
    media.categories.category_name, 
    media.categories.category_code
FROM
    media.articles
    LEFT JOIN
    media.categories
    ON 
        media.articles.category_id = media.categories.categy_id
WHERE
    article_id = ${article_id} `

    return new Promise( function( resolve ) {

        let conn = null
        maria.getConnection().then( conn => {

            conn.query( sql ).then( function(results){

                article = JSON.parse( JSON.stringify( results[0] ) )
                article.status = ( article.status > 0 )? true : false

            }).then( async function(){

                var getSections = `select * from media.sections where article_id = ${article.article_id} order by position ASC`

                conn.query( getSections ).then( async function(results){

                    article.sections = results

                }).then( async function(results){

                    var result = await Promise.all( article.sections.map( async ( a )=>{

                        if( a.file_id != null && a.file_id != '' && a.file_id > 0 ){

                            var getFile = `select * from cdn.upload_files where file_id = ${a.file_id}`

                            a.file = await conn.query( getFile ).then( (results) => {

                                return results[0]

                            }).catch(err => { res.json( getFile );conn.release(); }).finally( function() { if (conn) conn.release(); });

                        }
                        else{

                            a.file = []

                        }

                    }))

                }).then( async function(results){

                    article.main = await getFile( article.main_file_id )
                    await resolve(article);

                }).catch(err => { res.json( sections );conn.release(); }).finally( function() { if (conn) conn.release(); });

             }).catch(err => { res.json( sql );conn.release(); }).finally( function() { if (conn) conn.release(); });

        }).catch(err => { res.json( { status : 'maria connection faild.', err : err } ); }).finally( function() { if (conn) conn.release(); });

    });      

}





/**********************************************************************************
* SQLクエリ実行
**********************************************************************************/
async function getQuery( query ){

    return await new Promise( async function( resolve ) {

        let conn = null
        await maria.getConnection().then( conn => {

            conn.query( query ).then( async function(results){

                await resolve( results )
                await conn.end();

            }).catch( err => { resolve( err ); conn.release(); }).finally( function() { if (conn) conn.release(); });

        }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally( function() { if (conn) conn.release(); });

    })

}

async function updateQuery( query ){

    return await new Promise( async function( resolve ) {

        let conn = null
        await maria.getConnection().then( conn => {

            conn.query( query ).then( async function(results){

                await resolve( true )
                await conn.end();

            }).catch( err => { resolve( err ); conn.release(); }).finally( function() { if (conn) conn.release(); });

        }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally( function() { if (conn) conn.release(); });

    })

}











/////////////////////////////////////////////////////////////////////////////////////////////
////////// データベース処理系 /////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////


////////// テストとか //////////////////////////////////////////////////////////////////////////////

api.get('/', (req, res) => {

    res.json({ message: 'bad request!' })

})

/* test Call 'https://domain/api/test' : test code
*****************************************************/
api.post('/test', function( req, res , next){

    getArticle(1).then( async function(result) {
        await res.json(result)
    })

})




////////// STRIPE 決済 /////////////////////////////////////////////////////////////////////
/* STRIPE 決済
*****************************************************/
api.post('/createPaymentIntents',function( req, res , next){

    log.pay(req)
    var amount   = req.body.amount
    var currency = req.body.currency

    stripe.paymentIntents.create({
      amount   : amount,
      currency : currency,
      payment_method_types : ['card'],
    }).then( (results) => {

        res.json( results )

    }).catch(err => { 
        log.error(req, err)
        res.json( err )
    })
    

})





///////////////////////////////////////////////////////////////////////////////////////////////
/////// helper functions //////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////
//async function getQuery( query ){
//
//    return await new Promise( async function( resolve ) {
//
//        await maria.getConnection().then( conn => {
//
//            conn.query( query ).then( async function(results){
//
//                await resolve( results )
//                await conn.end();
//
//            }).catch( err => { res.json( { err : query } ); conn.release(); }).finally( function() { if (conn) conn.release(); });
//
//        }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally( function() { if (conn) conn.release(); });
//
//    })
//
//}

async function getCDN( file_id ){

    var sql = `select * from cdn.upload_files where file_id = ${file_id}`

    return new Promise( function( resolve ) {

        let conn = null
        maria.getConnection().then(  function(conn) {

             conn.query( sql ).then( async function(results){

                resolve(results);
                conn.release();

            }).catch(err => { res.json( sql ); conn.release(); }).finally( function() { if (conn) conn.release(); });

        }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally( function() { if (conn) conn.release(); });

    });      

}






















/////////////////////////////////////////////////////////////////////////////////////////////
////////// APP 設定読み込み /////////////////////////////////////////////////////////////////////
api.get('/appConfig/*', async function( req , res ){

    var app = await req.params[0]

    var query = await `
    SELECT
        b2c.app_settings.*, 
        cdn.upload_files.*, 
        b2c.app_rules.law_prices, 
        b2c.app_rules.law_method, 
        b2c.app_rules.law_returned, 
        b2c.app_rules.law_service, 
        b2c.app_rules.law_other, 
        b2c.app_rules.law_about, 
        b2c.app_rules.privacy_header, 
        b2c.app_rules.privacy_information, 
        b2c.app_rules.privacy_purpose, 
        b2c.app_rules.privacy_consign, 
        b2c.app_rules.privacy_furnishing, 
        b2c.app_rules.privacy_line, 
        b2c.app_rules.privacy_contact, 
        b2c.app_rules.terms
    FROM
        b2c.app_settings
        LEFT JOIN
        cdn.upload_files
        ON 
            b2c.app_settings.logo_file_id = cdn.upload_files.file_id
        LEFT JOIN
        b2c.app_rules
        ON 
            b2c.app_settings.app_id = b2c.app_rules.app_id
    WHERE app_code = '${app}' `

    var appSetting = await getQuery( query )

    await res.json( appSetting )

})








/////////////////////////////////////////////////////////////////////////////////////////////
////////// ユーザー情報関係処理 ///////////////////////////////////////////////////////////////

/*
* ユーザー登録
*******************************************************************************************/

api.post('/initUser', function( req, res , next){

    log.user(req)
    var userProfile = JSON.parse( req.body.userProfile ) 
    var app_id      = req.body.app_id

    let conn = null
    maria.getConnection().then( conn => {

        var chk = `select * from user where userId = '${userProfile.userId}'`

        conn.query( chk ).then( ( results ) => {

            if( results.length == 0 ){

                var now = getNow()
                var insert = `INSERT INTO user
                                ( 
                                  userId, 
                                  displayName, 
                                  createDate,
                                  app_id
                                )
                              VALUES
                                ( 
                                  '${userProfile.userId}' , 
                                  '${escapeQuery(userProfile.displayName)}' , 
                                  '${now}',
                                  ${app_id}
                                )`

                conn.query( insert ).then( ( results ) => {

                    var getUser = `select * from user where userId = '${userProfile.userId}'`

                    conn.query( getUser ).then( ( results ) => {

                        res.json( results )
                        conn.release();


                    }).catch(err => { log.error(req, err); res.json( getUser ); conn.release(); }).finally( function() { if (conn) conn.release(); });

                }).catch(err => { log.error(req, err); res.json( insert ); conn.release(); }).finally( function() { if (conn) conn.release(); });

            }
            else{

                res.json( results )
                conn.release();

            }

        }).catch(err => { log.error(req, err); res.json( chk ); conn.release(); }).finally( function() { if (conn) conn.release(); });

    }).catch( err => { log.error(req, err); res.json( { status : 'maria connection faild.', error : err } ); }).finally( function() { if (conn) conn.release(); });

})

/* ユーザー取得
*****************************************************/
api.post('/getUser', function(req, res , next){

    var userProfile = JSON.parse(req.body.userProfile) 

    let conn = null
    maria.getConnection().then( conn => {

        var getUser = `select * from user where userId = '${userProfile.userId}'`

        conn.query( getUser ).then( ( results ) => {

            res.json( results )
            conn.release();

        }).catch(err => { res.json( getUser ); conn.release(); }).finally( function() { if (conn) conn.release(); });

    }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally( function() { if (conn) conn.release(); });

})


/* ユーザーの購入履歴取得
*****************************************************/
api.post('/getUserHistory', function(req, res , next){

    var userHistory = []

    var userProfile = JSON.parse(req.body.userProfile) 

    let conn = null
    maria.getConnection().then( conn => {

        var getUserHistory = `
                SELECT
                    order_master.*, 
                    order_status.status, 
                    order_status.last_update, 
                    order_status.slip_number
                FROM
                    order_master
                    LEFT JOIN
                    order_status
                    ON 
                        order_master.order_id = order_status.order_id
                WHERE
                    order_master.userId = '${userProfile.userId}' AND order_app_id = ${req.body.app_id}
                ORDER BY
                    order_date DESC`

        conn.query( getUserHistory ).then( async function( results ){

            userHistory = results

            var result = await Promise.all( userHistory.map( async ( order )=>{

                var getCart = `
                    SELECT
                        b2c.order_cart.*, 
                        b2c.product_configs.product_main, 
                        b2c.product_configs.in_sales, 
                        b2c.product_configs.in_limitedquantity, 
                        b2c.product_configs.in_limitedtime, 
                        b2c.product_configs.sales_start, 
                        b2c.product_configs.sales_end, 
                        b2c.product_configs.delete_flg, 
                        b2c.product_configs.product_stock, 
                        b2c.product_configs.product_unit, 
                        cdn.upload_files.file_url, 
                        cdn.upload_files.origin_name, 
                        cdn.upload_files.thumb_url
                    FROM
                        b2c.order_cart
                        LEFT JOIN
                        b2c.product_configs
                        ON 
                            order_cart.product_id = product_configs.product_id
                        LEFT JOIN
                        cdn.upload_files
                        ON 
                            b2c.product_configs.product_main = cdn.upload_files.file_id
                    where 
                        order_id = ${order.order_id}`

                order.cart = await conn.query( getCart ).then( (results) => {

                    return results

                }).catch(err => { res.json( getFile );conn.release(); })

            }))

        }).then( async function( results ){

            res.json( userHistory )
            conn.release();

        }).catch(err => { res.json( getUserHistory ); conn.release(); }).finally( function() { if (conn) conn.release(); });

    }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally( function() { if (conn) conn.release(); });

})










/////////////////////////////////////////////////////////////////////////////////////////////
////////// 商品関係処理 /////////////////////////////////////////////////////////////////////

/**************************************************************************
 * 商品リストの取得
**************************************************************************/
api.get('/products/*', async function( req, res , next){

    var app_id = await req.params[0]

    var query = await `
        SELECT
            product_configs.product_id,
            product_configs.product_code,
            concat(product_configs.product_name, ' ', const_sizes.size_name) as product_name,
            product_configs.product_name as product_name_no_size,
            product_configs.product_subname,
            product_configs.product_description,
            product_configs.product_main,
            product_configs.product_pict2,
            product_configs.product_pict3,
            product_configs.product_unit,
            product_configs.product_stock,
            product_configs.in_sales,
            product_configs.in_limitedquantity,
            product_configs.in_limitedtime,
            product_configs.sales_start,
            product_configs.sales_end,
            product_configs.delete_flg,
            product_configs.article_id,
            product_configs.size_code,
            product_prices.price_id, 
            product_prices.app_id, 
            product_prices.price, 
            product_prices.tax_rate, 
            product_prices.active_flg
        FROM
            product_configs
            LEFT JOIN
            product_prices
            ON 
                product_configs.product_id = product_prices.product_id
            LEFT JOIN
            const_sizes
            ON
                product_configs.size_code = const_sizes.size_code

        WHERE 
            delete_flg != 1 AND 
            in_sales = 1 AND 
            active_flg = 1 AND 
            app_id = ${app_id}`

    var products = await getQuery( query )

    var result = await Promise.all( products.map( async ( p )=>{

        p.in_limitedtime     = ( p.in_limitedtime     == null || p.in_limitedtime     == 0 )? false : true
        p.in_limitedquantity = ( p.in_limitedquantity == null || p.in_limitedquantity == 0 )? false : true
        p.in_sales           = ( p.in_sales           == null || p.in_sales           == 0 )? false : true
        p.view               = true

        if( p.article_id != null && p.article_id > 0 ){

            p.article = await getArticle( p.article_id )

        }

        await getCDN( p.product_main  ).then( function( result ) { p.main  = ( result.length > 0 )? result[0]:[] })
        await getCDN( p.product_pict2 ).then( function( result ) { p.pict2 = ( result.length > 0 )? result[0]:[] })
        await getCDN( p.product_pict3 ).then( function( result ) { p.pict3 = ( result.length > 0 )? result[0]:[] })

        return p

    }))

    await res.json( result )


})





















/////////////////////////////////////////////////////////////////////////////////////////////
////////// カート関連処理 /////////////////////////////////////////////////////////////////////

/* カートセッションを取得
*****************************************************/
api.post('/getCartSession', function(req, res , next){

    var userProfile = JSON.parse(req.body.userProfile)

    let conn = null
    maria.getConnection().then( conn => {

        var sql = `select * from cart where userId = ? AND is_active = 1 ORDER BY product_id ASC`

        conn.query( sql , [userProfile.userId] ).then( ( results ) => {
            
            res.json( results )
            conn.release();

        }).catch(err => { res.json( sql ); conn.release(); }).finally( function() { if (conn) conn.release(); });

    }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally( function() { if (conn) conn.release(); });

})




/* カートセッションの保存
*****************************************************/
api.post('/setCartSession', function(req, res , next){

    log.cart(req, "SET")
    var time        = unixTime() 
    var now         = getNow()
    var cart        = JSON.parse( req.body.cart )
    var userProfile = JSON.parse( req.body.userProfile )
    var session_id  = ( req.body.session_id == null || req.body.session_id == '' )? userProfile.userId + '___' + unixTime() : req.body.session_id


    var insert = `(
                  userId,
                  product_id, 
                  product_name,
                  product_code,  
                  price, 
                  quantity, 
                  update_date, 
                  session_id,
                  size_code
                )`

    var values = ''

    cart.forEach( v => {

        values += `(
                  '${userProfile.userId}',
                  ${v.product_id}, 
                  '${escapeQuery(v.product_name)}',
                  '${v.product_code}',  
                  ${v.price}, 
                  ${v.quantity}, 
                  '${now}', 
                  '${session_id}',
                  '${v.size_code}'
                ),`

    })

    values = values.slice(0, -1)

    var sql = `INSERT INTO cart ${insert} VALUES ${values}`

    var deleteQuery = `delete from cart where userId = '${userProfile.userId}'`

    let conn = null
    maria.getConnection().then( conn => {

        conn.query( deleteQuery ).then( ( results ) => {

            conn.query( sql ).then( ( results ) => {

                res.json( session_id )
                conn.release();

            }).catch(err => { log.error(req, err); res.json( sql ); conn.release(); }).finally( function() { if (conn) conn.release(); });

        }).catch(err => { log.error(req, err); res.json( deleteQuery ); conn.release(); }).finally( function() { if (conn) conn.release(); });

    }).catch( err => { log.error(req, err); res.json( { status : 'maria connection faild.', error : err } ); }).finally( function() { if (conn) conn.release(); });

})


/* カートセッションから商品を削除
*****************************************************/
api.post('/deleteCartSession', function(req, res , next){

  log.cart(req, "DEL")
  var cart        = JSON.parse( req.body.cart )
  var userProfile = JSON.parse( req.body.userProfile )
  var session_id  = req.body.session_id
  var now         = getNow()

  let conn = null
  maria.getConnection().then( conn => {

      cart.forEach( c => {

          var sql = `
              DELETE FROM 
                  cart
              WHERE
                  product_id = ${c.product_id} AND
                  session_id = '${session_id}' AND
                  userId     = '${userProfile.userId}'`

          conn.query( sql ).then( ( results ) => {
      
            res.json( session_id )
            conn.release();

          }).catch(err => { log.error(req, err); res.json( sql ); conn.release(); }).finally( function() { if (conn) conn.release(); });

      })

      res.json( session_id )
      conn.end()

  }).catch( err => { log.error(req, err); res.json( { status : 'maria connection faild.', error : err } ); }).finally( function() { if (conn) conn.release(); });



})


////////////////////////////////////////////////////////////////////////////////////////////
////////// 注文処理 /////////////////////////////////////////////////////////////////////////

/* オーダー情報登録
*****************************************************/
api.post('/registOrder', function(req, res , next){

    log.regist(req)
    var userProfile = JSON.parse( req.body.userProfile )
    var shipping    = JSON.parse( req.body.shipping )
    var cart        = JSON.parse( req.body.cart )
    var orderMethod = JSON.parse( req.body.orderMethod )
    var orderDetail = JSON.parse( req.body.orderDetail )
    var appConfig   = JSON.parse( req.body.appConfig )

    let conn = null
    maria.getConnection().then( async conn => {

        // オーダー基本情報の保存 ///////////////////////////
        var orderDate = getNow()

        var order_columns = `(
                      userId,
                      displayName, 
                      order_date,
                      order_price,
                      cart_price,
                      shipping_fee,
                      shipping_charge,
                      payment_method,
                      session_id,
                      order_app_id
        )`

        var order_values  = `(
                      '${userProfile.userId}',
                      '${escapeQuery(userProfile.displayName)}',
                      '${orderDate}',
                      '${orderDetail.fullCartPrice}',
                      '${orderDetail.cartPrice}',
                      '${orderDetail.shippingPrice}',
                      '${orderDetail.shippingCharge}',
                      '${orderMethod.paymentMethod}',
                      '${orderDetail.session_id}',
                      '${appConfig.app_id}'
        )`

        var saveOrder = `INSERT INTO order_master ${order_columns} VALUES ${order_values}`

        // トランザクション開始
        await conn.beginTransaction()
        await conn.query( saveOrder ).then( async ( results ) => {

            // 配送先情報の保存 ///////////////////////////
            var order_id = results.insertId

            var deliv_time = ( orderMethod.delivTime == '' )? 'none' : orderMethod.delivTime

            var shipping_columns  = `(
                        order_id,
                        zip,
                        pref,
                        pref_code,
                        city,
                        street,
                        address,
                        addition,
                        tel_1,
                        tel_2,
                        tel_3,
                        name,
                        deliv_time,
                        note,
                        shipping_id
            )`

            var shipping_values  = `(
                    ${order_id},
                    '${shipping.zip}',
                    '${escapeQuery(shipping.pref)}',
                    ${shipping.pref_code},
                    '${escapeQuery(shipping.city)}',
                    '${escapeQuery(shipping.street)}',
                    '${escapeQuery(shipping.address)}',
                    '${escapeQuery(shipping.addition)}',
                    '${shipping.tel_1}',
                    '${shipping.tel_2}',
                    '${shipping.tel_3}',
                    '${escapeQuery(shipping.name)}',
                    '${deliv_time}',
                    '${escapeQuery(orderMethod.note)}',
                    ${shipping.shipping_id}
            )`

            var saveShipping = `INSERT INTO order_shipping ${shipping_columns} VALUES ${shipping_values}`

            await conn.query( saveShipping ).then( async ( results ) => {

                // 購入商品リストを保存してカートセッションを削除 /////////////////
                var cart_columns  = `(
                            order_id,
                            userId,
                            product_id, 
                            product_name,
                            product_code,
                            price,
                            quantity,
                            session_id
                        )`
                
                var cart_values = ``

                cart.forEach( p => {

                    cart_values  += `(
                                ${order_id},
                                '${userProfile.userId}',
                                ${p.product_id},
                                '${p.product_name}',
                                '${p.product_code}',
                                ${p.price},
                                ${p.quantity},
                                '${orderDetail.session_id}'
                        ),`
                })

                cart_values = cart_values.slice( 0, -1 ) 

                var saveCart = `INSERT INTO order_cart ${cart_columns} VALUES ${cart_values}`

                await conn.query( saveCart ).then( async ( results ) => {

                    // オーダーステータスの作成 /////////////////
                    var status_columns  = `(
                                order_id,
                                status,
                                last_update, 
                                userId
                    )`

                    var status_values  = `(
                            ${order_id},
                            'prep',
                            '${orderDate}',
                            '${userProfile.userId}'

                    )`

                    var saveStatus = `INSERT INTO order_status ${status_columns} VALUES ${status_values}`

                    await conn.query( saveStatus ).then( async ( results ) => {

                        // カートセッション削除 /////////////////
                        var cartSessionDelete = `DELETE FROM cart WHERE userId = ?`

                        await conn.query( cartSessionDelete , [ userProfile.userId ] ).then( async ( results ) => {

                            // トランザクション確定
                            await conn.commit()
                            res.json( { order_id : order_id } )
                            await conn.release();

                        }).catch( async err => { log.error(req, err); res.json( {error: err} ); await conn.rollback(); }).finally( async function() { if (conn) await conn.release(); });

                    }).catch( async err => { log.error(req, err); res.json( {error: err} ); await conn.rollback(); }).finally( async function() { if (conn) await conn.release(); });

                }).catch( async err => { log.error(req, err); res.json( {error: err} ); await conn.rollback(); }).finally( async function() { if (conn) await conn.release(); });

            }).catch( async err => { log.error(req, err); res.json( {error: err} ); await conn.rollback(); }).finally( async function() { if (conn) await conn.release(); });

        }).catch( async err => { log.error(req, err); res.json( {error: err} ); await conn.rollback(); }).finally( async function() { if (conn) await conn.release(); });

    }).catch( err => { log.error(req, err); res.json( { status : 'maria connection faild.', error : err.message } ); }).finally( async function() { if (conn) await conn.release(); } );

})


/* オーダー情報確定
*****************************************************/
api.post('/completeOrder', function(req, res , next){

    log.complete(req)
    const userId = req.body.userId
    const order_id = req.body.order_id
    const stripeToken = JSON.parse( req.body.stripeToken )

    let conn = null
    maria.getConnection().then( async conn => {

        // STRIPE 決済情報の保存 ///////////////////////////
        var stripe_columns = `(
            order_id,
            id,
            amount, 
            capture_method,
            client_secret,
            confirmation_method,
            created,
            currency,
            object,
            payment_method,
            payment_method_types,
            status,
            userId
        )`

        var stripe_values  = `(
                        ${order_id} , 
                        '${stripeToken.id}' , 
                        ${stripeToken.amount} , 
                        '${stripeToken.capture_method}' , 
                        '${stripeToken.client_secret}' , 
                        '${stripeToken.confirmation_method}' , 
                        ${stripeToken.created} , 
                        '${stripeToken.currency}' , 
                        '${stripeToken.object}' , 
                        '${stripeToken.payment_method}' , 
                        '${stripeToken.payment_method_types[0]}' , 
                        '${stripeToken.status}' , 
                        '${userId}'
        )`

        var saveStripe = `INSERT INTO order_stripe ${stripe_columns} VALUES ${stripe_values}`

        // トランザクション開始
        await conn.beginTransaction()
        await conn.query( saveStripe ).then( async ( results ) => {

            await conn.query( `UPDATE order_status SET status = 'new' WHERE order_id = ${order_id}` ).then( async ( results ) => {

                // トランザクション確定
                await conn.commit()
                res.json( { order_id : order_id } )
                await conn.release();

    
            }).catch( async err => { log.error(req, err); res.json( {error: err} ); await conn.rollback(); }).finally( async function() { if (conn) await conn.release(); } );
    
        }).catch( async err => { log.error(req, err); res.json( {error: err} ); await conn.rollback(); }).finally( async function() { if (conn) await conn.release(); } );

    }).catch( err => { log.error(req, err); res.json( { status : 'maria connection faild.', error : err.message } ); }).finally( async function() { if (conn) await conn.release(); } );

})

/* オーダー情報キャンセル（確定前情報を削除）
*****************************************************/
api.post('/cancelOrder', function(req, res ){

    const order_id = req.body.order_id

    let conn = null
    maria.getConnection().then( conn => {

        // オーダ情報（確定前）を削除
        const deleteOrder = `
            delete from order_master where order_id = ${order_id};
            delete from order_shipping where order_id = ${order_id};
            delete from order_cart where order_id = ${order_id};
            delete from order_status where order_id = ${order_id};
        `
        conn.query( deleteOrder ).then( ( results ) => {

            res.json( { order_id : order_id } )
            conn.release();

        }).catch( err => { log.error(req, err); res.json( {error: err} ); conn.rollback(); }).finally( function() { if (conn) conn.release(); } );

    }).catch( err => { log.error(req, err); res.json( { status : 'maria connection faild.', error : err.message } ); }).finally( function() { if (conn) conn.release(); } );

})


/* IDからオーダー情報を取得
*****************************************************/
api.post('/getOrder', function(req, res , next){

    var order_id = req.body.order_id

    let conn = null
    maria.getConnection().then( conn => {

        var sql = `SELECT * FROM all_order WHERE order_id= ?`

        conn.query( sql , [ order_id ] ).then( ( results ) => {

            res.json( results )
            conn.release();

        }).catch(err => { log.error(req, err); res.status(500).send(err.text || err.message); }).finally( function() { if (conn) conn.release(); });

    }).catch( err => { log.error(req, err); res.json( { status : 'maria connection faild.', error : err } ); }).finally( function() { if (conn) conn.release(); });

})



////////////////////////////////////////////////////////////////////////////////////////////
////////// 配送関連機能 /////////////////////////////////////////////////////////////////////

// 基本データ関係 ///////////////////////////

/* 県データ取得
*****************************************************/
api.post('/getConstPref', function(req, res , next){

    let conn = null
    maria.getConnection().then( conn => {

        var sql = `select * from const_pref`

        conn.query( sql ).then( ( results ) => {

            res.json( results )
            conn.release();

        }).catch(err => { res.json( sql ); conn.release(); }).finally( function() { if (conn) conn.release(); });

    }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally( function() { if (conn) conn.release(); });

})

/* 市町村取得
*****************************************************/
api.post('/getCitiesByPrefcode', function(req, res , next){

    let conn = null
    maria.getConnection().then( conn => {

        var sql = `select * from const_cities WHERE prefCode = ?`

        conn.query( sql , [req.body.prefCode] ).then( ( results ) => {

            res.json( results )
            conn.release();

        }).catch(err => { res.json( sql ); conn.release(); }).finally( function() { if (conn) conn.release(); });

    }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally( function() { if (conn) conn.release(); });

})

/* 町名取得
*****************************************************/
api.post('/getStreetsByCitycode', function(req, res , next){

    let conn = null
      maria.getConnection().then( conn => {

          var sql = `select * from const_zip WHERE cityCode = ?`

          conn.query( sql , [req.body.cityCode] ).then( ( results ) => {
              
              res.json( results )
              conn.release();

          }).catch(err => { res.json( sql ); conn.release(); }).finally( function() { if (conn) conn.release(); });

      }).catch(err => { res.json( 'Db Access Error.' ); }).finally( function() { if (conn) conn.release(); });;

})

/* ZIP CODE から住所データ取得
*****************************************************/
api.post('/getZipToAddress', function(req, res , next){

    let conn = null
      maria.getConnection().then( conn => {

          var sql = `select * from const_zip WHERE zip = ?`

          conn.query( sql , [req.body.zip] ).then( ( results ) => {
              
              res.json( results[0] )
              conn.release();

          }).catch(err => { res.json( sql ); conn.release(); }).finally( function() { if (conn) conn.release(); });

     }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally( function() { if (conn) conn.release(); });

})


// アプリ設定関連 ///////////////////////////

/* 送料テーブルの取得
*****************************************************/
api.post('/getPrefShipping', function(req, res , next){

    let conn = null
      maria.getConnection().then( conn => {

          var sql = `SELECT
              app_shippings.app_id as app_id, 
              app_shippings.pref_code as pref_code, 
              app_shippings.shipping_flg as shipping_flg, 
              app_shippings.shipping_fee as shipping_fee,  
              app_shippings.size_code as size_code, 
              const_pref.jp as pref_jp, 
              const_pref.en as pref_en
            FROM
              app_shippings
              INNER JOIN
              const_pref
              ON 
                app_shippings.pref_code = const_pref.pref_code
            WHERE
              shipping_flg = 1 AND
              app_id = ${req.body.app_id}`

          conn.query( sql ).then( ( results ) => {
              
              res.json( results )
              conn.release();

          }).catch(err => { res.json( sql ); conn.release(); }).finally( function() { if (conn) conn.release(); });

     }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally( function() { if (conn) conn.release(); });

})

// ユーザー設定関連 ///////////////////////////











/* 住所データの保存
*****************************************************/
api.post('/saveShipping', function(req, res , next){

    var address     = JSON.parse( req.body.shipping )

    // 新規追加 /////////////////////////////
    if( address.shipping_id == '' ){ 

        var sql = `INSERT INTO user_address
                  ( userId, zip, pref,  pref_code, city, street, address, addition, tel_1, tel_2, tel_3, name )
                   VALUES
                  ( '${address.userId}','${address.zip}','${escapeQuery(address.pref)}',${address.pref_code},'${escapeQuery(address.city)}','${escapeQuery(address.street)}',
                    '${escapeQuery(address.address)}','${escapeQuery(address.addition)}','${address.tel_1}','${address.tel_2}','${address.tel_3}','${escapeQuery(address.name)}')`

        let conn = null
        maria.getConnection().then( conn => {

            conn.query( sql ).then( ( results ) => {

                res.json( results )
                conn.release();

            }).catch(err => { res.json( sql ); conn.release(); }).finally( function() { if (conn) conn.release(); });

        }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally( function() { if (conn) conn.release(); });

    }
    // 更新 /////////////////////////////
    else{

        var sql =  `UPDATE user_address 
                    SET
                        userId       = '${address.userId}',
                        zip          = '${address.zip}', 
                        pref         = '${escapeQuery(address.pref)}', 
                        pref_code    =  ${address.pref_code}, 
                        city         = '${escapeQuery(address.city)}', 
                        street       = '${escapeQuery(address.street)}', 
                        address      = '${escapeQuery(address.address)}',
                        addition     = '${escapeQuery(address.addition)}',
                        tel_1        = '${address.tel_1}',
                        tel_2        = '${address.tel_2}',
                        tel_3        = '${address.tel_3}',
                        name         = '${escapeQuery(address.name)}',
                        is_delete    = 0
                    WHERE 
                        shipping_id  = '${address.shipping_id}' AND userId = '${address.userId}'`

        let conn = null
        maria.getConnection().then( conn => {

            conn.query( sql ).then( ( results ) => {

                res.json( results )
                conn.release();

            }).catch(err => { res.json( sql ); conn.release(); }).finally( function() { if (conn) conn.release(); });

        }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally( function() { if (conn) conn.release(); });

    }

})

/* shippingDataを削除
*****************************************************/
api.post('/deleteShipping', function(req, res , next){

    var address     = JSON.parse( req.body.shipping )

    let conn = null
    maria.getConnection().then( conn => {

        var sql = `UPDATE 
                      user_address 
                   SET
                      is_delete    = 1
                   WHERE
                      shipping_id  = '${address.shipping_id}' AND userId = '${address.userId}'`

        conn.query( sql ).then( ( results ) => {

            res.json( results )
            conn.release();

        }).catch(err => { res.json( sql ); conn.release(); }).finally( function() { if (conn) conn.release(); });

    }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally( function() { if (conn) conn.release(); });

})


/* ユーザーの登録した配送状況を取得
*****************************************************/
api.post('/getUserShipping', function(req, res , next){

    var userProfile = JSON.parse(req.body.userProfile)
    var shipping = {}

    let conn = null
    maria.getConnection().then( conn => {

        var sql  = `SELECT * FROM user_address WHERE userId = '${userProfile.userId}' AND is_delete = 0`

        conn.query( sql ).then( ( results ) => {

           res.json( results )
           conn.release();

        }).catch(err => { res.json( master ); conn.release(); }).finally( function() { if (conn) conn.release(); });

    }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally( function() { if (conn) conn.release(); });

})



/* レシートの作成（送信はliff.sendMessageでクライアント側処理）
*****************************************************/
api.post('/getReceipt', function(req, res , next){

    var confirmOrder = JSON.parse(req.body.confirmOrder)
    var config       = JSON.parse(req.body.config)
    var orderData    = JSON.parse(req.body.orderData)
    var main         = JSON.parse( JSON.stringify( confirmOrder[0] ))

    var receipt = {
        type: 'bubble',
        styles: {
            footer : {
                separator : true
            }
        },
        body : {
            type     : 'box',
            layout   : 'vertical',
            contents : []
        }

    }

    receipt.body.contents.push({type: 'text', text: config.app_name, weight: 'bold', color: '#1DB446', size: 'md', wrap: true} )

    receipt.body.contents.push({type: 'text', text: 'ご注文内容' , weight: 'bold', size: 'md', margin: 'md' , color: '#111111'})

    var productlist = confirmOrder.map( o => {

        return {
            type    : "box",
            layout  : "horizontal",
            contents: [
                {
                    type    : "text",
                    wrap    : true,
                    contents: [
                        {
                            type  : "span",
                            text  : o.product_name,
                            size  : "sm",
                            color : "#555555",
                        },
                        {
                            type  : "span",
                            text  : "　",
                            size  : "sm",
                        },
                        {
                            type  : "span",
                            text  : o.product_unit ? o.quantity + o.product_unit : o.quantity.toString(),
                            size  : "sm",
                            color : "#111111",
                        }
                    ]
                }
            ]

        }

    })

    productlist.push( {"type": "separator","margin": "xxl"} )

    productlist.push( {
            "type": "box",
            "layout": "horizontal",
            "margin": "xxl",
            "contents": [
                {
                "type": "text",
                "text": "商品合計",
                "size": "sm",
                "color": "#555555"
                },
                {
                "type": "text",
                "text": "¥" + orderData.cartPrice,
                "size": "sm",
                "color": "#111111",
                "align": "end"
                }
            ]
        } )

    productlist.push( {
            "type": "box",
            "layout": "horizontal",
            "margin": "md",
            "contents": [
                {
                "type": "text",
                "text": "送料",
                "size": "sm",
                "color": "#555555"
                },
                {
                "type": "text",
                "text": "¥" + orderData.shippingPrice,
                "size": "sm",
                "color": "#111111",
                "align": "end"
                }
            ]
        } )

    productlist.push( {
            "type": "box",
            "layout": "horizontal",
            "margin": "md",
            "contents": [
                {
                "type": "text",
                "text": "合計",
                "size": "sm",
                "color": "#000000",
                "weight": "bold"
                },
                {
                "type": "text",
                "text": "¥" + orderData.orderPrice,
                "size": "sm",
                "color": "#000000",
                "align": "end",
                "weight": "bold"
                }
            ]
        } )

    receipt.body.contents.push({type: 'separator', margin: 'xxl'})

    receipt.body.contents.push( {
        type: 'box', 
        layout: 'horizontal', 
        margin: 'xl', 
        contents:[
            {type: 'text', text: '注文番号', size: 'xs', color: '#444444', flex: 0},
            {type: 'text', text: '#' + config.app_code + '-' + main.order_id , color: '#444444', size: 'xs', align: 'end'}
        ]
    })

    receipt.body.contents.push({type: 'box',layout: 'vertical',margin: 'xxl',spacing: 'sm',contents: productlist })

    receipt.body.contents.push({type: 'separator', margin: 'xxl'})

    var shippingAddress = `\n〒 ${main.zip}\n${main.pref}${main.city}${main.street}${main.address}\n${main.addition}\ntel : ${main.tel_1}-${main.tel_2}-${main.tel_3}\n${main.name} さま`

    receipt.body.contents.push({type: 'text', text: shippingAddress, size: 'xs', color: '#666666', wrap: true})

    res.json( receipt )

})











////////////////////////////////////////////////////////////////////////////////////////////
////////// メディア関連機能 //////////////////////////////////////////////////////////////////

/* 記事IDから記事を取得
*****************************************************/
api.post('/getArticleById', function( req, res , next){

    getArticle( req.body.article_id ).then( async function(result) {
        await res.json(result)
    })

})






//// Export /////////////////////////////////////
module.exports = api
