/////////////////////////////////////////////////////////////////////////////////////////////
//////////  File Uploader ///////////////////////////////////////////////////////////////////
//////////  保存先 /home/ksuanagi/api/DocumentRoot/image/   //////////////////////////////////
//////////  URL https://cdn.hiyoshi.app/images/         //////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////

const express  = require('express');
const uploader = express();

const path   = require('path');
const multer = require('multer');

//const updir = path.dirname(__dirname).replace(/\\/g, "/") + "/static/upload";

const updir   = process.env.CDN_PATH;
const upload  = multer({dest:updir});

const cdn_url = process.env.CDN_URL;



// Import the filesystem module
const fs = require('fs');

// Import the imagemagick module
//const im = require('imagemagick')


// jconv ( https://github.com/narirou/jconv/blob/master/READMEja.md )
const jconv = require('jconv');


// Import the jimp module
const Jimp = require('jimp');


// maria DB Connection Setting  //////////////////////////////////
const mariadb = require('mariadb');

const maria = mariadb.createPool({
     host     : process.env.DB_HOST,
     user     : process.env.DB_USER,
     password : process.env.DB_PASS,
     database : process.env.DB_CDN,
     connectionLimit: 1
});


/////////////////////////////////////////////////////////////////////////////////////////////
//////////  HELPER FUNCTIONS ////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////

// UNIX TIMECODE 取得
function unixTime(){

    var date = new Date()
    return date.getTime()

}

// mime-type から拡張子を返す

function getExtension( val ){

    if( val =='image/jpeg' ) return '.jpg'
    if( val =='application/pdf' ) return '.pdf'
    if( val =='image/png' ) return '.png'
    if( val =='image/svg+xml' ) return '.svg'
    if( val =='image/gif' ) return '.gif'
    if( val =='video/mp4' ) return '.mp4'

    if( val =='text/csv' ) return '.csv'
    if( val =='application/vnd.ms-excel' ) return '.csv'
    if( val =='application/octet-stream' ) return '.csv'

}







/////////////////////////////////////////////////////////////////////////////////////////////
//////////  UPLOADER FUNCTIONS  /////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////

/* サムネイル不要なファイル（csvなど）のアップロード
************************************************************************/ 
uploader.post( '/fileUpload' , upload.single('file') , (req, res) => {

    const filepath    = req.file.path.replace(/\\/g, "/")
    const origin_name = req.file.originalname
    const ext         = getExtension( req.file.mimetype )
    const filename    = unixTime() + ext

    const dest        = updir + filename
    const file_url    = cdn_url + filename

    const thumb       = 'none'
    const thumb_url   = updir + filename

    if ( filepath ) {

        fs.renameSync( filepath , dest )

        const conn = null
        maria.getConnection().then( conn => {

            var sql = `insert into upload_files ( file_url , origin_name , thumb_url ) values ( '${file_url}' , '${origin_name}' , '${thumb_url}' )`

            conn.query( sql ).then( (results) => {

                var file_id = results.insertId

                var returnData = {
                    file_id     : results.insertId,
                    file_url    : file_url,
                    origin_name : origin_name,
                    thumb_url   : thumb_url
                }

                res.json( returnData )
                conn.release();

            }).catch(err => { res.json( sql ); conn.release(); }).finally(function() { if(conn) conn.release(); });

        }).catch(err => { res = 'connect error' }).finally(function() { if(conn) conn.release(); });

    }
    else {

        res.json( { message : 'エラー：アップロードできませんでした。'} )

    }

});



/* ファオルアップロード（サムネイル横幅750）
************************************************************************/ 
uploader.post( '/upload' , upload.single('file') , (req, res) => {

	const filepath    = req.file.path.replace(/\\/g, "/")
    const origin_name = req.file.originalname
    const ext         = getExtension( req.file.mimetype )
	const filename    = unixTime() + ext

    const thumb       = updir + 'thumb_' + filename
    const dest        = updir + filename

    const file_url    = cdn_url + filename
    const thumb_url   = cdn_url + 'thumb_' + filename


    if ( filepath ) {

        Jimp.read( filepath ).then( function ( image ) {

            image.resize( 750 , Jimp.AUTO  ).write( thumb )
    
        })
        .then( function ( image ) {

            fs.renameSync( filepath , dest )

            const conn = null
            maria.getConnection().then( conn => {

                var sql = `insert into upload_files ( file_url , origin_name , thumb_url ) values ( '${file_url}' , '${origin_name}' , '${thumb_url}' )`

                conn.query( sql ).then( (results) => {

                    var file_id = results.insertId

                    var returnData = {
                        file_id     : results.insertId,
                        file_url    : file_url,
                        origin_name : origin_name,
                        thumb_url   : thumb_url
                    }

                    res.json( returnData )
                    conn.release()

                }).catch(err => { res.json( sql ); conn.release(); }).finally(function() { if(conn) conn.release(); });

            }).catch(err => { res = 'connect error' }).finally(function() { if(conn) conn.release(); });

        })
        .catch(function (err) { res.json( err ); })

    }
    else {

    	res.json( { message : 'エラー：アップロードできませんでした。'} )

    }

});


