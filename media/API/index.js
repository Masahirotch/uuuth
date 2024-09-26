/////////////////////////////////////////////////////////////////////////////////////////////
////////// HIYOSHI B2B2C アプリケーションAPI 初期設定関係 /////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////

const express = require('express')
const api = express()

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
         connectionLimit: 1
    });

    // LINE bot Setting
    const line = require('@line/bot-sdk');



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

function enDate( da ){

  var d     = new Date( da );
  var year  = d.getFullYear();
  var month = d.getMonth() + 1;
  var day   = d.getDate();
  var hour  = ( '00' + d.getHours() ).slice( -2 );
  var min   = ( '00' + d.getMinutes() ).slice( -2 );
  var sec   = ( '00' + d.getSeconds() ).slice( -2 );
  return `${year}-${month}-${day} ${hour}:${min}:${sec}`

}

function nowJP(){

  var d     = new Date();
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


function getFile(file_id){

    var sql = `select * from cdn.upload_files where file_id = ${file_id}`

    return new Promise( function( resolve ) {

        const conn = null
        maria.getConnection().then(  function(conn) {

             conn.query( sql ).then( async function(results){

                resolve(results);
                conn.release();

            }).catch(err => { res.json( sql ); conn.release(); }).finally( function() { if(conn) conn.release(); });

        }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally( function() { if(conn) conn.release(); });

    });      

}


function getImage(file_id){

    var sql = `select * from cdn.upload_files where file_id = ${file_id}`

    return new Promise( function( resolve ) {

        const conn = null
        maria.getConnection().then(  function(conn) {

             conn.query( sql ).then( async function(results){

                resolve(results[0]);
                conn.release();

            }).catch(err => { res.json( sql ); conn.release(); }).finally( function() { if(conn) conn.release(); });

        }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally( function() { if(conn) conn.release(); });

    });      

}


function number_format(value){

    let formatter = new Intl.NumberFormat('ja-JP');
    
    return formatter.format(value);

}




/////////////////////////////////////////////////////////////////////////////////////////////
////////// データベース処理系 /////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////

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


/*******************************************************************************************************************************************************
 * config , 基本設定関連
*******************************************************************************************************************************************************/

/* アプリケーション設定の取得
*****************************************************/
api.post('/getAppConfig', function( req, res , next){

    var app_code = req.body.app_code

    var sql = `select * from b2b2c_apps where app_code = '${app_code}'`

    const conn = null
    maria.getConnection().then( conn => {

        conn.query( sql ).then( function(results){

            res.json( results[0] )
            conn.release();

        }).catch(err => { res.json( sql );conn.release(); }).finally( function() { if(conn) conn.release(); });

    }).catch(err => { res.json( { status : 'maria connection faild.', err : err } ); }).finally( function() { if(conn) conn.release(); });

})



/*******************************************************************************************************************************************************
 * ユーザー関連処理
*******************************************************************************************************************************************************/

/* ユーザーチェックイン
*****************************************************/
api.post('/userCheckin', async function( req, res , next){

    var userProfile = JSON.parse( req.body.userProfile )
    var apps        = JSON.parse( req.body.app_config )

    var sql = `
        insert into b2b2c_users ( userId , displayName , pictureUrl , app_id ) 
        values ( '${userProfile.userId}' , '${userProfile.displayName}' , '${userProfile.pictureUrl}' , ${apps.app_id} )
        on duplicate key update pictureUrl = '${userProfile.pictureUrl}' `

    const conn = null
    maria.getConnection().then( conn => {

        conn.query( sql ).then( function(results){

            res.json( results )
            conn.release();

        }).catch(err => { res.json( sql ); conn.release(); }).finally( function() { if(conn) conn.release(); });

    }).catch(err => { res.json( { status : 'maria connection faild.', err : err } ); conn.release(); }).finally( function() { if(conn) conn.release(); });

})


/*******************************************************************************************************************************************************
 * 記事関係
*******************************************************************************************************************************************************/


/* 記事IDから記事を取得

    getArticle(article_id).then(async function(result) {
        await res.json(result)
    })

*****************************************************/
function getArticle( article_id ){

    var article  = {}
    var sectionList = []

    var sql = `
SELECT
    media.b2b2c_articles.*, 
    media.b2b2c_categories.category_name, 
    media.b2b2c_categories.category_code
FROM
    media.b2b2c_articles
    LEFT JOIN
    media.b2b2c_categories
    ON 
        media.b2b2c_articles.category_id = media.b2b2c_categories.categy_id
WHERE
    media.b2b2c_articles.article_id = ${article_id} `

    return new Promise( function( resolve ) {

        const conn = null
        maria.getConnection().then( conn => {

            conn.query( sql ).then( function(results){

                article = JSON.parse( JSON.stringify( results[0] ) )
                article.status = ( article.status > 0 )? true : false

                conn.release();

            }).then( async function(){

                var getSections = `select * from media.b2b2c_sections where article_id = ${article.article_id} order by position ASC`

                conn.query( getSections ).then( async function(results){

                    article.sections = results
                    conn.release();

                }).then( async function(results){

                    var result = await Promise.all( article.sections.map( async ( a )=>{

                        if( a.file_id != null && a.file_id != '' && a.file_id > 0 ){

                            var getFile = `select * from cdn.upload_files where file_id = ${a.file_id}`

                            a.file = await conn.query( getFile ).then( (results) => {

                                return results[0];
                                conn.release();

                            }).catch(err => { res.json( getFile );conn.release(); }).finally( function() { if(conn) conn.release(); });

                        }
                        else{

                            a.file = []

                        }

                    }))

                }).then( async function(results){

                    article.main = await getFile( article.main_file_id )
                    await resolve(article);

                }).catch(err => { res.json( sections );conn.release(); }).finally( function() { if(conn) conn.release(); });

             }).catch(err => { res.json( sql );conn.release(); }).finally( function() { if(conn) conn.release(); });

        }).catch(err => { res.json( { status : 'maria connection faild.', err : err } ); }).finally( function() { if(conn) conn.release(); });

    });      

}


function getProducts( article_id ){

    var products    = []

    var sql = `select * from b2b2c_products_articles where article_id = ${article_id}`

    return new Promise( function( resolve ) {

        const conn = null
        maria.getConnection().then( conn => {

            conn.query( sql ).then( async function(results){

                products = await Promise.all( results.map( async ( p )=>{

                    var get_product = `select * from b2b2c_products where product_id = ${p.product_id}`

                    return await conn.query( get_product ).then( async function(results){

                        return results[0];
                        conn.release();

                    }).catch(err => { res.json( get_product );conn.release(); }).finally( function() { if(conn) conn.release(); });

                }))

                await conn.release();

            }).then( async function(){

                var result = await Promise.all( products.map( async ( p )=>{

                    p.is_sale            = ( p.is_sale == 0 )? false : true
                    p.limited_time_flg   = ( p.limited_time_flg == 0 )? false : true
                    p.quantity_limit_flg = ( p.quantity_limit_flg == 0 )? false : true
                    p.product_image      = await getImage( p.product_photo_id )

                }))

                await resolve(products);

            }).catch(err => { res.json( sql );conn.release(); }).finally( function() { if(conn) conn.release(); });

        }).catch(err => { res.json( { status : 'maria connection faild.', err : err } ); }).finally( function() { if(conn) conn.release(); });

    });

}

/* 記事データの取得
*****************************************************/
api.post('/getArticle', async function( req, res , next){

    var article = ''

    await getArticle(req.body.article_id).then( async function(result) {

        article = result

    }) 

    await getProducts( req.body.article_id ).then( async function(result) {

        article.products = result       

    })

    await res.json( article )

})


/*******************************************************************************************************************************************************
 * カート関連
*******************************************************************************************************************************************************/

/* カートのアップデート
*****************************************************/
api.post('/updateCart', async function( req, res , next){

    var cart   = JSON.parse( req.body.cart )
    var userId = req.body.userId

    const conn = null
    maria.getConnection().then( conn => {

        var cartClear = `delete from b2b2c_user_cart where userId = '${userId}' `
        var insertQuery  = `insert into b2b2c_user_cart (product_id,quantity,userId,app_id,price) values `

        conn.query( cartClear ).then( function(results){

            conn.release();

        }).then( async function(){

            var result = await Promise.all( cart.map( async ( c )=>{

                insertQuery += `( ${c.product_id} , ${c.quantity},'${userId}',${c.app_id},${c.price} ),`

            }))

            insertQuery = await insertQuery.slice( 0, -1 )

            await conn.query( insertQuery ).then( async function(results){

                await res.json( results )
                await conn.release();

            }).catch(err => { res.json( insertQuery ); conn.release(); }).finally( function() { if(conn) conn.release(); });

        }).catch(err => { res.json( cartClear ); conn.release(); }).finally( function() { if(conn) conn.release(); });

    }).catch(err => { res.json( { status : 'maria connection faild.', err : err } ); conn.release(); }).finally( function() { if(conn) conn.release(); });


})

/* カートクリア
*****************************************************/
api.post('/clearCart', async function( req, res , next){

    var userId = req.body.userId

    const conn = null
    maria.getConnection().then( conn => {

        var cartClear = `delete from b2b2c_user_cart where userId = '${userId}' `

        conn.query( cartClear ).then( function(results){

            res.json( results )
            conn.release();

        }).catch(err => { res.json( cartClear ); conn.release(); }).finally( function() { if(conn) conn.release(); });


    }).catch(err => { res.json( { status : 'maria connection faild.', err : err } ); conn.release(); }).finally( function() { if(conn) conn.release(); });

})



/* オーダー情報を保存
*****************************************************/
api.post('/orderComplete', async function( req, res , next){

    var orderCart   = JSON.parse( req.body.cart )
    var userProfile = JSON.parse( req.body.userProfile )
    var appConfig   = JSON.parse( req.body.appConfig )

    var orderDate   = await getNow()

    var orderPrice  = 0
    var result = await Promise.all( orderCart.map( async ( c )=>{

        orderPrice += c.price * c.quantity

    }))

    const conn = null
    await maria.getConnection().then( conn => {

        var insertOrder  = `insert into b2b2c_orders (
                                userId,displayName,order_date,order_price,order_app_id
                            ) values (
                                '${userProfile.userId}' , '${userProfile.displayName}' , '${orderDate}' , ${orderPrice} , ${appConfig.app_id}
                            )`

        conn.query( insertOrder ).then( async function(results){

            var order_id = results.insertId

            var insertQuery  = `insert into b2b2c_orders_cart (order_id,product_id,price,quantity,userId) values `

            var result = await Promise.all( orderCart.map( async ( c )=>{

                insertQuery += `( ${order_id} , ${c.product_id},${c.price},${c.quantity},'${userProfile.userId}' ),`

            }))

            insertQuery = await insertQuery.slice( 0, -1 )

            await conn.query( insertQuery ).then( async function(results){

                await conn.release();

            }).then( async function(results){

                var cartClear = `delete from b2b2c_user_cart where userId = '${userProfile.userId}' `

                conn.query( cartClear ).then( function(results){

                    res.json( { order_id : order_id } )
                    conn.release()

                }).catch(err => { res.json( cartClear ); conn.release(); }).finally( function() { if(conn) conn.release(); });

            }).catch(err => { res.json( insertQuery ); conn.release(); }).finally( function() { if(conn) conn.release(); });

        }).catch(err => { res.json( insertOrder ); conn.release(); }).finally( function() { if(conn) conn.release(); });

    }).catch(err => { res.json( { status : 'maria connection faild.', err : err } ); conn.release(); }).finally( function() { if(conn) conn.release(); });

})




/*******************************************************************************************************************************************************
 * メッセージ送信 
 * 
 * pushMessage 　一人のユーザーにメッセージを送信する
 * replyMessage　ユーザー、グループ、またはトークルームからのイベントに対して応答メッセージを送信する（replyTokenが必要。トークンは一定の期間が経過すると無効になる。トークンは1回のみ使用できる。）
 * multicast　　　複数ユーザーを指定してメッセージを送信
 * broadcast　　　全ユーザーにメッセージを送信
 * 
*******************************************************************************************************************************************************/

/* Send push message
*****************************************************/
api.post('/idTokenToProfile', async function( req, res , next){

    var idToken   = req.body.idToken 

    var client = new line.Client({
      channelAccessToken : appConfig.channel_access_token
    });



})


/* Send push message
*****************************************************/
api.post('/pushMessage', async function( req, res , next){

    var appConfig   = JSON.parse( req.body.appConfig ) 
    var messages    = JSON.parse( req.body.messages )
    var userProfile = JSON.parse( req.body.userProfile )

    var client = new line.Client({
      channelAccessToken : appConfig.channel_access_token
    });

    client.pushMessage( userProfile.userId , messages )
      .then( (results) => {
        
        res.json( results )
      
      })
      .catch((err) => {
      
        res.json( { err :err , body : req.body } )
      
      });

})



/* order_id から レシートの作成
*****************************************************/
api.post('/makeReceipt', async function( req, res , next){

    var order_id    = req.body.order_id

    var orderQuery  = `
        SELECT
            b2b2c_orders.*, 
            b2b2c_orders_cart.cart_id, 
            b2b2c_orders_cart.product_id, 
            b2b2c_orders_cart.price, 
            b2b2c_orders_cart.quantity, 
            b2b2c_products.product_code, 
            b2b2c_products.product_name, 
            b2b2c_products.product_price, 
            b2b2c_apps.app_code, 
            b2b2c_apps.app_name, 
            b2b2c_apps.liff_id, 
            b2b2c_apps.channel_secret, 
            b2b2c_apps.channel_access_token, 
            b2b2c_apps.client_name, 
            b2b2c_apps.client_code
        FROM
            b2b2c_orders
            LEFT JOIN
            b2b2c_orders_cart
            ON 
                b2b2c_orders.order_id = b2b2c_orders_cart.order_id
            LEFT JOIN
            b2b2c_products
            ON 
                b2b2c_orders_cart.product_id = b2b2c_products.product_id
            LEFT JOIN
            b2b2c_apps
            ON 
                b2b2c_orders.order_app_id = b2b2c_apps.app_id
        WHERE b2b2c_orders.order_id = ${order_id}
    `

    const conn = null
    maria.getConnection().then( conn => {

        conn.query( orderQuery ).then( async function(results){

            var order_price = number_format( results[0].order_price )

            var separator = { 'type': 'separator' , 'margin' : 'xxl' }


            ////////// receipt Object //////////////////////////////////////////////////////
            var receipt = {
                'type'     : 'bubble',
                'body'     : { 'type':'box' , 'layout':'vertical' , 'contents' : [] },
                'styles'   : { 'footer': { 'separator' : true } }
            }

                ////// receipt header ///////////////////////
                var receiptHeader = [
                    // receipt header 
                    { 'type': 'text' , 'text': 'RECEIPT' , 'weight': 'bold' , 'color': '#1DB446' , 'size': 'sm' },

                    // media name
                    { 'type': 'text' , 'text' : results[0].app_name , 'weight': 'bold' , 'size': 'md' , 'margin': 'md' },

                    // header caption
                    { 'type': 'text' , 'text': 'Produced by Hiyoshi Inc.' , 'size': 'xs' , 'color': '#aaaaaa' , 'wrap': true },

                    // separator
                    separator,
                ]
                /////////////////////////////////////////////

                ////// receipt footer ///////////////////////
                var receiptFooter = [
                    separator,
                    {
                        'type': 'box' , 'layout': 'horizontal' , 'margin': 'md',
                        'contents': [
                            { 'type': 'text' , 'text': '注文日時' , 'size': 'xs' , 'color': '#aaaaaa' , 'flex': 0 },
                            // order ID
                            { 'type': 'text' , 'text': nowJP() , 'color': '#aaaaaa' , 'size': 'xs' , 'align': 'end' }
                        ]
                    },
                    {
                        'type': 'box' , 'layout': 'horizontal' , 'margin': 'xs',
                        'contents': [
                            { 'type': 'text' , 'text': 'ORDER ID' , 'size': 'xs' , 'color': '#aaaaaa' , 'flex': 0 },
                            // order ID
                            { 'type': 'text' , 'text': '#'+ order_id , 'color': '#aaaaaa' , 'size': 'xs' , 'align': 'end' }
                        ]
                    },
                ]
                /////////////////////////////////////////////

                ////// receipt body ///////////////////////
                var receiptItems = []
                var ttlQuantity  = 0

                var result = await Promise.all( results.map( async ( c )=>{

                    var product_name = ( c.product_name.length > 12 )? c.product_name.substr( 0 , 12 ) + '...':c.product_name

                    var item = { 'type': 'box' , 'layout': 'horizontal',
                                    'contents': [ 
                                        { 
                                            'type': 'text' , 'size': 'sm' , 'color': '#555555' , 'flex': 0 , "wrap": true,
                                            'text': product_name 
                                        },
                                        {
                                            'type': 'text','size': 'sm','color': '#111111','align': 'end',
                                            'text': '× ' + c.quantity,
                                        }
                                    ]
                                }

                    receiptItems.push(item)
                    ttlQuantity += c.quantity

                }))

                var totalItems = [
                    { 
                        'type': 'box' , 'layout': 'horizontal' , 'margin': 'xxl',
                        'contents': [
                            {
                                'type': 'text',
                                'text': '商品点数',
                                'size': 'sm',
                                'color': '#555555'
                            },
                            {
                                'type': 'text',
                                'text': ttlQuantity + '点',
                                'size': 'sm',
                                'color': '#111111',
                                'align': 'end'
                            }
                        ]
                    },
                    {
                        'type': 'box' , 'layout': 'horizontal',
                        'contents': [
                            {
                                'type': 'text',
                                'text': 'お支払い合計金額',
                                'size': 'sm',
                                'color': '#555555'
                            },
                            {
                                'type': 'text',
                                'text': '￥' + order_price,
                                'size': 'sm',
                                'color': '#111111',
                                'align': 'end'
                            }
                        ]
                    }
                ]

                var receiptBody = [
                    { 'type': 'box' , 'layout': 'vertical' , 'margin': 'xxl' , 'spacing': 'sm' , 'contents': [...receiptItems,...[separator],...totalItems] } 
                ]   

                receipt.body.contents = [ ...receiptHeader , ...receiptBody , ...receiptFooter ]

                /////////////////////////////////////////////
 
            var flex = {
                "type"     : "flex",
                "altText"  : "ご購入レシート",
                "contents" :receipt
            }

            await res.json(flex)

            await conn.release()

        }).catch(err => { res.json( orderQuery ); conn.release(); }).finally( function() { if(conn) conn.release(); });

    }).catch(err => { res.json( { status : 'maria connection faild.', err : err } ); conn.release(); }).finally( function() { if(conn) conn.release(); });

})
























//// Export /////////////////////////////////////
module.exports = api
