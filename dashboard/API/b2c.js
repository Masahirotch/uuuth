/////////////////////////////////////////////////////////////////////////////////////////////
//////////  HIYOSHI B2C DASHBORAD ///////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////

const escapeQuery = require('./apiUtils')

// set up Express //////////////////////////////////
const express = require('express')
const api = express()

    // for parsing application/json
    api.use(express.json())

    // for parsing application/x-www-form-urlencoded
    api.use(express.urlencoded({ extended: true }))



// maria DB Connection Setting  //////////////////////////////////
const mariadb = require('mariadb');

const maria = mariadb.createPool({
     host     : process.env.DB_HOST,
     user     : process.env.DB_USER,
     password : process.env.DB_PASS,
     database : process.env.DB_B2C,
     connectionLimit: 1
});

// LINE bot Setting //////////////////////////////////
const line = require('@line/bot-sdk');







/////////////////////////////////////////////////////////////////////////////////////////////
////////// HELPER FUNCTIONS /////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////

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


function getPrefs(){

    var res

    const conn = null
    maria.getConnection().then( conn => {

        var sql = `select * from const_pref`

        conn.query( sql ).then( (results) => {

            res = results
            conn.end()

        }).catch(err => { res.json( sql ); conn.release(); }).finally( function() { if(conn) conn.release(); });

    }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally( function() { if(conn) conn.release(); });

    return res

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

        const conn = null
        maria.getConnection().then(  function(conn) {

             conn.query( sql ).then(  function(results){

                resolve(results);

            }).catch(err => { res.json( sql ); conn.release(); }).finally( function() { if(conn) conn.release(); });

        }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally( function() { if(conn) conn.release(); });

    });

}

