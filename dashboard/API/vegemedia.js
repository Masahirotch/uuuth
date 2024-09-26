/////////////////////////////////////////////////////////////////////////////////////////////
//////////  MEDIA API  //////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////

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
     database : process.env.DB_MEDIA,
     connectionLimit: 1
});


// LINE bot Setting ////////////////////////////////// 
const line = require('@line/bot-sdk');




/////////////////////////////////////////////////////////////////////////////////////////////
////////// helper functions ////////////////////////////////////////////////////////////////
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
                conn.release();
                conn.end();

            }).catch(err => { res.json( sql ); conn.release(); }).finally(function() { if(conn) conn.release(); });

        }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally( function() { if(conn) conn.release(); });

    });      

}







/////////////////////////////////////////////////////////////////////////////////////////////
////////// データベース処理系 /////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////

/* TEST
*****************************************************/
api.get('/', (req, res) => {

    res.json({ message: 'bad request!' })

})

api.post('/test', function( req, res , next){

    res.json( 'media api test ok.' )

})


/**********************************************************************
定数の取得
**********************************************************************/

/*  カテゴリ一覧を取得
*****************************************************/
api.post('/getCategories', function( req, res , next){

    const conn = null
    maria.getConnection().then( conn => {

        var getCategories = `select * from b2b2c_categories`

        conn.query( getCategories ).then( function(results){

            res.json( results )
            conn.release();

        }).catch( err => { res.json( getCategories );conn.release(); }).finally(function() { if(conn) conn.release(); });

    }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally(function() { if(conn) conn.release(); }); 

})








/**********************************************************************
記事の取得
**********************************************************************/

/* 記事IDから記事を取得
*****************************************************/
api.post('/getArticleById', function( req, res , next ){

    var article  = {}
    var sectionList = []

    var sql = `
SELECT
    b2b2c_articles.*, 
    b2b2c_categories.category_name, 
    b2b2c_categories.category_code, 
    b2b2c_analysis.deliveries, 
    b2b2c_analysis.reach, 
    b2b2c_analysis.browsing, 
    b2b2c_analysis.browsing_user, 
    b2b2c_apps.app_code, 
    b2b2c_apps.app_name, 
    b2b2c_apps.channel_id, 
    b2b2c_apps.channel_secret, 
    b2b2c_apps.channel_access_token
FROM
    b2b2c_articles
    LEFT JOIN
    b2b2c_categories
    ON 
        b2b2c_articles.category_id = b2b2c_categories.categy_id
    LEFT JOIN
    b2b2c_analysis
    ON 
        b2b2c_articles.article_id = b2b2c_analysis.article_id
    LEFT JOIN
    b2b2c_apps
    ON 
        b2b2c_articles.app_id = b2b2c_apps.app_id
WHERE
    b2b2c_articles.article_id = ${req.body.article_id} `

    const conn = null
    maria.getConnection().then( conn => {

        conn.query( sql ).then( function(results){

            article = JSON.parse( JSON.stringify( results[0] ) )
            article.status = ( article.status > 0 )? true : false

        }).then( async function(){

            var getSections = `select * from b2b2c_sections where article_id = ${article.article_id} order by position ASC`

            conn.query( getSections ).then( async function(results){

                article.sections = results
                conn.release();

            }).then( async function(results){

                var result = await Promise.all( article.sections.map( async ( a )=>{

                    if( a.file_id != null && a.file_id != '' && a.file_id > 0 ){

                        var getFile = `select * from cdn.upload_files where file_id = ${a.file_id}`

                        a.file = await conn.query( getFile ).then( (results) => {

                            return results[0]
                            conn.release();

                        }).catch(err => { res.json( getFile );conn.release(); }).finally(function() { if(conn) conn.release(); });

                    }
                    else{

                        a.file = []

                    }

                }))

                await res.json( article )
                await conn.release();

            }).catch(err => { res.json( getSections );conn.release(); }).finally(function() { if(conn) conn.release(); });

         }).catch(err => { res.json( sql );conn.release(); }).finally(function() { if(conn) conn.release(); });

    }).catch(err => { res.json( { status : 'maria connection faild.', err : err } ); }).finally(function() { if(conn) conn.release(); });

})




/* 記事一覧を取得
*****************************************************/
api.post('/getArticles', function( req, res , next){

    var articles = []

    const conn = null
    maria.getConnection().then( conn => {

        var sql = `
SELECT
    b2b2c_articles.*, 
    b2b2c_categories.category_name, 
    b2b2c_categories.category_code, 
    b2b2c_analysis.deliveries, 
    b2b2c_analysis.reach, 
    b2b2c_analysis.browsing, 
    b2b2c_analysis.browsing_user, 
    b2b2c_apps.app_code, 
    b2b2c_apps.app_name, 
    b2b2c_apps.channel_id, 
    b2b2c_apps.channel_secret, 
    b2b2c_apps.channel_access_token
FROM
    b2b2c_articles
    LEFT JOIN
    b2b2c_categories
    ON 
        b2b2c_articles.category_id = b2b2c_categories.categy_id
    LEFT JOIN
    b2b2c_analysis
    ON 
        b2b2c_articles.article_id = b2b2c_analysis.article_id
    LEFT JOIN
    b2b2c_apps
    ON 
        b2b2c_articles.app_id = b2b2c_apps.app_id

WHERE
    b2b2c_articles.closed < 1

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

            var result_2 = await Promise.all( articles.map( async ( a )=>{

                var getMainImage = `select * from cdn.upload_files where file_id = ${a.main_file_id}`

                a.main_image = await conn.query( getMainImage ).then( (results) => {

                    return results[0]
                    conn.release();

                }).catch(err => { res.json( getMainImage );conn.release(); }).finally(function() { if(conn) conn.release(); });

            }))

            await res.json( articles )
            await conn.release();

        }).catch(err => { res.json( sql );conn.release(); }).finally(function() { if(conn) conn.release(); });

    }).catch(err => { res.json( err ); }).finally(function() { if(conn) conn.release(); });

})

/* 記事セクションの取得
*****************************************************/
api.post('/getArticleSectionsById', function( req, res , next){

    var sectionsList = []

    const conn = null
    maria.getConnection().then( conn => {

        var getSections = `select * from b2b2c_sections where article_id = ${req.body.article_id} order by position ASC`

        conn.query( getSections ).then( async function(results){

            sectionsList = results

            var result = await Promise.all( sectionsList.map( async ( a )=>{

                if( a.file_id != null && a.file_id != '' && a.file_id > 0 ){

                    var getFile = `select * from cdn.upload_files where file_id = ${a.file_id}`

                    a.file = await conn.query( getFile ).then( (results) => {

                        return results[0]
                        conn.release();

                    }).catch(err => { res.json( getFile );conn.release(); }).finally(function() { if(conn) conn.release(); });

                }
                else{

                    a.file = []

                }

            }))

            await res.json( sectionsList )
            await conn.release();

        }).catch(err => { res.json( { status : 'cdn connection faild.', err : err } );conn.release(); }).finally(function() { if(conn) conn.release(); });

    }).catch(err => { res.json( { status : 'maria connection faild.', err : err } ); }).finally(function() { if(conn) conn.release(); });

})




/* 条件を指定して記事一覧を取得
*****************************************************/
api.post('/getArticles', function( req, res , next){

    var articles = []

        var sql = `
SELECT
    b2b2c_articles.*, 
    b2b2c_categories.category_name, 
    b2b2c_categories.category_code, 
    b2b2c_analysis.deliveries, 
    b2b2c_analysis.reach, 
    b2b2c_analysis.browsing, 
    b2b2c_analysis.browsing_user, 
    b2b2c_apps.app_code, 
    b2b2c_apps.app_name, 
    b2b2c_apps.channel_id, 
    b2b2c_apps.channel_secret, 
    b2b2c_apps.channel_access_token
FROM
    b2b2c_articles
    LEFT JOIN
    b2b2c_categories
    ON 
        b2b2c_articles.category_id = b2b2c_categories.categy_id
    LEFT JOIN
    b2b2c_analysis
    ON 
        b2b2c_articles.article_id = b2b2c_analysis.article_id
    LEFT JOIN
    b2b2c_apps
    ON 
        b2b2c_articles.app_id = b2b2c_apps.app_id

WHERE
    b2b2c_articles.closed < 1

ORDER BY 
    update_date DESC
        `

    const conn = null
    maria.getConnection().then( conn => {
        
        conn.query( sql ).then( async function(results){

            articles = JSON.parse( JSON.stringify( results ) )

            var result = await Promise.all( articles.map( async ( a )=>{

                a.status = ( a.status > 0 )? true : false
                a.dialog_edit     = false
                a.dialog_delete   = false
                a.dialog_sendline = false

            }))

            var result_2 = await Promise.all( articles.map( async ( a )=>{

                var getMainImage = `select * from cdn.upload_files where file_id = ${a.main_file_id}`

                a.main_image = await conn.query( getMainImage ).then( (results) => {

                    return results[0]
                    conn.release();

                }).catch(err => { res.json( getMainImage );conn.release(); }).finally(function() { if(conn) conn.release(); });

            }))

            await res.json( articles )
            await conn.release();

        }).catch(err => { res.json( sql );conn.release(); }).finally(function() { if(conn) conn.release(); });

    }).catch(err => { res.json( err ); }).finally(function() { if(conn) conn.release(); });










})



/**********************************************************************
記事の更新
**********************************************************************/

/* 下書き| 公開中　の変更
*****************************************************/
api.post('/changeStatus', function( req, res , next){

    var status = ( req.body.status == 'true' )? 1:0

    const conn = null
    maria.getConnection().then( conn => {

        var changeStatus = `UPDATE b2b2c_articles SET status = ${status} WHERE article_id = ${req.body.article_id} `

        conn.query( changeStatus ).then( function(results){

            res.json( status )
            conn.release()

        }).catch( err => { res.json( changeStatus );conn.release();conn.destroy(); }).finally(function() { if(conn) conn.release(); });

    }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally(function() { if(conn) conn.release(); }); 

})

/* 記事の削除フラグを立てる
*****************************************************/
api.post('/articleDelete', function( req, res , next){

    const conn = null
    maria.getConnection().then( conn => {

        var articleDelete = `UPDATE b2b2c_articles SET closed = 1 WHERE article_id = ${req.body.article_id} `

        conn.query( articleDelete ).then( function(results){

            res.json( results )
            conn.release()

        }).catch( err => { res.json( articleDelete );conn.release();conn.destroy(); }).finally(function() { if(conn) conn.release(); });

    }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally(function() { if(conn) conn.release(); }); 

})


/* 記事の更新
*****************************************************/
api.post('/updateArticle', function( req, res , next){

    var article = JSON.parse( req.body.article )

    const conn = null
    maria.getConnection().then( conn => {

        var now = getNow();

        var configSet    = `
            article_title = '${escapeQuery(article.article_title)}', 
            status        = ${article.status}, 
            main_file_id  = ${article.main_file_id}, 
            publish_date  = '${article.publish_date}', 
            update_date   = '${now}', 
            category_id   = ${article.category_id}, 
            app_id        = ${article.app_id} , 
            closed        = 0 `

        var configUpdate = `update b2b2c_articles set ${configSet} where article_id = ${article.article_id} `

        // まずは 記事情報を保存
        conn.query( configUpdate ).then( function(results){

            // sectionを削除する
            var deleteSql = `delete from b2b2c_sections where article_id = ${article.article_id}`

            conn.query( deleteSql ).then( function(results){

                // sectionがあった場合
                if( article.section.length > 0 ){

                    var set = `( article_id , position , type , file_id , content )`

                    var values = ''

                    article.section.forEach( section => {

                        values += `( ${article.article_id} , ${section.position} , '${section.type}' , ${section.file_id} , '${escapeQuery(section.content)}' ),`

                    })

                    values = values.slice( 0, -1 )

                    var sectionSql = `insert into b2b2c_sections ${set} values ${values}`

                    conn.query( sectionSql ).then( function(results){

                        res.json( results )
                        conn.release()

                    }).catch( err => { res.json( sectionSql );conn.release();conn.destroy(); }).finally(function() { if(conn) conn.release(); });//記事セクションの登録

                }
                else{

                    res.json( { article_id : article.article_id } )
                    conn.release()

                }

            }).catch( err => { res.json( sectionSql );conn.release();conn.destroy(); }).finally(function() { if(conn) conn.release(); });//記事セクション削除

            conn.release();

        }).catch( err => { res.json( configUpdate );conn.release();conn.destroy(); }).finally(function() { if(conn) conn.release(); });//記事情報保存

    }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally(function() { if(conn) conn.release(); }); 

})




/* 記事の新規追加
*****************************************************/
api.post('/addNewArticle', function( req, res , next){

    var article = JSON.parse( req.body.article )

    const conn = null
    maria.getConnection().then( conn => {

        var now = getNow();

        var insertArticle = `insert into b2b2c_articles
                        ( article_title , status , main_file_id , publish_date , update_date , category_id , app_id , closed ) 
                        values 
                        ( '${escapeQuery(article.article_title)}' , ${article.status} , ${article.main_file_id} , '${now}' , '${now}', ${article.category_id}, ${article.app_id} , 0 )`

        // まずは 記事情報を保存
        conn.query( insertArticle ).then( function(results){

            var article_id = results.insertId

            var addAnalysis = `insert into b2b2c_analysis ( article_id , deliveries , reach , browsing , browsing_user )
                            values ( ${article_id} , 0 , 0 , 0 , 0 )`

            conn.query( addAnalysis ).then( function(results){

                // sectionがあった場合
                if( article.section.length > 0 ){

                    var set = `( article_id , position , type , file_id , content )`

                    var values = ''

                    article.section.forEach( section => {

                        values += `( ${results.insertId} , ${section.position} , '${section.type}' , ${section.file_id} , '${escapeQuery(section.content)}' ),`

                    })

                    values = values.slice( 0, -1 )

                    var sectionSql = `insert into b2b2c_sections ${set} values ${values}`

                    conn.query( sectionSql ).then( function(results){

                        res.json( { article_id : article_id } )
                        conn.release()

                    }).catch( err => { res.json( sectionSql );conn.release();conn.destroy(); }).finally(function() { if(conn) conn.release(); });//記事セクションの登録

                }
                else{

                        res.json( { article_id : article_id } )
                        conn.release()

                }

            }).catch( err => { res.json( addAnalysis );conn.release();conn.destroy(); }).finally(function() { if(conn) conn.release(); });//analysisの登録

            conn.release();

        }).catch( err => { res.json( insertArticle );conn.release();conn.destroy(); }).finally(function() { if(conn) conn.release(); });//記事情報保存

    }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally(function() { if(conn) conn.release(); }); 

})




/**********************************************************************
LINE メッセージ配信
**********************************************************************/

/* LINEにメッセージを送信する
*****************************************************/
api.post('/sendLine', function( req, res , next){

    var article = JSON.parse( req.body.article )
    var messages = JSON.parse( req.body.messages )

    const conn = null
    maria.getConnection().then( conn => {

        var getUser = `select userId from b2b2c_users where app_id = ${article.app_id}`

        conn.query( getUser ).then( function(results){

            //// LINE MESSAGE SEND ////////////////////////////////////////////////////////////////////////
            var users = results.map( u => { return u.userId })

            var client = new line.Client({
              channelAccessToken : article.app_config.msg_access_token
            });

            client.multicast( users , messages ).then( (results) => {


            }).then( () => {

                var reach       = users.length

                var plusDeliv = `update media.analysis set deliveries = deliveries + 1 where article_id = ${article.article_id}`
                var plusReach = `update media.analysis set reach = ${reach} where article_id = ${article.article_id}`

                var getAnaly  = `select * from media.analysis where article_id = ${article.article_id}`

                conn.query( plusDeliv ).then( function(results){

                    conn.query( plusReach ).then( function(results){

                        conn.query( getAnaly ).then( function(results){

                            res.json( results )
                            conn.release()

                        }).catch( err => { res.json( getAnaly );conn.release(); }).finally(function() { if(conn) conn.release(); });

                        conn.release();

                    }).catch( err => { res.json( plusReach );conn.release(); }).finally(function() { if(conn) conn.release(); });

                }).catch( err => { res.json( plusDeliv );conn.release(); }).finally(function() { if(conn) conn.release(); });

            }).catch((err) => { res.json( err ); });
            //// LINE MESSAGE SEND ////////////////////////////////////////////////////////////////////////

            conn.release();

        }).catch( err => { res.json( getUser );conn.release();conn.destroy(); }).finally(function() { if(conn) conn.release(); });

    }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally( function() { if(conn) conn.release(); }); 

})







/* LINEにメッセージを送信する
*****************************************************/
api.post('/sendMessageToLine', async function( req, res , next){

    var article = JSON.parse( req.body.article )
    var message = JSON.parse( req.body.message )
    var apps    = JSON.parse( req.body.apps )

    const conn = null
    maria.getConnection().then( async function(conn){

        var result = await Promise.all( apps.map( async ( a )=>{

            var users = `select userId from b2b2c_users where app_id = ${a.app_id}`

            a.users = await conn.query( users ).then( async function(results){

                return await Promise.all( results.map( async ( u )=>{

                    return u.userId

                }))

                await conn.release();

            }).catch(err => { res.json( users );conn.release(); }).finally(function() { if(conn) conn.release(); });

        }))

        await conn.release();

    }).then( async function(){

        var re = await Promise.all( apps.map( async ( o )=>{

            if( o.users.length > 0 ){

                var users = o.users
                // ユーザー

                message[0].contents.body.action.uri = "https://liff.line.me/" + o.liff_id + "/?app=" + o.app_code + "&article=" + article.article_id
                message[0].contents.hero.action.uri = "https://liff.line.me/" + o.liff_id + "/?app=" + o.app_code + "&article=" + article.article_id

                var client = new line.Client({
                  channelAccessToken : o.channel_access_token
                });

                client.broadcast( message ).then( (results) => { return results; }).catch((err) => { res.json( err ); });

                // ユーザーを指定して送信
                //client.multicast( users , message ).then( (results) => { return results; }).catch((err) => { res.json( err ); });

            }

        }))

        await res.json( message )
        await conn.release();

    }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally( function() { if(conn) conn.release(); }); 

})












/////////////////////////////////////////////////////////////////////////////////////////////
////////// B2B2C 管理画面用 //////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////

//////// [ 商品情報関係 ] ////////////////////////////////////////////////////////////////////////////////////////////////////////

/* 商品情報 取得
*****************************************************/
api.post('/getProducts', function( req, res , next){

    var sql = `select * from b2b2c_products where delete_flg != 1`

    var products = []

    const conn = null
    maria.getConnection().then( async function(conn){

        conn.query( sql ).then( async function(results){

            products = JSON.parse( JSON.stringify( results ))

            var result = await Promise.all( products.map( async ( p )=>{

                p.is_sale            = ( p.is_sale == 0 )? false : true
                p.limited_time_flg   = ( p.limited_time_flg == 0 )? false : true
                p.quantity_limit_flg = ( p.quantity_limit_flg == 0 )? false : true
                p.product_image      = await getImage( p.product_photo_id )
                p.articles           = await getProductArticles( p.product_id )
                p.dialog             = false
                if ( ! p.limited_time_start ) {p.limited_time_start = ""}
                if ( ! p.limited_time_end ) {p.limited_time_end = ""}

            }))

            await res.json( products )
            await conn.release();

        }).catch( err => { res.json( sql );conn.release();conn.destroy(); }).finally(function() { if(conn) conn.release(); });

    }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); });

})

function getImage(file_id){

    var sql = `select * from cdn.upload_files where file_id = ${file_id}`

    return new Promise( function( resolve ) {

        const conn = null
        maria.getConnection().then( function(conn) {

             conn.query( sql ).then(  function(results){

                resolve(results[0]);
                conn.release();

            }).catch(err => { res.json( sql ); conn.release(); }).finally( function() { if(conn) conn.release(); });

        }).catch( err => { res.json( { status : 'maria_api connection faild.', error : err } ); });

    });      

}

function getProductArticles(product_id){

    var sql = `select * from b2b2c_products_articles where product_id = ${product_id}`

    return new Promise( function( resolve ) {

        const conn = null
        maria.getConnection().then(  function(conn) {

             conn.query( sql ).then(  function(results){

                resolve(results);
                conn.release();

            }).catch(err => { res.json( sql ); conn.release(); }).finally( function() { if(conn) conn.release(); });

        }).catch( err => { res.json( { status : 'maria_api connection faild.', error : err } ); })

    });      

}
/****************************************************/


/* 販売ステータスの変更
*****************************************************/
api.post('/changeSaleStatus', function( req, res , next){

    var product = JSON.parse( req.body.product )
    var flg     = ( product.is_sale )? 1 : 0

    var sql = `update b2b2c_products set is_sale = ${flg} where product_id = ${product.product_id}`

    const conn = null
    maria.getConnection().then( function(conn){

        conn.query( sql ).then( function(results){

            res.json( results )
            conn.release()

        }).catch( err => { res.json( sql );conn.release();conn.destroy(); }).finally(function() { if(conn) conn.release(); });

    }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally(function() { if(conn) conn.release(); });

})


/* 商品の削除（削除フラグを立てる）
*****************************************************/
api.post('/deleteProduct', function( req, res , next){

    var product = JSON.parse( req.body.product )

    var sql = `update b2b2c_products set delete_flg = 1 where product_id = ${product.product_id}`

    const conn = null
    maria.getConnection().then( function(conn){

        conn.query( sql ).then( async function(results){

            var delete_product_articles = `delete from b2b2c_products_articles where product_id = ${product.product_id}`

            await conn.query( delete_product_articles ).then( function(results){

                conn.release()

            }).catch( err => { res.json( sql );conn.release();conn.destroy(); }).finally(function() { if(conn) conn.release(); });

            await res.json( results )
            await conn.release()

        }).catch( err => { res.json( sql );conn.release();conn.destroy(); }).finally(function() { if(conn) conn.release(); });

    }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally(function() { if(conn) conn.release(); });

})


/* 商品情報の更新
*****************************************************/
api.post('/updateProduct', function( req, res , next){

    var product = JSON.parse( req.body.product )

    const conn = null
    maria.getConnection().then( function(conn){

        var delete_product_articles = `delete from b2b2c_products_articles where product_id = ${product.product_id}`

        var product_articles_values = ``

        conn.query( delete_product_articles ).then( async function(results){

            if( product.articles.length > 0 ){

                await Promise.all( product.articles.map( async ( p )=>{

                    product_articles_values += `(${product.product_id} , ${p.article_id}),`
                    return 

                }))

                product_articles_values = await product_articles_values.replace(/.$/, '');

                var insert_product_articles = `insert into b2b2c_products_articles ( product_id , article_id ) values ${product_articles_values}`

                await conn.query( insert_product_articles ).then( async function(results){

                    conn.release();

                }).catch( err => { res.json( insert_product_articles ); conn.release(); }).finally(function() { conn.release(); });

            }

        }).then( async function(results){

            var limited_time_flg   = ( product.limited_time_flg )? 1:0
            var quantity_limit_flg = ( product.quantity_limit_flg )? 1:0

            var limited_time_start = ( product.limited_time_start != '' )? enDate( product.limited_time_start ) : ''
            var limited_time_end   = ( product.limited_time_end != ''   )? enDate( product.limited_time_end ) : ''

            var product_update = `update b2b2c_products set
                                    product_code       = '${escapeQuery(product.product_code)}',
                                    product_name       = '${escapeQuery(product.product_name)}',
                                    product_detail     = '${escapeQuery(product.product_detail)}',
                                    product_photo_id   = ${product.product_photo_id},
                                    product_price      = ${product.product_price},
                                    product_unit       = '${product.product_unit}',
                                    
                                    quantity_now       = ${product.quantity_now},
                                    quantity_limit     = ${product.quantity_limit},
                                    quantity_limit_flg = ${quantity_limit_flg},

                                    limited_time_flg   = ${limited_time_flg},
                                    limited_time_start = ${limited_time_start ? "'" + limited_time_start + "'" : null},
                                    limited_time_end   = ${limited_time_end ? "'" + limited_time_end + "'" : null}
                                  where product_id = ${product.product_id}
                                    `

            await conn.query( product_update ).then( async function(results){

                res.json( results )
                conn.release();

            }).catch( err => { res.json( product_update ); conn.release(); }).finally(function() { conn.release(); });

        }).catch( err => { res.json( delete_product_articles );conn.release(); }).finally(function() { if(conn) conn.release(); });

    }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally(function() { if(conn) conn.release(); });


})


/* 商品の新規追加
*****************************************************/
api.post('/addProduct', function( req, res , next){

    var product  = JSON.parse( req.body.product )

    const conn = null
    maria.getConnection().then( function(conn){

        var is_sale            = ( product.is_sale )? 1:0
        var limited_time_flg   = ( product.limited_time_flg )? 1:0
        var quantity_limit_flg = ( product.quantity_limit_flg )? 1:0

        var addProduct = `insert into 
                            b2b2c_products (
                                product_code,
                                product_name,
                                product_detail,
                                product_photo_id,
                                product_price,
                                product_unit,
                                is_sale,
                                quantity_now,
                                quantity_limit,
                                quantity_limit_flg,
                                limited_time_flg,
                                limited_time_start,
                                limited_time_end

                            ) 
                            values (
                                '${product.product_code}',
                                '${product.product_name}',
                                '${product.product_detail}',
                                ${product.product_photo_id},
                                ${product.product_price},
                                '${product.product_unit}',
                                ${is_sale},
                                ${product.quantity_now},
                                ${product.quantity_limit},
                                ${quantity_limit_flg},
                                ${limited_time_flg},
                                ${product.limited_time_start ? "'" + product.limited_time_start + "'" : null},
                                ${product.limited_time_end ? "'" + product.limited_time_end + "'" : null}
                            )`

        conn.query( addProduct ).then( async function(results){

            if( product.articles.length > 0 ){

                var product_articles_values = ''

                await Promise.all( product.articles.map( async ( p )=>{

                    product_articles_values += `(${results.insertId} , ${p.article_id}),`
                    return 

                }))

                product_articles_values = await product_articles_values.replace(/.$/, '');

                var insert_product_articles = `insert into b2b2c_products_articles ( product_id , article_id ) values ${product_articles_values}`

                await conn.query( insert_product_articles ).then( async function(results){

                    conn.release();

                }).catch( err => { res.json( insert_product_articles ); conn.release(); }).finally(function() { conn.release(); });
                
                await res.json( results )

            }

            else{

                res.json( results )

            }

        }).catch( err => { res.json( addProduct );conn.release(); }).finally(function() { if(conn) conn.release(); });

    }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally(function() { if(conn) conn.release(); });

})





//////// [ アカウント情報関係 ] ////////////////////////////////////////////////////////////////////////////////////////////////////////

function getAppConfigs(){

    var getAppConfigs = `select * from b2b2c_apps where del_flg = 0`

    return new Promise( function( resolve ) {

        const conn = null
        maria.getConnection().then(  function(conn) {

             conn.query( getAppConfigs ).then(  function(results){

                resolve( results );
                conn.release();

            }).catch(err => { res.json( getAppConfigs ); conn.release(); }).finally( function() { if(conn) conn.release(); });

        }).catch( err => { res.json( { status : 'maria_b2c connection faild.', error : err } ); }).finally(function() { if(conn) conn.release(); });

    });  

}

/* アカウント情報取得
*****************************************************/
api.post('/getAppSettings', function( req, res , next){

    getAppConfigs().then(async function(result) {

        await res.json(result)

    })

})


/* アカウント情報のアップデート
*****************************************************/
api.post('/updateApp', function( req, res , next){

    var app =  JSON.parse( req.body.app )

    var sql = `update b2b2c_apps set 
                    app_code             = '${escapeQuery(app.app_code)}',
                    app_name             = '${escapeQuery(app.app_name)}',
                    liff_id              = '${escapeQuery(app.liff_id)}',
                    channel_id           = '${escapeQuery(app.channel_id)}',
                    channel_secret       = '${escapeQuery(app.channel_secret)}',
                    channel_access_token = '${escapeQuery(app.channel_access_token)}',
                    client_name          = '${escapeQuery(app.client_name)}',
                    client_code          = '${escapeQuery(app.client_code)}'

                where app_id = ${app.app_id}`

    const conn = null
    maria.getConnection().then( function(conn){

        conn.query( sql ).then( function(results){

            res.json( results )
            conn.release()

        }).catch( err => { res.json( sql );conn.release(); }).finally(function() { if(conn) conn.release(); });

    }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally( function() { if(conn) conn.release(); });

})


/* 新規アカウント追加
*****************************************************/
api.post('/addAccount', function( req, res , next){

    var app =  JSON.parse( req.body.app )

    var sql = `insert into b2b2c_apps ( app_name ) values ( '${escapeQuery(app.app_name)}' )`

    const conn = null
    maria.getConnection().then( function(conn){

        conn.query( sql ).then( function(results){

            res.json( results )
            conn.release()

        }).catch( err => { res.json( sql );conn.release(); }).finally(function() { if(conn) conn.release(); });

    }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally( function() { if(conn) conn.release(); });

})


/* アカウント情報の削除（削除フラグを立てる）
*****************************************************/
api.post('/deleteAccount', function( req, res , next){

    var app =  JSON.parse( req.body.app )

    var sql = `update b2b2c_apps set del_flg = 1 where app_id = ${app.app_id}`

    const conn = null
    maria.getConnection().then( function(conn){

        conn.query( sql ).then( function(results){

            res.json( results )
            conn.release()

        }).catch( err => { res.json( sql );conn.release(); }).finally(function() { if(conn) conn.release(); });

    }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally( function() { if(conn) conn.release(); });

})



//////// [ 受注情報関係 ] ////////////////////////////////////////////////////////////////////////////////////////////////////////

/* オーダー情報の取得
*****************************************************/
api.post('/getOrders', function( req, res , next){

    var getOrderQuery = `select * from b2b2c_orders order by order_id desc`

    var orders = []

    const conn = null
    maria.getConnection().then( function(conn){

        conn.query( getOrderQuery ).then( async function(results){

            orders = JSON.parse( JSON.stringify( results ) )

            var re = await Promise.all( orders.map( async ( o )=>{

                o.checked = false

                var getCart = `select * from b2b2c_orders_cart where order_id = ${o.order_id} `

                conn.query( getCart ).then( async function(results){

                    o.order_cart = results
                    return o
                    conn.release()

                }).catch( err => { res.json( getCart );conn.release(); }).finally(function() { if(conn) conn.release(); });

            }))

            await conn.release()

        }).then( async function(results){

            await res.json(orders)

        }).catch( err => { res.json( getOrderQuery );conn.release(); }).finally(function() { if(conn) conn.release(); });

    }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally( function() { if(conn) conn.release(); });

})



/* オーダー情報の取得
*****************************************************/
api.post('/getOrdersBySearch', function( req, res , next){

    var filterText    = ( req.body.filterText    != '' )? ` ( b2b2c_orders.displayName like '%${escapeQuery(escapeQuery(req.body.filterText))}%' or 
                                                              b2b2c_orders.order_id like '%${escapeQuery(escapeQuery(req.body.filterText))}%' or 
                                                              b2b2c_apps.app_name like '%${escapeQuery(escapeQuery(req.body.filterText))}%' or 
                                                              b2b2c_apps.app_code like '%${escapeQuery(escapeQuery(req.body.filterText))}%' ) and ` : ``
    
    var selectedMonth = ( req.body.selectedMonth != '' )? ` order_date like '${req.body.selectedMonth}%'`:``
    var where         = ( req.body.selectedMonth != '' || req.body.filterText != '' ) ? ` where `:``

    if( req.body.selectedMonth == '' ){ filterText = filterText.replace( 'and' , '' ) }

    var getOrderQuery = `
        SELECT
            b2b2c_orders.*, 
            b2b2c_apps.app_code, 
            b2b2c_apps.app_name
        FROM
            b2b2c_orders
            LEFT JOIN
            b2b2c_apps
            ON 
                b2b2c_orders.order_app_id = b2b2c_apps.app_id
        ${where} 
            ${filterText} ${selectedMonth}`

    var orders = []

    const conn = null
    maria.getConnection().then( function(conn){

        conn.query( getOrderQuery ).then( async function(results){

            orders = JSON.parse( JSON.stringify( results ) )

            var re = await Promise.all( orders.map( async ( o )=>{

                o.checked = false

                var getCart = `select * from b2b2c_orders_cart where order_id = ${o.order_id} `

                conn.query( getCart ).then( async function(results){

                    o.order_cart = results
                    return o
                    conn.release()

                }).catch( err => { res.json( getCart );conn.release(); }).finally(function() { if(conn) conn.release(); });

            }))

            await conn.release()

        }).then( async function(results){

            await res.json(orders)

        }).catch( err => { res.json( getOrderQuery );conn.release(); }).finally(function() { if(conn) conn.release(); });

    }).catch( err => { res.json( { status : 'maria connection faild.', error : err } ); }).finally( function() { if(conn) conn.release(); });

})








module.exports = api
