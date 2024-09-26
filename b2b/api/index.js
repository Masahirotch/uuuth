/////////////////////////////////////////////////////////////////////////////////////////////
////////// HIYOSHI B2C アプリケーションAPI 初期設定関係 /////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////

const express = require('express')
const api = express()
// for parsing application/json
api.use(express.json())
// for parsing application/x-www-form-urlencoded
api.use(express.urlencoded({ extended: true })) 

// Services
const lineService = new (require('../services/lineService'))();

// maria DB Connection Setting
const mariadb = require('mariadb');
const maria = mariadb.createPool({
     host           : process.env.DB_HOST,
     user           : process.env.DB_USER,
     password       : process.env.DB_PASS,
     database       : process.env.DB_NAME,
     dateStrings    : true,
     connectionLimit: 1
});

// JWT decode
//import jwt_decode from "jwt-decode";
//const jwt_decode = require('jwt-decode');

// axios
const axios = require('axios');

///// dayjs
const dayjs          = require('dayjs')
const isBetween      = require('dayjs/plugin/isBetween')
const relativeTime   = require('dayjs/plugin/relativeTime')
const isSameOrAfter  = require('dayjs/plugin/isSameOrAfter');
const isSameOrBefore = require('dayjs/plugin/isSameOrBefore');


// LINE bot Setting
const line = require('@line/bot-sdk');






/////////////////////////////////////////////////////////////////////////////////////////////
////////// HELPER FUNCTIONS /////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////