/*
priduct_id から価格データを取得

    getFile(req.body.file_id).then(async function(result) {
        await res.json(result)
    })

*/
function getPrices(product_id){

    var sql = `select * from product_prices where product_id = ${product_id}`

    return new Promise( function( resolve ) {

        const conn = null
        maria.getConnection().then(  function(conn) {

             conn.query( sql ).then(  function(results){

                results.map( r => {
                    r.active_flg = (r.active_flg == 1)? true:false
                    return r
                })

                resolve(results);

            }).catch(err => { res.json( sql ); conn.release(); }).finally( function() { if(conn) conn.release(); });

        }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally( function() { if(conn) conn.release(); });

    });

}

function getApps(){

    var sql = `select * from app_settings`

    return new Promise( function( resolve ) {

        const conn = null
        maria.getConnection().then(  function(conn) {

             conn.query( sql ).then(  function(results){

                resolve(results);

            }).catch(err => { res.json( sql ); conn.release(); }).finally( function() { if(conn) conn.release(); });

        }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally( function() { if(conn) conn.release(); });

    });

}

function getApp( app_code ){

    var sql = `select * from app_settings where app_code = '${app_code}'`

    return new Promise( function( resolve ) {

        const conn = null
        maria.getConnection().then(  function(conn) {

             conn.query( sql ).then(  function(results){

                resolve(results[0]);

            }).catch(err => { res.json( sql ); conn.release(); }).finally( function() { if(conn) conn.release(); });

        }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally( function() { if(conn) conn.release(); });

    });

}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////// UTILITY FUNCTION //////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**********************************************************************************
* クエリ実行
**********************************************************************************/

async function getQuery( query ){

    return await new Promise( async function( resolve ) {

        const conn = null
        await maria.getConnection().then( conn => {

            conn.query( query ).then( async function(results){

                await resolve( results )
                await conn.end();

            }).catch( err => { res.json( { err : query } ); conn.release(); }).finally( function() { if (conn) conn.release(); });

        }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally( function() { if (conn) conn.release(); });

    })

}

async function updateQuery( query ){

    return await new Promise( async function( resolve ) {

        const conn = null
        await maria.getConnection().then( conn => {

            conn.query( query ).then( async function(results){

                await resolve( true )
                await conn.end();

            }).catch( err => { res.json( { err : query } ); conn.release(); }).finally( function() { if (conn) conn.release(); });

        }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally( function() { if (conn) conn.release(); });

    })

}



/////////////////////////////////////////////////////////////////////////////////////////////
////////// データベース処理系 /////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////

/*
*****************************************************/
api.get('/', (req, res) => {

    res.json({ message: 'c - bad request!' })

})

/* test Call 'https://domain/api/test' : test code
*****************************************************/
api.post('/test', function( req, res , next){

    getFile( 167 ).then( function( resolve ) { re = resolve }).then( function( resolve ) { res.json(re) })

})


/*
*****************************************************/
api.post('/getThumb', function( req, res , next){

    const conn = null
    maria.getConnection().then( conn => {

        var get_image = `select thumb from image_thumb where gid = ${req.body.gid}`

        conn.query( get_image ).then( (results) => {

            var re = results[0].thumb.toString()

            res.json( re )
            conn.end()

        }).catch(err => { res.json( get_image );conn.release(); }).finally( function() { if(conn) conn.release(); });

    }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally( function() { if(conn) conn.release(); });

})









////////// アカウント管理関係 //////////////////////////////////////////////////////////////////////////////

/**************************************************************************
 * app list ( LINEアカウントに紐づいた管理単位 = app ) 一覧を取得
***************************************************************************/
api.post('/getAppList', function( req, res , next){

    const conn = null
    maria.getConnection().then( conn => {

        var sql = `
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
    (
        (
            b2c.app_settings
        )
        LEFT JOIN
        b2c.app_rules
        ON
            (
                (
                    b2c.app_settings.app_id = b2c.app_rules.app_id
                )
            )
    )
    LEFT JOIN
    cdn.upload_files
    ON
        b2c.app_settings.logo_file_id = cdn.upload_files.file_id
ORDER BY
    app_id ASC`

        conn.query( sql ).then( (results) => {

            results.map( r => {

                r.thumb = ( r.thumb != null && r.thumb != '' )? r.thumb.toString():r.thumb
                r.view  = false
                r.shipping  = []

                r.law_about    = ( r.law_about != null )? r.law_about:''
                r.law_method   = ( r.law_method != null )? r.law_method:''
                r.law_other    = ( r.law_other != null )? r.law_other:''
                r.law_prices   = ( r.law_prices != null )? r.law_prices:''
                r.law_returned = ( r.law_returned != null )? r.law_returned:''
                r.law_service  = ( r.law_service != null )? r.law_service:''

                r.privacy_consign     = ( r.privacy_consign != null )? r.privacy_consign:''
                r.privacy_contact     = ( r.privacy_contact != null )? r.privacy_contact:''
                r.privacy_furnishing  = ( r.privacy_furnishing != null )? r.privacy_furnishing:''
                r.privacy_header      = ( r.privacy_header != null )? r.privacy_header:''
                r.privacy_information = ( r.privacy_information != null )? r.privacy_information:''
                r.privacy_line        = ( r.privacy_line != null )? r.privacy_line:''
                r.privacy_purpose     = ( r.privacy_purpose != null )? r.privacy_purpose:''
                r.terms               = ( r.terms != null )? r.terms:''

                return r

            })

            res.json( results )
            conn.release();

        }).catch(err => { res.json( sql );conn.release(); }).finally( function() { if(conn) conn.release(); });

    }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally( function() { if(conn) conn.release(); });

})


/**************************************************************************
 * app shipping アプリ毎の配送データを取得
***************************************************************************/
api.post('/getAppShipping', function( req, res , next){

    const conn = null
    maria.getConnection().then( conn => {

        var sql = `
            select
                distinct
                aps.app_id,
                aps.pref_code,
                aps.shipping_flg,
                no_size.shipping_fee,
                s.shipping_fee shipping_fee_s,
                m.shipping_fee shipping_fee_m,
                l.shipping_fee shipping_fee_l,
                (no_size.shipping_fee is not null) no_size_flg
            from
                app_shippings aps
            left join (
                select
                    app_id,
                    pref_code,
                    shipping_fee
                from
                    app_shippings
                where
                    coalesce(size_code, '') = '') no_size on
                aps.app_id = no_size.app_id
                and aps.pref_code = no_size.pref_code
            left join (
                select
                    app_id,
                    pref_code,
                    shipping_fee
                from
                    app_shippings
                where
                    size_code = 'S') s on
                aps.app_id = s.app_id
                and aps.pref_code = s.pref_code
            left join (
                select
                    app_id,
                    pref_code,
                    shipping_fee
                from
                    app_shippings
                where
                    size_code = 'M') m on
                aps.app_id = m.app_id
                and aps.pref_code = m.pref_code
            left join (
                select
                    app_id,
                    pref_code,
                    shipping_fee
                from
                    app_shippings
                where
                    size_code = 'L') l on
                aps.app_id = l.app_id
                and aps.pref_code = l.pref_code
            where
                aps.app_id = ${req.body.app_id}
            order by
                aps.pref_code asc`

        conn.query( sql ).then( (results) => {

            results.map( r => {

                r.shipping_flg = ( r.shipping_flg == 1 )? true:false
                return r

            })

            res.json( results )
            conn.release();

        }).catch(err => { res.json( sql );conn.release(); }).finally( function() { if(conn) conn.release(); });

    }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally( function() { if(conn) conn.release(); });

})


/**************************************************************************
 * サイトロゴの登録 ( gid の更新 )
 * app_id : サイト app_id
 * gid : 登録されている画像ID
**************************************************************************/
api.post('/saveSiteLogo', function( req, res , next){

    const conn = null
    maria.getConnection().then( conn => {

        var sql = `update app_settings set logo_file_id = ${req.body.file_id} where app_id = ${req.body.app_id}`

        conn.query( sql ).then( (results) => {

            res.json( results )
            conn.release();

        }).catch(err => { res.json( sql );conn.release(); }).finally( function() { if(conn) conn.release(); });

    }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally( function() { if(conn) conn.release(); });

})


/**************************************************************************
 * app_settings の更新
 *
 * app_id : 管理ID
 * app_name
 * app_code
 * msg_channel_secret
 * msg_access_token
 * theme_id
**************************************************************************/
api.post('/updateAppSetting', function( req, res, next ){

    var appData = JSON.parse( req.body.appData )
    var app_id = req.body.app_id

    //// 既存データのアップデート
    if( app_id > 0 ){

        var set = `
            app_name = '${escapeQuery(appData.app_name)}',
            app_code = '${escapeQuery(appData.app_code)}',
            msg_access_token = '${escapeQuery(appData.msg_access_token)}',
            msg_channel_secret = '${escapeQuery(appData.msg_channel_secret)}',
            theme_id     = ${appData.theme_id},
            logo_gid     = ${appData.logo_file_id},
            logo_file_id = ${appData.logo_file_id},
            liff_id  = '${escapeQuery(appData.liff_id)}'`

        const conn = null
        maria.getConnection().then( conn => {

            var sql = `update app_settings set ${set} where app_id = ${app_id}`

            conn.query( sql ).then( (results) => {

                var del = `delete from app_shippings where app_id = ${app_id}`

                conn.query( del ).then( (results) => {

                    var loop = appData.shipping
                    var values = ``

                    loop.forEach( data => {

                        var flg = (data.shipping_flg)? 1:0
                        if (data.no_size_flg) {
                            var fee = (data.shipping_fee != '')? data.shipping_fee:0
                            values += `(${app_id} , ${data.pref_code} , ${flg} , ${fee} , null),`
                        } else {
                            var fee_s = (data.shipping_fee_s != '')? data.shipping_fee_s:0
                            var fee_m = (data.shipping_fee_m != '')? data.shipping_fee_m:0
                            var fee_l = (data.shipping_fee_l != '')? data.shipping_fee_l:0
                            values += `(${app_id} , ${data.pref_code} , ${flg} , ${fee_s} , 'S'),`
                            values += `(${app_id} , ${data.pref_code} , ${flg} , ${fee_m} , 'M'),`
                            values += `(${app_id} , ${data.pref_code} , ${flg} , ${fee_l} , 'L'),`
                        }

                    })

                    values = values.slice(0, -1);

                    var insert = `insert into app_shippings ( app_id , pref_code , shipping_flg , shipping_fee , size_code ) values ${values}`

                    conn.query( insert ).then( (results) => {

                        rules  = `(app_id , law_prices,law_method,law_returned,law_service,law_other,law_about,
                                  privacy_header,privacy_information,privacy_purpose,privacy_consign,privacy_furnishing,privacy_line,privacy_contact , terms)`

                        values = `(${app_id},'${escapeQuery(appData.law_prices)}','${escapeQuery(appData.law_method)}','${escapeQuery(appData.law_returned)}','${escapeQuery(appData.law_service)}','${escapeQuery(appData.law_other)}','${escapeQuery(appData.law_about)}',
                                    '${escapeQuery(appData.privacy_header)}','${escapeQuery(appData.privacy_information)}','${escapeQuery(appData.privacy_purpose)}','${escapeQuery(appData.privacy_consign)}','${escapeQuery(appData.privacy_furnishing)}',
                                    '${escapeQuery(appData.privacy_line)}','${escapeQuery(appData.privacy_contact)}','${escapeQuery(appData.terms)}')`

                        update = `
                                app_id              = ${app_id},
                                law_prices          = '${escapeQuery(appData.law_prices)}',
                                law_method          = '${escapeQuery(appData.law_method)}',
                                law_returned        = '${escapeQuery(appData.law_returned)}',
                                law_service         = '${escapeQuery(appData.law_service)}',
                                law_other           = '${escapeQuery(appData.law_other)}',
                                law_about           = '${escapeQuery(appData.law_about)}',
                                privacy_header      = '${escapeQuery(appData.privacy_header)}',
                                privacy_information = '${escapeQuery(appData.privacy_information)}',
                                privacy_purpose     = '${escapeQuery(appData.privacy_purpose)}',
                                privacy_consign     = '${escapeQuery(appData.privacy_consign)}',
                                privacy_furnishing  = '${escapeQuery(appData.privacy_furnishing)}',
                                privacy_line        = '${escapeQuery(appData.privacy_line)}',
                                privacy_contact     = '${escapeQuery(appData.privacy_contact)}',
                                terms               = '${escapeQuery(appData.terms)}'
                                `
                        var update_rules = `insert into app_rules ${rules} values ${values} ON DUPLICATE KEY UPDATE ${update}`

                        conn.query( update_rules ).then( (results) => {

                            res.json( { app_id : appData } )
                            conn.release();

                        }).catch(err => { res.json( update_rules );conn.release(); }).finally( function() { if(conn) conn.release(); });

                    }).catch(err => { res.json( insert );conn.release(); }).finally( function() { if(conn) conn.release(); });

                }).catch(err => { res.json( del );conn.release(); }).finally( function() { if(conn) conn.release(); });

            }).catch(err => { res.json( sql );conn.release(); }).finally( function() { if(conn) conn.release(); });

        }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally( function() { if(conn) conn.release(); });

    }

    //// 新規追加
    else{

        var logo_gid = ( appData.logo_gid != '' )? appData.logo_gid : null
        var theme_id = ( appData.theme_id != '' )? appData.theme_id : 1

        var liff_id = '1656684561-BG0lNKD7'

        var values = `( '${escapeQuery(appData.app_name)}' , '${escapeQuery(appData.app_code)}' , '${escapeQuery(appData.msg_channel_secret)}' , '${escapeQuery(appData.msg_access_token)}' , ${theme_id} , ${logo_gid} , '${escapeQuery(liff_id)}' )`
        var sql = `insert into app_settings ( app_name , app_code , msg_channel_secret , msg_access_token , theme_id , logo_gid , liff_id ) values ${values}`

        const conn = null
        maria.getConnection().then( conn => {

            conn.query( sql ).then( (results) => {

                var new_id = results.insertId

                var del = `delete from app_shippings where app_id = ${new_id}`

                conn.query( del ).then( (results) => {

                    var loop = appData.shipping
                    var values = ``

                    loop.forEach( data => {

                        var flg = (data.config.shipping_flg)? 1:0
                        var fee = (data.config.shipping_fee != '')? data.config.shipping_fee:0

                        values += `(${new_id} , ${data.pref_code} , ${flg} , ${fee}),`

                    })

                    values = values.slice(0, -1);

                    var insert = `insert into app_shippings ( app_id , pref_code , shipping_flg , shipping_fee ) values ${values}`

                    conn.query( insert ).then( (results) => {

                        res.json( { app_id : new_id } )
                        conn.release();

                    }).catch(err => { res.json( insert );conn.release(); }).finally( function() { if(conn) conn.release(); });

                }).catch(err => { res.json( del );conn.release(); }).finally( function() { if(conn) conn.release(); });

            }).catch(err => { res.json( sql );conn.release(); }).finally( function() { if(conn) conn.release(); });

        }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally( function() { if(conn) conn.release(); });

    }

})



////////// 商品管理 //////////////////////////////////////////////////////////////////////////////
/**************************************************************************
 ** 商品リストの取得
**************************************************************************/
api.post('/getAllProducts', function( req, res , next){

    var products = []

    const conn = null
    maria.getConnection().then( conn => {

        var sql = `
            select
                product_configs.*,
                const_sizes.size_name size_name
            from
                product_configs
            left join
            const_sizes
            on
                product_configs.size_code = const_sizes.size_code
            where
                product_configs.delete_flg = 0`

        conn.query( sql ).then( async function(results) {

            products = JSON.parse( JSON.stringify( results ) )

            var result = await Promise.all( products.map( async ( p )=>{

                await getFile(p.product_main).then(  function(result) {  p.main  = ( result.length > 0 )? result[0]:[] })
                await getFile(p.product_pict2).then( function(result) { p.pict2 = ( result.length > 0 )? result[0]:[] })
                await getFile(p.product_pict3).then( function(result) { p.pict3 = ( result.length > 0 )? result[0]:[] })
                await getPrices(p.product_id).then(  function(result) { p.prices = result })

                p.in_limitedtime     = ( p.in_limitedtime     == null || p.in_limitedtime     == 0 )? false : true
                p.in_limitedquantity = ( p.in_limitedquantity == null || p.in_limitedquantity == 0 )? false : true
                p.in_sales           = ( p.in_sales           == null || p.in_sales           == 0 )? false : true
                p.view               = false

                return p

            }))

        }).then( async function(results) {

            await res.json( products )
            await conn.release();

        }).catch(err => { res.json( insert );conn.release(); }).finally( function() { if(conn) conn.release(); });

    }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally( function() { if(conn) conn.release(); });

})






/**************************************************************************
 * 商品情報の更新
**************************************************************************/
api.post('/updateProduct', function( req, res , next){

    var product = JSON.parse( req.body.product )

    var set = `
        product_code        = '${escapeQuery(product.product_code)}',
        product_name        = '${escapeQuery(product.product_name)}',
        product_subname     = '${escapeQuery(product.product_subname)}',
        product_description = '${escapeQuery(product.product_description)}',
        product_main        = ${product.product_main},
        product_pict2       = ${product.product_pict2},
        product_pict3       = ${product.product_pict3},
        product_unit        = ${product.product_unit},
        product_stock       = ${product.product_stock},
        in_sales            = ${product.in_sales},
        in_limitedquantity  = ${product.in_limitedquantity},
        in_limitedtime      = ${product.in_limitedtime},
        sales_start         = ${(product.sales_start === null ? "null" : "'" + product.sales_start + "'")},
        sales_end           = ${(product.sales_end === null ? "null" : "'" + product.sales_end + "'")},
        article_id          = ${product.article_id},
        size_code           = '${product.size_code}'`

    const conn = null
    maria.getConnection().then( conn => {

        var sql = `update product_configs set ${set} where product_id = ${product.product_id}`

        conn.query( sql ).then( async function(results){

            var prices       = await product.prices

            var result = await Promise.all( prices.map( async ( p )=>{

                if( p.price_id != null ){

                    var update_set = await`
                        product_id = ${p.product_id},
                        app_id     = ${p.app_id},
                        price      = ${p.price},
                        tax_rate   = ${p.tax_rate},
                        active_flg = ${p.active_flg}
                    `
                    var update_sql = await `update product_prices set ${update_set} where price_id = ${p.price_id}`

                    return await conn.query( update_sql ).then( async function(results){ }).catch(err => { res.json( update_sql );conn.release(); }).finally( function() { if(conn) conn.release(); });


                }
                else{

                    var insert = await `insert into product_prices (product_id,app_id,price,tax_rate,active_flg) values(${p.product_id},${p.app_id},${p.price},${p.tax_rate},${p.active_flg})`

                    return await conn.query( insert ).then( async function(results){ }).catch(err => { res.json( insert );conn.release(); }).finally( function() { if(conn) conn.release(); });

                }

            }))

            await res.json( result )
            await conn.release();


        }).catch(err => { res.json( sql );conn.release(); }).finally( function() { if(conn) conn.release(); });

    }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally( function() { if(conn) conn.release(); });


})



/**************************************************************************
 * 商品を新規追加
**************************************************************************/
api.post('/addProduct', function( req, res , next){

    var product = JSON.parse( req.body.product )

    var prices  = JSON.parse( JSON.stringify( product.prices ))

    var columns = `( product_code , product_name , product_subname , product_description ,
                     product_main , product_pict2 , product_pict3 , product_unit , product_stock ,
                     in_sales , in_limitedquantity , in_limitedtime ,
                     sales_start , sales_end , article_id , size_code )`

    var values  = `( '${escapeQuery(product.product_code)}' , '${escapeQuery(product.product_name)}' , '${escapeQuery(product.product_subname)}' , '${escapeQuery(product.product_description)}' ,
                     ${product.product_main} , ${product.product_pict2} , ${product.product_pict3} , ${product.product_unit} , ${product.product_stock} ,
                     ${product.in_sales} , ${product.in_limitedquantity} , ${product.in_limitedtime} ,
                     ${(product.sales_start === null ? "null" : "'" + product.sales_start + "'")} ,
                     ${(product.sales_end === null ? "null" : "'" + product.sales_end + "'")} , ${product.article_id} , '${product.size_code}' )`

    const conn = null
    maria.getConnection().then( conn => {

        var insert = `insert into product_configs ${columns} values ${values}`

        conn.query( insert ).then( function(results){

            var product_id = results.insertId
            var price_columns = ` ( product_id , app_id , price , tax_rate , active_flg ) `

            var price_values  = ``

            prices.forEach( p => {

                price_values += `( ${product_id} , ${p.app_id} , ${p.price} , ${p.tax_rate} , ${p.active_flg} ),`

            })

            price_values = price_values.slice(0, -1)

            var price_sql = `insert into product_prices ${price_columns} values ${price_values} `

            conn.query( price_sql ).then( function(results){

                res.json( results )
                conn.release();

            }).catch(err => { res.json( insert );conn.release(); }).finally( function() { if(conn) conn.release(); });

        }).catch(err => { res.json( insert );conn.release(); }).finally( function() { if(conn) conn.release(); });

    }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally( function() { if(conn) conn.release(); });


})


/**************************************************************************
 ** 商品情報 > 販売フラグの更新
**************************************************************************/
api.post('/changeSalesFlag', function( req, res , next){

    const conn = null
    maria.getConnection().then( conn => {

        var sql = `update product_configs set in_sales = ${req.body.in_sales} where product_id = ${req.body.product_id}`

        conn.query( sql ).then( (results) => {

            res.json( results )
            conn.release();

        }).catch(err => { res.json( sql );conn.release(); }).finally( function() { if(conn) conn.release(); });

    }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally( function() { if(conn) conn.release(); });

})


/**************************************************************************
 * 商品の削除 （削除フラグをたてる）
**************************************************************************/
api.post('/deleteProduct', function( req, res , next){

    const conn = null
    maria.getConnection().then( conn => {

        var sql = `update product_configs set delete_flg = 1 where product_id = ${req.body.product_id}`

        conn.query( sql ).then( (results) => {

            res.json( sql )
            conn.release();

        }).catch(err => { res.json( sql );conn.release(); }).finally( function() { if(conn) conn.release(); });

    }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally( function() { if(conn) conn.release(); });


})


/**************************************************************************
 * 商品の値段リストを取得
**************************************************************************/
api.post('/getPricesById', function( req, res , next){

    const conn = null
    maria.getConnection().then( conn => {

        var sql = `select * from product_prices where product_id = ${req.body.product_id}`

        conn.query( sql ).then( (results) => {

            res.json( results )
            conn.release();

        }).catch(err => { res.json( sql );conn.release(); }).finally( function() { if(conn) conn.release(); });

    }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally( function() { if(conn) conn.release(); });

})

/**************************************************************************
 * 商品の値段リストを更新
**************************************************************************/
api.post('/updatePrices', function( req, res , next){

    var prices = JSON.parse( req.body.prices )

    var sql        = `update product_prices set `
    var price      = `price = case price_id `
    var tax_rate   = `tax_rate = case price_id `
    var active_flg = `active_flg = case price_id `
    var where = ''

    prices.forEach( pr => {

        price      += ` WHEN ${pr.price_id} THEN '${pr.price}' `
        tax_rate   += ` WHEN ${pr.price_id} THEN '${pr.tax_rate}' `
        active_flg += ` WHEN ${pr.price_id} THEN '${pr.active_flg}' `

        where += `${pr.price_id},`

    })

    price      += ` END ,`
    tax_rate   += ` END ,`
    active_flg += ` END `
    where      = where.replace(/.$/, '')
    where      = `( ${where} )`

    sql += `${price} ${tax_rate} ${active_flg} where price_id in ${where} `

    const conn = null
    maria.getConnection().then( conn => {

        conn.query( sql ).then( (results) => {

            res.json( sql )
            conn.release();

        }).catch(err => { res.json( sql );conn.release(); }).finally( function() { if(conn) conn.release(); });

    }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally( function() { if(conn) conn.release(); });

})





/**************************************************************************
 * 商品の値段リストを追加
**************************************************************************/
api.post('/addPrices', function( req, res , next){

    var prices = JSON.parse( req.body.prices )

    var columns = `( product_id , app_id , price , tax_rate , active_flg )`

    var values  = ''

    prices.forEach( pr => {

        values += `( ${pr.product_id} , ${pr.app_id} , ${pr.price} , ${pr.tax_rate} , ${pr.active_flg}  ),`

    })

    values = values.replace(/.$/, '')

    var sql = `insert into product_prices ${columns} values ${values}`

    const conn = null
    maria.getConnection().then( conn => {

        conn.query( sql ).then( (results) => {

            res.json( results )
            conn.release();

        }).catch(err => { res.json( sql );conn.release(); }).finally( function() { if(conn) conn.release(); });

    }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally( function() { if(conn) conn.release(); });

})
























////////// 固定値取得（getConst）関係 //////////////////////////////////////////////////////////////////////

/* const_pref（県リスト）を取得
*****************************************************/
api.post('/getConstPref', function( req, res , next){

    const conn = null
    maria.getConnection().then( conn => {

        var sql = `select * from const_pref`

        conn.query( sql ).then( function( results ){

            res.json( results )
            conn.release()

        }).catch(err => { res.json( { sql : sql , err : err } );conn.release(); }).finally( function() { if(conn) conn.release(); });

    }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally( function() { if(conn) conn.release(); });

})























////////// 受注管理 //////////////////////////////////////////////////////////////////////////////

/**************************************************************************
 * 受注リストの取得
**************************************************************************/
api.post('/getOrders', function( req, res , next){

    var status = req.body.status

    const conn = null
    maria.getConnection().then( conn => {

    var orderlist = `
SELECT
    order_master.order_id,
    order_master.userId,
    order_master.displayName,
    order_master.order_date,
    order_master.order_price,
    order_master.cart_price,
    order_master.shipping_fee,
    order_master.shipping_charge,
    order_master.payment_method,
    order_master.session_id,
    order_master.order_app_id,
    order_shipping.zip,
    order_shipping.pref,
    order_shipping.pref_code,
    order_shipping.city,
    order_shipping.street,
    order_shipping.address,
    order_shipping.addition,
    order_shipping.tel_1,
    order_shipping.tel_2,
    order_shipping.tel_3,
    order_shipping.name,
    order_shipping.deliv_time,
    order_shipping.note,
    order_status.status,
    order_status.last_update,
    order_status.slip_number,
    order_status.line_send_flg,
    order_stripe.amount AS stripe_amount,
    order_stripe.created AS stripe_created,
    order_stripe.status AS stripe_status,
    order_stripe.id AS stripe_id,
    app_settings.app_name,
    app_settings.app_code
FROM
    order_master
    INNER JOIN
    order_shipping
    ON
        order_master.order_id = order_shipping.order_id
    INNER JOIN
    order_status
    ON
        order_master.order_id = order_status.order_id
    INNER JOIN
    order_stripe
    ON
        order_master.order_id = order_stripe.order_id
    INNER JOIN
    app_settings
    ON
        order_master.order_app_id = app_settings.app_id
WHERE
    order_status.status = '${status}'
ORDER BY order_master.order_id DESC `

        var orders = []

        conn.query( orderlist ).then( async function(results){

            if( results.length > 0 ){

                orders = JSON.parse( JSON.stringify( results ) )

                const result = await Promise.all( orders.map( async ( order )=>{

                    // チェックボックス
                    order.checked = false

                    // 表示フラグ
                    order.view = true

                    // popup 表示のフラグ
                    order.popup = false

                    var orderProducts = `
                        select
                            order_cart.*,
                            product_configs.size_code
                        from
                            order_cart
                        left join product_configs on
                            order_cart.product_id = product_configs.product_id
                        where
                            order_cart.order_id = ${order.order_id}`

                    order.products = await conn.query( orderProducts ).then( (results) => {

                        return results
                        conn.end()

                    }).catch(err => { res.json( orderProducts );conn.release(); }).finally( function() { if(conn) conn.release(); });

                }))

            }


        })
        .then( async function(){

            res.json( orders )
            conn.release();

        })
        .catch(err => { res.json( orderlist );conn.release(); }).finally( function() { if(conn) conn.release(); });

    }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally( function() { if(conn) conn.release(); });

})



/**************************************************************************
 * 検索文字による受注取得
**************************************************************************/
api.post('/getFilterOrders', function( req, res , next){

    var filter = req.body.filter

    const conn = null
    maria.getConnection().then( conn => {

    var orderlist = `
SELECT
    order_master.order_id,
    order_master.userId,
    order_master.displayName,
    order_master.order_date,
    order_master.order_price,
    order_master.cart_price,
    order_master.shipping_fee,
    order_master.shipping_charge,
    order_master.payment_method,
    order_master.session_id,
    order_master.order_app_id,
    order_shipping.zip,
    order_shipping.pref,
    order_shipping.pref_code,
    order_shipping.city,
    order_shipping.street,
    order_shipping.address,
    order_shipping.addition,
    order_shipping.tel_1,
    order_shipping.tel_2,
    order_shipping.tel_3,
    order_shipping.name,
    order_shipping.deliv_time,
    order_shipping.note,
    order_status.status,
    order_status.last_update,
    order_status.slip_number,
    order_status.line_send_flg,
    order_stripe.amount AS stripe_amount,
    order_stripe.created AS stripe_created,
    order_stripe.status AS stripe_status,
    order_stripe.id AS stripe_id,
    app_settings.app_name,
    app_settings.app_code
FROM
    order_master
    INNER JOIN
    order_shipping
    ON
        order_master.order_id = order_shipping.order_id
    INNER JOIN
    order_status
    ON
        order_master.order_id = order_status.order_id
    INNER JOIN
    order_stripe
    ON
        order_master.order_id = order_stripe.order_id
    INNER JOIN
    app_settings
    ON
        order_master.order_app_id = app_settings.app_id
WHERE
    order_master.order_id    LIKE '%${escapeQuery(escapeQuery(filter))}%' OR
    order_master.order_id    = replace('${escapeQuery(escapeQuery(filter))}', concat(app_settings.app_code, '-'), '') OR
    order_shipping.name      LIKE '%${escapeQuery(escapeQuery(filter))}%' OR
    order_status.slip_number LIKE '%${escapeQuery(escapeQuery(filter))}%' OR
    order_master.displayName LIKE '%${escapeQuery(escapeQuery(filter))}%' `

        var orders = []

        conn.query( orderlist ).then( async function(results){

            if( results.length > 0 ){

                orders = JSON.parse( JSON.stringify( results ) )

                const result = await Promise.all( orders.map( async ( order )=>{

                    // チェックボックス
                    order.checked = false

                    // 表示フラグ
                    order.view = true

                    // popup 表示のフラグ
                    order.popup = false

                    var orderProducts = `select * from order_cart where order_id = ${order.order_id}`

                    order.products = await conn.query( orderProducts ).then( (results) => {

                        return results
                        conn.end()

                    }).catch(err => { res.json( orderProducts );conn.release(); }).finally( function() { if(conn) conn.release(); });

                }))

            }

        })
        .then( async function(){

            res.json( orders )
            conn.release();

        })
        .catch(err => { res.json( orderlist );conn.release(); }).finally( function() { if(conn) conn.release(); });

    }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally( function() { if(conn) conn.release(); });

})

/**************************************************************************
 * オーダーステータスごとの件数取得
**************************************************************************/
api.post('/getOrderCount', function( req, res , next){

    var statuses = []

    const conn = null
    maria.getConnection().then( async function(conn){

        statuses = JSON.parse( req.body.statuses )

        const result = await Promise.all(

            statuses.map( async ( status )=>{

            var statusCount = `select * from order_status where status = '${status.title}'`

            status.count = await conn.query( statusCount ).then( (results) => {

                return results.length
                conn.end()

            }).catch(err => { res.json( statusCount );conn.release(); }).finally( function() { if(conn) conn.release(); });

        }))

    }).then( function(){

        res.json( statuses )
        conn.release();

    }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally( function() { if(conn) conn.release(); });

})


/**************************************************************************
 * オーダーステータスの変更
**************************************************************************/
api.post('/changeOrderStatus', function( req, res , next){

    var ids = JSON.parse( req.body.orders ).join(',')

    var now = getNow()

    const conn = null
    maria.getConnection().then( function(conn){

        var sql = `update order_status set status = '${req.body.status}' , last_update = '${now}' where order_id in ( ${ids} )`

        conn.query( sql ).then( (results) => {

            res.json( results )
            conn.end()

        }).catch(err => { res.json( sql );conn.release(); }).finally( function() { if(conn) conn.release(); });

    }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally( function() { if(conn) conn.release(); });

})







/**************************************************************************
 * オーダー情報の修正をアップデート
**************************************************************************/
api.post('/updateOrder', function( req, res , next){

    var order = JSON.parse( req.body.order )
    var now = getNow()

    const conn = null
    maria.getConnection().then( function(conn){

        // 基本情報
        var master_update   = `update order_master set
                            order_price  = ${order.order_price} ,
                            cart_price   = ${order.cart_price} ,
                            shipping_fee = ${order.shipping_fee}
                   where order_id = ${order.order_id} `

        // 配送情報
        var shipping_update = `update order_shipping set
                            zip        = '${order.zip}' ,
                            pref       = '${escapeQuery(order.pref)}' ,
                            pref_code  = ${order.pref_code},
                            city       = '${escapeQuery(order.city)}',
                            street     = '${escapeQuery(order.street)}',
                            address    = '${escapeQuery(order.address)}',
                            addition   = '${escapeQuery(order.addition)}',
                            tel_1      = '${order.tel_1}',
                            tel_2      = '${order.tel_2}',
                            tel_3      = '${order.tel_3}',
                            name       = '${escapeQuery(order.name)}',
                            deliv_time = '${order.deliv_time}',
                            note       = '${escapeQuery(order.note)}'
                   where order_id = ${order.order_id} `

        // ステータス情報
        var slip = ( order.slip_number == 'null' )? '' : order.slip_number
        var status_update = `update order_status set
                                status      = '${order.status}' ,
                                last_update = '${now}' ,
                                slip_number = '${escapeQuery(slip)}'
                   where order_id = ${order.order_id} `




        // 基本情報
        conn.query( master_update ).then( (results) => {

            conn.query( shipping_update ).then( (results) => {

                conn.query( status_update ).then( (results) => {

                    res.json( results )
                    conn.end()

                }).catch(err => { res.json( status_update );conn.release(); }).finally( function() { if(conn) conn.release(); });

            }).catch(err => { res.json( shipping_update );conn.release(); }).finally( function() { if(conn) conn.release(); });

        }).catch(err => { res.json( master_update );conn.release(); }).finally( function() { if(conn) conn.release(); });


    }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally( function() { if(conn) conn.release(); });

})


/**************************************************************************
 * 発送伝票番号を付与して、ステータスを出荷済みに変更
**************************************************************************/
api.post('/updateOrderSlip', async function( req, res , next){

    var slipList = JSON.parse( req.body.slipList )
    var now = getNow()

    var whenThen = ``
    var order_id_list = ``

    var temp = await Promise.all( slipList.map( async ( order )=>{

        var o = order.order_id.split('-')[1]
        whenThen += ` WHEN ${o} THEN '${escapeQuery(order.slip)}' `
        order_id_list += o + ','

    }))

    const conn = null
    await maria.getConnection().then( function(conn){

        order_id_list = order_id_list.slice( 0 , -1 )

        var sql = `update order_status set
        slip_number = case order_id ${whenThen} end ,
        last_update = '${now}' ,
        status      = 'sent'
        where order_id in ( ${order_id_list} )`

        conn.query( sql ).then( (results) => {

            res.json( results )
            conn.end()

        }).catch(err => { res.json( sql );conn.release(); }).finally( function() { if(conn) conn.release(); });

    }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally( function() { if(conn) conn.release(); });


})



/**************************************************************************
 * 発送伝票番号をユーザーに送信
**************************************************************************/
api.post('/sendSlipNumber', async function( req, res , next){

    var messageObj = JSON.parse( req.body.messageObj )
    var order      = JSON.parse( req.body.order )
    var appSetting = await getApp( order.app_code )
    var now        = getNow()

    let client = await new line.Client({

        channelAccessToken : appSetting.msg_access_token,
        channelSecret      : appSetting.msg_channel_secret

    });

    await client.pushMessage( order.userId , messageObj ).then( async function(results){

        var sql     = await `update order_status set last_update = '${now}' , status = 'comp' , slip_number = '${order.slip_number}' where order_id = ${order.order_id}`

        var updated = await updateQuery( sql )

        await res.json( results )

    }).catch( err => { res.json({ message : 'push line message error.' , error : err }); })


})

















/////////////////////////////////////////////////////////////////////////////////////////////
////////// メディア情報処理系 /////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////
/* 記事一覧を取得
*****************************************************/
api.post('/getArticles', function( req, res , next){

    var articles = []

    const conn = null
    maria.getConnection().then( conn => {

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
    articles.closed = 0
ORDER BY
    update_date DESC
        `

        conn.query( sql ).then( async function(results){

            articles = JSON.parse( JSON.stringify( results ) )

            var result = await Promise.all( articles.map( async ( a )=>{

                a.status = ( a.status > 0 )? true : false

                a.dialog_edit     = false
                a.dialog_delete   = false
                a.dialog_sendline = false

            }))

        }).then( async function(results){

            res.json( articles )
            conn.release();

        }).catch(err => { res.json( sql );conn.release(); }).finally(function() { conn.release(); });

    }).catch(err => { res.json( err ); }).finally(function() { if(conn) conn.release(); });

})











//// Export /////////////////////////////////////
module.exports = api