/* サムネイルの横幅500px
************************************************************************/ 
uploader.post( '/upload500' , upload.single('file') , (req, res) => {

    const filepath    = req.file.path.replace(/\\/g, "/")
    const origin_name = req.file.originalname
    const ext         = getExtension( req.file.mimetype )
    const filename    = unixTime() + ext

    const thumb       = updir + 'thumb_' + filename
    const dest        = updir + filename

    const file_url    = cdn_url + filename
    const thumb_url   = cdn_url + 'thumb_' + filename


    if ( filepath ) {

        Jimp.read( filepath ).then( function ( image ) {

            image.resize( 500 , Jimp.AUTO  ).write( thumb )
    
        })
        .then( function ( image ) {

            fs.renameSync( filepath , dest )

            const conn = null
            maria.getConnection().then( conn => {

                var sql = `insert into upload_files ( file_url , origin_name , thumb_url ) values ( '${file_url}' , '${origin_name}' , '${thumb_url}' )`

                conn.query( sql ).then( (results) => {

                    var file_id = results.insertId

                    var returnData = {
                        file_id     : results.insertId,
                        file_url    : file_url,
                        origin_name : origin_name,
                        thumb_url   : thumb_url
                    }

                    res.json( returnData )
                    conn.release()

                }).catch(err => { res.json( sql ); conn.release(); }).finally(function() { if(conn) conn.release(); });

            }).catch(err => { res = 'connect error' }).finally(function() { if(conn) conn.release(); });

        })
        .catch(function (err) { res.json( err ); })

    }
    else {

        res.json( { message : 'エラー：アップロードできませんでした。'} )

    }

});



/* サムネイルの横幅750px
************************************************************************/
uploader.post( '/upload750' , upload.single('file') , (req, res) => {

    const filepath    = req.file.path.replace(/\\/g, "/")
    const origin_name = req.file.originalname
    const ext         = getExtension( req.file.mimetype )
    const filename    = unixTime() + ext

    const thumb       = updir + 'thumb_' + filename
    const dest        = updir + filename

    const file_url    = cdn_url + filename
    const thumb_url   = cdn_url + 'thumb_' + filename


    if ( filepath ) {

        Jimp.read( filepath ).then( function ( image ) {

            image.resize( 750 , Jimp.AUTO  ).write( thumb )
    
        })
        .then( function ( image ) {

            fs.renameSync( filepath , dest )

            const conn = null
            maria.getConnection().then( conn => {

                var sql = `insert into upload_files ( file_url , origin_name , thumb_url ) values ( '${file_url}' , '${origin_name}' , '${thumb_url}' )`

                conn.query( sql ).then( (results) => {

                    var file_id = results.insertId

                    var returnData = {
                        file_id     : results.insertId,
                        file_url    : file_url,
                        origin_name : origin_name,
                        thumb_url   : thumb_url
                    }

                    res.json( returnData )
                    conn.release()

                }).catch(err => { res.json( sql ); conn.release(); }).finally(function() { if(conn) conn.release(); });

            }).catch(err => { res = 'connect error' }).finally(function() { if(conn) conn.release(); });

        })
        .catch(function (err) { res.json( err ); })

    }
    else {

        res.json( { message : 'エラー：アップロードできませんでした。'} )

    }

});



/* 動画UPLOAD サムネイルサイズは動画の横幅をそのまま
************************************************************************/
uploader.post( '/movieUpload' , upload.single('file') , (req, res ) => {

    const filepath    = req.file.path.replace(/\\/g, "/")
    const origin_name = req.file.originalname
    const ext         = getExtension( req.file.mimetype )
    const filename    = unixTime() + ext
    const file_url    = cdn_url + filename
    const dest        = updir + filename

    if ( filepath ) {

        fs.renameSync( filepath , dest )

        const conn = null
        maria.getConnection().then( conn => {

            var sql = `insert into upload_files ( file_url , origin_name  ) values ( '${file_url}' , '${origin_name}' )`

            conn.query( sql ).then( (results) => {

                var file_id = results.insertId

                var returnData = {
                    file_id     : results.insertId,
                    file_url    : file_url,
                    origin_name : origin_name
                }

                res.json( returnData )
                conn.release()

            }).catch(err => { res.json( sql ); conn.release(); }).finally(function() { if(conn) conn.release(); });

        }).catch(err => { res = 'connect error' }).finally(function() { if(conn) conn.release(); });

    }
    else {

        res.json( { message : 'エラー：アップロードできませんでした。'} )

    }

});




/* サムネイル追加
************************************************************************/
uploader.post('/addThumbnail', function( req, res , next){

    var db_file       = JSON.parse( req.body.db_file )
    const filename    = db_file.file_url.replace( cdn_url , 'thumb_' ).replace( '.mp4' , '.jpg' )
    const dest        = updir + filename

    var thumb         = req.body.thumbnail
    var base64        = thumb.replace( 'data:image/jpeg;base64,' , '' )

    const decode = new Buffer.from( base64,'base64' );

    fs.writeFile( dest , decode , (err) => {

        if(err){

            res.json( err )

        }
        else{

            const conn = null
            maria.getConnection().then( conn => {

                var update = `update upload_files set thumb_url = '${cdn_url}${filename}' where file_id = ${db_file.file_id}`

                conn.query( update ).then( (results) => {

                    db_file.thumb_url = cdn_url + filename

                    res.json( db_file )
                    conn.release()

                }).catch(err => { res.json( update ); conn.release(); }).finally(function() { if(conn) conn.release(); });

            }).catch(err => { res.json( 'connect error' ) }).finally(function() { if(conn) conn.release(); });

        }

    });

})






/////////////////////////////////////////////////////////////////////////////////////////////
//////////  module.exports  /////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////

module.exports = uploader