/**********************************************************************************
* SQLクエリ実行
**********************************************************************************/
async function getQuery( query ){

    return await new Promise( async function( resolve ) {

        let conn = null;
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

        let conn = null;
        await maria.getConnection().then( conn => {

            conn.query( query ).then( async function(results){

                await resolve( true )
                await conn.end();

            }).catch( err => { resolve( err ); conn.release(); }).finally( function() { if (conn) conn.release(); });

        }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally( function() { if (conn) conn.release(); });

    })

}

/**********************************************************************************
* ユーザーの存在をチェックする
**********************************************************************************/
async function userVerify( user_id ){

    var query = `select * from shops_users where user_id = '${user_id}' and available = 1`

    return await new Promise( async function( resolve ) {

        let conn = null;
        await maria.getConnection().then( conn => {

            conn.query( query ).then( async function(results){

                var res = await ( results.length > 0 )? true : false 

                await resolve( res )
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
















/////////////////////////////////////////////////////////////////////////////////////////////
////////// ユーザー設定 //////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////

/**********************************************************************************
* ユーザー登録・チェック関係
**********************************************************************************/

/* ユーザーチェック
*****************************************************/
api.get( '/checkUser/*' , async function(req, res){

    var token  = await req.params[0]
    var verify = await verifyToken( token )

    var query  = await `SELECT * FROM shops_users where user_id = '${verify.sub}'`

    var user = await getQuery(query)

    if( user.length > 0 ){

        await res.json( { status : 'success' , user : user[0] })

    }
    else{

        await res.json( { status : 'error' , message : '利用登録を確認し、ログインしてご利用ください。' , user : user } )

    }

})

/************************************
 * 
 * IDトークンを検証する ( https://developers.line.biz/ja/reference/line-login/#revoke-access-token )
 * 
 * POST https://api.line.me/oauth2/v2.1/verify
 * Content-Type : application/x-www-form-urlencoded
 * 
 * リクエストボディ
 * id_token  (必須) : IDトークン
 * client_id (必須) : チャネルID - LINEが発行した、チャネル固有の識別子。
 * nonce     (任意) : 認可リクエストに指定したnonceの値を指定します。認可リクエストでnonceの値を指定しなかった場合は省略します。
 * user_id   (任意) : ユーザーID
 * 
 * 
 * レスポンス
 * {
 * amr: ['linesso']
 * aud: "1656948912"
 * exp: 1657772973
 * iat: 1657769373
 * iss: "https://access.line.me"
 * name: {displayName}
 * picture: {user picture}
 * sub: {userId}
 * }
 * 
************************************/
async function verifyToken( id_token ){

    var posts = await new URLSearchParams()
    await posts.append( 'id_token'  , id_token )
    await posts.append( 'client_id' , process.env.LOGIN_CHANNEL_ID )

    return await new Promise( async function( resolve ) {

        await axios.post( "https://api.line.me/oauth2/v2.1/verify" , posts ).then( function(result){

            resolve( result.data )

        }).catch((err) => {

            resolve( err )

        })

    })

}


/* 商品リストの取得
*****************************************************/
api.get( '/products/*' , async function(req, res){

    try {
        var shop_code  = await req.params[0]

        var query  = await `
            SELECT
                shops.shop_code, 
                shops.shop_name, 
                shops.group_code, 
                shops.del_flg, 
                shops_products.product_code, 
                m_group.product_code AS p_code, 
                m_group.now_price, 
                m_group.new_price_date, 
                m_group.new_price, 
                m_products.product_id, 
                shops_products.priority, 
                m_products.product_name, 
                m_products.unit_code, 
                m_products.base_price, 
                m_products.origin, 
                m_product_tags.tag00, 
                m_product_tags.tag01, 
                m_product_tags.tag02, 
                m_product_tags.tag03, 
                m_product_tags.tag04, 
                m_product_tags.tag05, 
                m_product_tags.tag06, 
                m_product_tags.tag07, 
                m_product_tags.tag08, 
                m_product_tags.tag09
            FROM
                shops
                LEFT JOIN
                shops_products
                ON 
                    shops.shop_code = shops_products.shop_code
                LEFT JOIN
                m_products
                ON 
                    shops_products.product_code = m_products.product_code
                LEFT JOIN
                m_product_tags
                ON 
                    m_products.product_code = m_product_tags.product_code
                INNER JOIN
                m_group
                ON 
                    shops.group_code = m_group.group_code AND
                    shops_products.product_code = m_group.product_code
            where
                shops.shop_code = '${shop_code}' and
                m_products.base_price != 0
    
            order by
                priority asc`
    
        var products = await getQuery(query)
    
        var result = await Promise.all( products.map( async ( p )=>{
    
            p.popup    = await false
            p.view     = await true
            p.lock     = await false
            p.quantity = await 0
    
            p.extract = await [
                p.product_name,
                p.origin,
                p.tag00,
                p.tag01,
                p.tag02,
                p.tag03,
                p.tag04,
                p.tag05,
                p.tag06,
                p.tag07,
                p.tag08,
                p.tag09
            ]
    
            p.extract = await p.extract.join('')
    
            return await p
    
        }))
    
    
    
        if( products.length > 0 ){
    
            res.json( { status : 'success' , products : result })
    
        }else{
    
            res.json( { status : 'success' , message : '商品リストを取得しました（登録商品：0件）' } )
    
        }

    } catch (e) {
            res.json( { status : 'error' , message : `商品リストが取得できませんでした(${e.message})` } )
    }

})



/**********************************************************************************
* ユーザー関連情報
**********************************************************************************/

/* 単位の取得
*****************************************************/
api.get( '/units' , async function(req, res){

    var query = await `select * from m_units`

    var units = await getQuery(query)

    if( units.length > 0 ){

        await res.json( { status : 'success' , message : '単位を取得しました' , units : units })

    }
    else{

        await res.json( { status : 'error' , message : '単位が取得できませんでした' } )

    }

})

/* お気に入りリストの取得
*****************************************************/
api.get( '/favirites' , async function(req, res){

    var auth        = await req.headers.authorization.replace('Bearer ','')
    var verify      = await userVerify( auth )
    var product_id  = await Number( req.params[0] )

    if( verify ){

        var getFav  = await `select product_id from user_favorites where user_id = '${auth}'`
        var results = await getQuery( getFav )

        var results = await Promise.all( results.map( async ( p )=>{

            return p.product_id

        }))

        await res.json( { status : 'success' , message : 'お気に入りに追加しました' , data : results } )

    }
    else{

        await res.json( { status : 'error' , message : '不正なアクセスです' } )

    }

})


/* お気に入りの追加
*****************************************************/
api.put( '/setFavorite/*' , async function(req, res){

    var auth        = await req.headers.authorization.replace('Bearer ','')
    var verify      = await userVerify( auth )
    var product_id  = await Number( req.params[0] )

    if( verify ){

        var query  = await `insert into user_favorites (user_id , product_id) values ('${auth}' , ${product_id})` 
        var insert = await updateQuery( query )

        if( insert ){

            var getFav  = await `select product_id from user_favorites where user_id = '${auth}'`
            var results = await getQuery( getFav )

            var results = await Promise.all( results.map( async ( p )=>{

                return p.product_id

            }))

            await res.json( { status : 'success' , message : 'お気に入りに追加しました' , data : results } )

        }

        else{

            await res.json( { status : 'error' , message : 'お気に入り追加に失敗しました' } )

        }

    }
    else{

        await res.json( { status : 'error' , message : '不正なアクセスです' } )

    }

})


/* お気に入りの削除
*****************************************************/
api.put( '/removeFavorite/*' , async function(req, res){

    var auth        = await req.headers.authorization.replace('Bearer ','')
    var verify      = await userVerify( auth )
    var product_id  = await Number( req.params[0] )

    if( verify ){

        var query      = await `delete from user_favorites where user_id = '${auth}' and product_id = ${product_id}` 
        var delete_fav = await updateQuery( query )

        if( delete_fav ){

            var getFav  = await `select product_id from user_favorites where user_id = '${auth}'`
            var results = await getQuery( getFav )

            var results = await Promise.all( results.map( async ( p )=>{

                return p.product_id

            }))

            await res.json( { status : 'success' , message : 'お気に入りに追加しました' , data : results } )

        }

        else{

            await res.json( { status : 'error' , message : 'お気に入り追加に失敗しました' } )

        }

    }
    else{

        await res.json( { status : 'error' , message : '不正なアクセスです' } )

    }


})


/* 購入履歴の取得
*****************************************************/
api.get( '/histories' , async function(req, res){

    var auth        = await req.headers.authorization.replace('Bearer ','')
    var verify      = await userVerify( auth )

    if( verify ){

        var getOrder = await `select * from orders where user_id = '${auth}' order by order_date desc`
        var order    = await getQuery( getOrder )

        var results = await Promise.all( order.map( async ( o )=>{

            var getOrderCart = await `select * from orders_cart where user_id = '${auth}' and order_id = ${o.order_id}`
            o.cart           = await getQuery( getOrderCart )
            o.popup          = await false
            return await o

        }))

        await res.json( { status : 'success' , message : '履歴を取得しました' , histories : results } )

    }
    else{

        await res.json( { status : 'error' , message : '不正なアクセスです' } )

    }

})






/* マイリストの追加
*****************************************************/
api.put( '/addMyList' , async function(req, res){

    var auth        = await req.headers.authorization.replace('Bearer ','')
    var verify      = await userVerify( auth )

    if( verify ){

        var cart = await JSON.parse( req.body.cart )
        var list_name = await req.body.list_name

        var query  = await `insert into user_mylist ( user_id , list_name ) values ( '${auth}' , '${list_name}' ) ` 
        var insert = await updateQuery( query )

        if( insert ){

            var get_insert_id = await `select list_id from user_mylist where user_id = '${auth}' order by list_id desc limit 1`
            var results       = await getQuery( get_insert_id )
            var list_id       = await results[0].list_id

            var values = await Promise.all( cart.map( async ( c )=>{

                return await`( '${c.product_id}' , ${list_id} , '${c.user_id}' , ${c.price} , '${c.group_code}' , '${c.product_code}' , '${c.product_name}' , ${c.quantity} , '${c.shop_code}' )`

            }))

            values = await values.join(',')

            var query = await `insert into user_mylist_cart 
                ( product_id , list_id , user_id , price , group_code , product_code , product_name , quantity , shop_code ) 
                values ${values}`

            var add_mylist_cart = await updateQuery( query )

            if( add_mylist_cart ){

                await res.json( { status : 'success' , message : `「${list_name}」をマイリストに追加しました` , data : list_id } )

            }
            else{

                await res.json( { status : 'error' , message : 'マイリスト追加に失敗しました' } )

            }

        }

        else{

            await res.json( { status : 'error' , message : 'マイリスト追加に失敗しました' } )

        }

    }
    else{

        await res.json( { status : 'error' , message : '不正なアクセスです' } )

    }

})

/* マイリストの取得
*****************************************************/
api.get( '/mylist' , async function(req, res){

    var auth   = await req.headers.authorization.replace('Bearer ','')
    var verify = await userVerify( auth )

    if( verify ){

        var mylist_query = await `select * from user_mylist where user_id = '${auth}'`
        var mylist       = await getQuery( mylist_query )

        var mylist = await Promise.all( mylist.map( async ( list )=>{

            var cart_query = await `select * from user_mylist_cart where list_id = ${list.list_id} and user_id = '${auth}'`
            list.cart      = await getQuery(cart_query)
            list.popup     = await false
            return await list

        }))

        await res.json( { status : 'success' , message : 'データを取得しました' , mylist : mylist } )

    }
    else{

        await res.json( { status : 'error' , message : '不正なアクセスです' } )

    }

})






























/////////////////////////////////////////////////////////////////////////////////////////////
////////// カート処理系 //////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////

/* 一時カートデータの更新
*****************************************************/
api.put( '/cartin' , async function(req, res){

    var auth   = await req.headers.authorization.replace('Bearer ','')
    var verify = await userVerify( auth )

    if( verify ){

        var cart = await JSON.parse( req.body.cart )

        // カート情報をクリア
        var clear_query = await `delete from temp_cart where user_id = '${auth}'`
        var delete_cart = await updateQuery( clear_query )


        if( delete_cart ){

            var values = await Promise.all( cart.map( async ( c )=>{

                return await`( '${c.product_id}' , '${c.user_id}' , ${c.price} , '${c.group_code}' , '${c.product_code}' , '${c.product_name}' , ${c.quantity} , '${c.shop_code}' )`

            }))

            values = await values.join(',')

            var query = await `insert into temp_cart 
                ( product_id , user_id , price , group_code , product_code , product_name , quantity , shop_code ) 
                values ${values}`

            var update_cart = await updateQuery( query )

            if( update_cart ){

                res.json( { status : 'success' , message : 'カートを更新しました' } )

            }
            else{

                await res.json( { status : 'error' , message : 'カートの更新に失敗しました' } )

            }

        }
        else{

            await res.json( { status : 'error' , message : 'カートの更新に失敗しました' } )
            
        }        

    }
    else{

        await res.json( { status : 'error' , message : '不正なアクセスです' } )

    }

})


/* 一時カートデータの取得
*****************************************************/
api.get( '/cart' , async function(req, res){

    var auth   = await req.headers.authorization.replace('Bearer ','')
    var verify = await userVerify( auth )

    if( verify ){

        var query = await `select * from temp_cart where user_id = '${auth}'`
        var cart  = await getQuery( query )

        await res.json( { status : 'success' , message : 'データを取得しました' , cart : cart } )

    }
    else{

        await res.json( { status : 'error' , message : '不正なアクセスです' } )

    }


})



























/////////////////////////////////////////////////////////////////////////////////////////////
////////// Config 系 ////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////

/* 商品リストの取得
*****************************************************/
api.get( '/deliveryConfig' , async function(req, res){

    var auth   = await req.headers.authorization.replace('Bearer ','')
    var verify = await userVerify( auth )

    if( verify ){

        var query = await `select * from m_delivery`
        var deliv = await getQuery(query)

        await res.json( { status : 'success' , message : '取得しました' , data : deliv })

    }
    else{

        await res.json( { status : 'error' , message : '不正なアクセスです' } )

    }

})









/////////////////////////////////////////////////////////////////////////////////////////////
////////// 注文処理形 ////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////

/* 注文の保存
*****************************************************/
api.put( '/ordering' , async function(req, res){

    var auth   = await req.headers.authorization.replace('Bearer ','')
    var verify = await userVerify( auth )

    if( verify ){

        var cart       = await JSON.parse( req.body.cart )
        var deliv_date = await JSON.parse( req.body.deliv_date )
        var memo       = await JSON.parse( req.body.order_memo )
        var user       = await JSON.parse( req.body.user )

        // オーダー基本情報の作成
        var make_order = await `insert into orders 
            ( user_id , shop_code , status , deliv_date , order_memo , order_date ) 
            values ( '${auth}' , '${user.shop_code}' , 'new' , '${deliv_date}' , '${memo}' , now() ) `

        var set_order = await updateQuery( make_order )

        if( set_order ){

            var new_order = await getQuery( `select * from orders where user_id = '${auth}' order by order_id desc limit 1` )
            var order_id  = await new_order[0].order_id


            // カート情報を保存
            var values = await Promise.all( cart.map( async ( c )=>{

                return await`( ${c.product_id} , ${order_id} , '${auth}' , ${c.price} , '${c.group_code}' , '${c.product_code}' , '${c.product_name}' , ${c.quantity} , '${user.shop_code}' )`

            }))

            values = await values.join(',')

            var query = await `insert into orders_cart 
                ( product_id , order_id , user_id , price , group_code , product_code , product_name , quantity , shop_code  ) 
                values ${values}`

            var create_cart =  await updateQuery( query )

            if( create_cart ){

                var tempClear = await `delete from temp_cart where user_id = '${auth}'`
                var clear_temp_cart = await updateQuery(tempClear)

                if( clear_temp_cart ){

                    await res.json( { status : 'success' , message : '注文を送信しました' , order_id : order_id } )

                }
                else{

                    await res.json( { status : 'success' , message : '注文を送信しました' , order_id : order_id , note : 'notdeletetempcart' } )

                }

            }
            else{

                await res.json( { status : 'error' , message : 'カート情報の作成に失敗しました' } )

            }

        }
        else{

            await res.json( { status : 'error' , message : '注文の作成に失敗しました' } )

        }

    }
    else{

        await res.json( { status : 'error' , message : '不正なアクセスです' } )

    }

})






/* 一時カートデータの取得
*****************************************************/
api.get( '/receipt/*' , async function(req, res){

    var auth   = await req.headers.authorization.replace('Bearer ','')
    var verify = await userVerify( auth )

    if( verify ){

        var order_id = await req.params[0]
        var receipt  = await createReceipt( order_id , auth )

        await res.json( { status : 'success' , message : 'データを取得しました' , receipt : receipt } )

    }
    else{

        await res.json( { status : 'error' , message : '不正なアクセスです' } )

    }

})

/**
 * api send line message to many users
 */
api.post('/send-multiple-messages/*', async function (req, res) {
    try {
        const auth = await req.headers.authorization.replace('Bearer ', '')
        const {token} = req.body

        const verify = await userVerify(auth)

        if (verify) {
            const query = await `SELECT DISTINCT shop_code FROM shops_users WHERE user_id = '${auth}' ORDER BY uid ASC`
            let shopCodes = await getQuery(query)

            shopCodes = await Promise.all(shopCodes.map(item => item.shop_code))

            const order_id = await req.params[0]
            const receipt  = await createReceipt(order_id, auth, token)

            await sendMultipleMessages(shopCodes, receipt)

            await res.json({
                status : 'success', 
                message : 'データを取得しました'
            })
        } else {
            await res.json({
                status: 'error',
                message: '不正なアクセスです'
            })
        }
    } catch (error) {
        await res.json({
            status: 'error',
            message: error.message
        })
    }
})


async function createReceipt( order_id , auth, token = null ){

    var query   = await `select * from orders where user_id = '${auth}' and order_id = ${order_id}`
    var order   = await getQuery( query )

    var getCart = await `select * from orders_cart where user_id = '${auth}' and order_id = ${order_id}`
    var cart    = await getQuery( getCart )

    var receipt   = await {}
    var separator = await {"type": "separator","margin": "xxl"}

    receipt.type   = await 'bubble'
    receipt.styles = await { footer : { separator : true } }
    receipt.body   = await { layout : 'vertical', type : 'box' , contents : [] }
    receipt.body.contents[0] = await { type: 'text', text: `${process.env.APP_NAME} B2B Market.`, weight: 'bold', color: '#1DB446', size: 'sm'} 
    receipt.body.contents[1] = await { type: 'text', text: 'ご注文内容', weight: 'bold', size: 'xl', margin: 'md'} 
    receipt.body.contents[2] = await { type: 'text', text: 'ご注文ありがとうございます！', size: 'xs', color: '#aaaaaa', wrap: true} 
    receipt.body.contents[3] = await separator
    receipt.body.contents[4] = await {"type": "box","layout": "vertical","margin": "xxl","spacing": "sm", contents:[] }
    receipt.body.contents[5] = await separator

    receipt.body.contents[6] = await {type: 'box', layout: 'horizontal', margin: 'md', contents:[] }
    receipt.body.contents[6].contents[0] = await {type: 'text', text: '注文番号', size: 'xs', color: '#777777', flex: 0 }
    receipt.body.contents[6].contents[1] = await {type: 'text', text: order_id , color: '#777777', size: 'xs', align: 'end' }

    var totalPrice    = await 0
    var totalType     = await 0
    var totalQuantity = await 0

    // 商品リスト
    var buy_items = await Promise.all( cart.map( async ( c )=>{

        totalPrice    += c.price * c.quantity
        totalQuantity += c.quantity
        totalType     += 1

        return await {"type": "box","layout": "vertical",
          "contents"  : [{
              "type"  : "text",
              "text"  : `${c.product_name} x ${c.quantity}`,
              "size"  : "sm",
              "color" : "#555555",
              "flex"  : 0,
              "wrap"  : true
          },
          {
              "type"  : "text",
              "text"  : "￥" + number_format( c.price * c.quantity ),
              "size"  : "sm",
              "color" : "#111111",
              "align" : "end",
              "weight": "bold"
          }]
        }

    }))

    var totals = await []

    // 商品合計点数
    await totals.push( {"type": "box","layout": "horizontal","margin": "xxl", "contents"  : [{
          "type"  : "text",
          "text"  : "注文点数",
          "size"  : "sm",
          "color" : "#555555",
          "flex"  : 0,
      },
      {
          "type"  : "text",
          "text"  : number_format( totalType ) + "種 / " + number_format( totalQuantity ) + "点",
          "size"  : "sm",
          "color" : "#111111",
          "align" : "end",
          "weight": "bold"
      }]
    })

    // 商品合計金額
    await totals.push( {"type": "box","layout": "horizontal","margin": "xxl", "contents"  : [{
          "type"  : "text",
          "text"  : "注文合計",
          "size"  : "sm",
          "color" : "#555555",
          "flex"  : 0,
      },
      {
          "type"  : "text",
          "text"  : "￥" + number_format( totalPrice ),
          "size"  : "sm",
          "color" : "#111111",
          "align" : "end",
          "weight": "bold"
      }]
    })

    // 注文日時
    await totals.push( {"type": "box","layout": "horizontal","margin": "xxl", "contents"  : [{
          "type"  : "text",
          "text"  : "注文日時",
          "size"  : "sm",
          "color" : "#555555",
          "flex"  : 0,
      },
      {
          "type"  : "text",
          "text"  : dayjs( order[0].order_date ).format('YYYY-MM-DD HH:mm'),
          "size"  : "sm",
          "color" : "#111111",
          "align" : "end",
          "weight": "bold"
      }]
    })

    // 注文者
    const verify = await verifyToken( token )
    // push message of orderer to contents
    await totals.push( {"type": "box","layout": "horizontal", "contents"  : [{
        "type"  : "text",
        "text"  : "注文者",
        "size"  : "sm",
        "color" : "#555555",
        "flex"  : 0,
    },
    {
        "type"  : "text",
        "text"  : verify?.name ?? 'No name',
        "size"  : "sm",
        "color" : "#111111",
        "align" : "end",
        "weight": "bold"
    }]
  })

    // 配達予定日時
    var delivday = await dayjs( order[0].deliv_date ).format('YYYY-MM-DD')
    var weekday  = await weekdays( dayjs( order[0].deliv_date ).day() )

    await totals.push( {"type": "box","layout": "horizontal", "contents"  : [{
          "type"  : "text",
          "text"  : "配達予定日",
          "size"  : "sm",
          "color" : "#555555",
          "flex"  : 0
      },
      {
          "type"  : "text",
          "text"  : `${delivday} (${weekday})`,
          "size"  : "sm",
          "color" : "#111111",
          "align" : "end",
          "weight": "bold"
      }]
    })

    var body = await [ ...buy_items , ...[separator],...totals ]
    receipt.body.contents[4].contents = await body



    if( order[0].order_memo != void 0 && order[0].order_memo != '' ){

        return await [
          {
            "type": "flex",
            "altText": "オーダーの通知",
            "contents": receipt
          },
          {
            "type" : "text",
            "text" : `【MEMO】\n\n${order[0].order_memo}`
          },
        ]

    }
    else{

        return await [
          {
            "type": "flex",
            "altText": "オーダーの通知",
            "contents": receipt
          }
        ]

    }





}


/*
* ID 連携
*************************************************************/
api.put('/addShopUser', async function (req, res) {
    const auth = await req.headers.authorization.replace('Bearer ', '');
    const verify = await userVerify(auth);

    let shopCode = req.body.shopCode

    let parentCheck = await getQuery(`select *
                                      from shops_users
                                      where shop_code = '${shopCode}'`)

    // ユーザー登録がない場合
    if (!verify) {
        // ユーザー登録なしで親番もなしの場合は親番登録
        if (parentCheck.length === 0) {
            await updateQuery(`replace
            into shops_users(user_id,shop_code,parent_uid) values ('${auth}', '${shopCode}',0)`)

            await res.json({status: 'success', message: `success`, data: 'parent'})
        }
        // 親番がある場合は子番号として登録
        else {
            let parentUid = 0;
            parentCheck.forEach(function (val) {
                if (val.parent_uid === 0) {
                    parentUid = val.uid;
                }
            });

            await updateQuery(`replace
            into shops_users(user_id,shop_code,parent_uid) values ('${auth}', '${shopCode}','${parentUid}')`)

            await res.json({status: 'success', message: `success`, data: parentUid === 0 ? 'parent' : 'child'})
        }
    }
    // ユーザー登録がある場合
    else {
        await res.json({status: 'success', message: `success`, data: 'already'})
    }
})

function number_format(value) {

    let formatter = new Intl.NumberFormat('ja-JP');
    return formatter.format(value);

}

async function weekdays( value ){

    var weeklist = await [ '日','月','火','水','木','金','土' ]
    return await weeklist[value]

}

/**
 * sendMultipleMessages
 * @param {int[]} shopCodes shopCodes
 * @param {any} receipt Line Flex Message
 * @returns any
 */
async function sendMultipleMessages(shopCodes, receipt) {
    const query = await `SELECT DISTINCT user_id FROM shops_users WHERE shop_code IN (${shopCodes})`
    let users = await getQuery(query)
    
    users = await Promise.all(users.map(user => user.user_id))

    return await lineService.sendMultipleMessages(users, receipt)
}

//// Export /////////////////////////////////////
module.exports = api
