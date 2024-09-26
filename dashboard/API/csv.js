/////////////////////////////////////////////////////////////////////////////////////////////
//////////  Json to CSV DOWNLOADER //////////////////////////////////////////////////////////
//////////  API URL https://hiyoshi.api.line.cx/API/csv/         ////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////

// express
const express  = require('express');
const api      = express();

    // for parsing application/json
    api.use(express.json())

    // for parsing application/x-www-form-urlencoded
    api.use(express.urlencoded({ extended: true }))


// json2csv 
const { Parser , transforms: {unwind} } = require('json2csv');

// jconv ( https://github.com/narirou/jconv/blob/master/READMEja.md )
const jconv = require('jconv');

// csvtojson
const csv = require('csvtojson')

// Import the filesystem module
const fs = require('fs');


function getNow(){

  var d     = new Date();
  var year  = d.getFullYear();
  var month = d.getMonth() + 1;
  var day   = d.getDate();
  return `${year}-${month}-${day}`

}

function unixTime(){

    var date = new Date()
    return date.getTime()

}



/* download B2Cloud CSV
********************************************************************************************************************************************************/
api.post('/downloadB2cloudCSV', function( req, res , next){

	var fields = JSON.parse( req.body.B2cloudFields )
	var data   = JSON.parse( req.body.B2cloudBody )

	const filename = req.body.filename;

	// 日本語UTF-8のファイル名をダウンロードするファイル名として使う。
	res.setHeader( 'Content-disposition', 'attachment; filename*=UTF-8\'\'' + encodeURIComponent( filename ) );
	
	// Content-Typeをcsvにして文字コードもShift-JISにする。
	res.setHeader( 'Content-Type', 'text/csv; charset=Shift_JIS' );

	// JSON を TEXT(CSV) にパース
	var json2csvParser = new Parser({ fields , header: true });
	var csv = json2csvParser.parse( data );

	// SJISに変換したデータを返す
	res.send( jconv.convert( csv, 'UTF8', 'SJIS' ) );

})



/* download B2B2C CSV
********************************************************************************************************************************************************/
api.post('/downloadB2B2CorderCSV', function( req, res , next){

	var fields     = JSON.parse( req.body.order_fields )
	var data       = JSON.parse( req.body.order_list   )
	const filename = req.body.filename;

	// 日本語UTF-8のファイル名をダウンロードするファイル名として使う。
	res.setHeader( 'Content-disposition', 'attachment; filename*=UTF-8\'\'' + encodeURIComponent( filename ) );
	
	// Content-Typeをcsvにして文字コードもShift-JISにする。
	res.setHeader( 'Content-Type', 'text/csv; charset=Shift_JIS' );

	// JSON を TEXT(CSV) にパース
	var json2csvParser = new Parser({ fields , header: true });
	var csv            = json2csvParser.parse( data );

	// SJISに変換したデータを返す
	res.send( jconv.convert( csv, 'UTF8', 'SJIS' ) );

})














/* CSV to JSON Object
********************************************************************************************************************************************************/
api.post('/csvToJson',async function( req, res , next){

	var csvUrl = JSON.parse( req.body.url )
	var csvFilePath = csvUrl.thumb_url

	var csvStr = await genCSV( csvFilePath )
	//await res.json( csvStr )

	var re = await csvToJson( csvStr )

	await res.json( re )

})

function genCSV( origin_path ){
	
	return new Promise((resolve, reject) => {
	
		fs.readFile( origin_path , function(err, data){        
      
      		const buf    = new Buffer.from(data, 'binary');  
      		const retStr = jconv.decode( buf , "Shift_JIS" , "UTF-8" ); 
      
      		fs.writeFile( unixTime() + 'temp.csv' , retStr, (err) => {
      			
      			if (err) throw err;

      			resolve(retStr);  
    		
    		});
  		
  		});
 	
 	});

}

function csvToJson( csvStr, userOptions ) {

	if (typeof csvStr !== 'string') return null;

	var options = { header : 0, columnName : [], ignoreBlankLine : true };

	if (userOptions) {
		if (userOptions.header) options.header = userOptions.header;
		if (userOptions.columnName) options.columnName = userOptions.columnName;
	}

	var rows = csvStr.split('\n'),
	    json = [], line = [], row = '', data = {},
	    j, len2;

	for (var i = 0, len = rows.length; i < len; i++) {
		if (i + 1 <= options.header) continue;
		if (options.ignoreBlankLine && rows[i] === '') continue;

		line = rows[i].split(',');

		if (options.columnName.length > 0) {
			data = {};
			for (j = 0, len2 = options.columnName.length; j < len2; j++) {
				if (typeof line[j] !== 'undefined') {
					
					row = line[j];

					row = row.replace(/^"(.+)?"$/, '$1');

				} else {
					row = null;
				}

				data[options.columnName[j]] = row;
			}
			json.push(data);
		} else {
			json.push(line);
		}
	}

	return json;
};




//// Export /////////////////////////////////////
module.exports = api
