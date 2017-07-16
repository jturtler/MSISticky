// TO RUN this file on console
//node LogAccreditationUnknown20.js [server]:https://sandbox.orion.mariestopes.org [ouid]:X3ZW0ACPevW [program]:qaT1muhnoR2

var urlsync = require('urllib-sync');
var fs = require('fs');
var settingObj = JSON.parse(fs.readFileSync('setting.txt', 'utf8'));

// ----- App Objects -----------
var app = {};
var Util = {};
var RESTUtil = { options: { auth: settingObj.dhis.user + ':' + settingObj.dhis.password ,timeout: 600000 }, encoding: 'utf8' };
var LogProgram = {};

// ---- Util moved to top for used in global variable assign ----
Util.createArgvSetObj = function( argList )
{
	var paramsObj = {};
	
	for ( var i = 2; i < argList.length; i++ )
	{
		var param = argList[i];
		
		var endingNameIndex = param.indexOf( "]:" );

		if ( param.substring( 0, 1 ) == '[' 
			&& endingNameIndex > -1 )
		{
			var nameStr = param.substring( 1, endingNameIndex );
			var valueStr = param.substring( endingNameIndex + 2 );

			paramsObj[ nameStr ] = valueStr;
		}
	}

	return paramsObj;
}


// --------------------------------------------
// Optional Argument input (from nodeJS)

var _argvSetObj = Util.createArgvSetObj( process.argv );
var _noSubmit = ( _argvSetObj[ "noSubmit" ] !== undefined ) ? _argvSetObj[ "noSubmit" ] : false;
var _serverUrl = ( _argvSetObj[ "server" ] !== undefined ) ? _argvSetObj[ "server" ] : "http://localhost:8080";
var _sourceType = ( _argvSetObj[ "sourceType" ] !== undefined ) ? _argvSetObj[ "sourceType" ] : "Manual";		
var _ouid = ( _argvSetObj[ "ouid" ] !== undefined ) ? _argvSetObj[ "ouid" ] : "ALL";
var _program = ( _argvSetObj[ "program" ] !== undefined ) ? _argvSetObj[ "program" ] : "ALL";
var _startDate = ( _argvSetObj[ "startDate" ] !== undefined ) ? _argvSetObj[ "startDate" ] : "CURRENT";
// if 'mode' is 'Compare', it will check against Aggregate side, and only update Unknown if not exists in aggregate side
var _mode = ( _argvSetObj[ "mode" ] !== undefined ) ? _argvSetObj[ "mode" ] : "Normal";
// ----- Show Logs & Override Var -----------
// level 0: display error message, level 1: display step message and process message, level 2: display more detailed data
var _logLevel = ( _argvSetObj[ "logLevel" ] !== undefined ) ? Number( _argvSetObj[ "logLevel" ] ) : 1;
// --------------------------------------------

var _startDateFormatted = "";	// Will be set in later moment

// ==== CatOptionCombo Default (Different Between Servers) ====
var _catOptionComboDefault = "CQ6ibh5Ggda";

// ==== Attributes ====
var _attr_Status_Unknown = "HuGSI9izuuX"; // Sticky Status - Unknown
var _attr_Status_Yes = "JNCRRIJCsPl"; // Sticky Status - Yes
var _attr_Status_No = "xh8lSWP0dyv"; // Sticky Status - No
var _attr_MonthsSinceLastUpdate = "c0eTL04Qnls"; // Sticky Status - Months since last update
var _attr_DateLastChangeDate = "v6mICtv8rLm"; // Sticky Status - Date last change date

// ==== Data Elements keywords ====
var KEYWORD_DE_STATUS_UNKNOWN = "Status_Unknown" // Sticky Status - Unknown
var KEYWORD_DE_STATUS_YES = "Status_Yes";// Sticky Status - Yes
var KEYWORD_DE_STATUS_NO = "Status_No"; // Sticky Status - No
var KEYWORD_DE_MONTH_SINCE_LAST_UPDATE = "Month_Since_Last_Update"; // Sticky Status - Months since last update
var KEYWORD_DE_DATE_LAST_CHANGE_DATE = "Date_Last_Change_Date"; // Sticky Status - Date last change datev

// ==== Sql View and query URL ====
var KEYWORD_PROGRAMID = "@KEYWORD_PROGRAMID";
var KEYWORD_UNKNOWN_DEID = "@KEYWORD_UNKNOWN_DEID";

var _apiUrl = _serverUrl + "/api/";
var _queryUrl_dataValueSet = _apiUrl + 'dataValueSets';
var _queryUrl_ProgramListWithDE = _apiUrl + 'programs.json?paging=false&fields=id,name,attributeValues[value,attribute[id]]&filter=shortName:like:MSI_20-';
var _queryUrl_sqlViewData_Unknown = _apiUrl + 'sqlViews/zDtkWCN7AuF/data.json?var=prgid:' + KEYWORD_PROGRAMID + '&var=unknowndeid:' + KEYWORD_UNKNOWN_DEID;
//http://localhost:8080/api/sqlViews/SYkTNXsvuIZ/data.json?var=prgid:245008&var=unknowndeid:244959&var=ouid:ALL
// local: SYkTNXsvuIZ, prod: zDtkWCN7AuF

var _queryUrl_dataValueSet_ADD_UPDATE = _apiUrl + 'dataValueSets';
var _queryUrl_dataValueSet_DELETE = _apiUrl + 'dataValueSets?importStrategy=UPDATE';
var _queyrUrl_event = _apiUrl + 'events';

// ==== Simple Global Variable Related ====
var _logText = "";	// collect the console log data and use it to output in Log Program event.
var _foundFailedCase = false;

var _scriptName = "MSI20_Unknown.js";

// ---------------------------------------------------
// --------------- App Run Method --------------------

app.run = function() 
{	
	try
	{
		//
		LogProgram.createLog( _sourceType, function( logCreated, eventLogJson ) 
		{
			// Only if all the operation was success, consider as success.
			var overallSuccess = false;

			// Retrieve Flagged Events
			if ( _logLevel >= 1 ) Util.ConsoleLog( '<br>--- Script Start - at ' + ( new Date() ).toString() + ' with arguments: ' + JSON.stringify( process.argv ) );

			_startDateFormatted = app.formatStartDate( _startDate );


			var queryUrl = _queryUrl_ProgramListWithDE;
			queryUrl += ( _program !== "ALL" ) ? '&filter=id:eq:' + _program : '';

			// Retrieve Stricky data element list from program attributes
			app.retrieveProgramList_AndDataElements( queryUrl, function( programList )
			{
				if ( programList )
				{
					if ( _program === "ALL" )
					{
						for ( var i = 0; i < programList.length; i++)
						{
							var programData = programList[i];

							app.processProgram( programData );
						}
					}
					else
					{
						var programData = Util.getItemFromList( programList, _program, "id" );

						if ( programData ) app.processProgram( programData );
					}
				}
			});		

			if ( _logLevel >= 1 ) Util.ConsoleLog( '<br>--- Ended - at ' + ( new Date() ).toString() );

			// Setup the end time and 2 results
			overallSuccess = !_foundFailedCase;
			if ( logCreated ) LogProgram.updateLog( eventLogJson.event, !_foundFailedCase, _logText, function() {} );
		});		
	}
	catch ( ex )
	{
		Util.ConsoleLog( '<br><br>###-ERROR- on ProgramList: ' + ex.stack );
	}		
}


// JAMES 1: Get dynamic dataElement List
app.retrieveProgramList_AndDataElements = function( queryUrl, returnFunc )
{
	RESTUtil.retreiveData_Synch( queryUrl, function( response )
	{	
		var programList;

		if ( response && response.programs )
		{
			programList = response.programs;
			for( var i = 0; i < programList.length; i++ )
			{
				app.setDEData( programList[i] );
			}			
		}
		else
		{
			Util.ConsoleLog( '<br>ProgramList and DE Data Retrieval - sqlView did not return data.' );
		}	
		
		if ( returnFunc ) returnFunc( response.programs );
	});
}


app.setDEData = function( programData )
{
	programData.deList = { 
		KEYWORD_DE_STATUS_UNKNOWN: ''
		, KEYWORD_DE_STATUS_YES: ''
		, KEYWORD_DE_STATUS_NO: ''
		, KEYWORD_DE_MONTH_SINCE_LAST_UPDATE: ''
		, KEYWORD_DE_DATE_LAST_CHANGE_DATE: '' 
	};

	var attributeValues = programData.attributeValues;
	
	for( var i = 0; i < attributeValues.length; i++ )
	{
		var attrVal = attributeValues[i];
		if( attrVal.attribute.id === _attr_Status_Unknown ){
			programData.deList[KEYWORD_DE_STATUS_UNKNOWN] = attrVal.value;
		}
		else if( attrVal.attribute.id === _attr_Status_Yes ){
			programData.deList[KEYWORD_DE_STATUS_YES] = attrVal.value;
		}
		else if( attrVal.attribute.id === _attr_Status_No ){
			programData.deList[KEYWORD_DE_STATUS_NO] = attrVal.value;
		}
		else if( attrVal.attribute.id === _attr_MonthsSinceLastUpdate ){
			programData.deList[KEYWORD_DE_MONTH_SINCE_LAST_UPDATE] = attrVal.value;
		}
		else if( attrVal.attribute.id === _attr_DateLastChangeDate ){
			programData.deList[KEYWORD_DE_DATE_LAST_CHANGE_DATE] = attrVal.value;
		}
	}
}

// ---------------------------------------------------


app.processProgram = function( programData )
{
	try
	{		
		var programId = programData.id;
		var unknownDeId = programData.deList[KEYWORD_DE_STATUS_UNKNOWN];
		
		if ( programId && unknownDeId )
		{
			// Retrieve Latest events of orgunits in current month
			var queryUrl = _queryUrl_sqlViewData_Unknown + '&var=ouid:' + _ouid + '&var=startDate:' + _startDateFormatted;

			queryUrl = queryUrl.replace( KEYWORD_PROGRAMID, programData.id );
			queryUrl = queryUrl.replace( KEYWORD_UNKNOWN_DEID, programData.deList[KEYWORD_DE_STATUS_UNKNOWN] );


			if ( _logLevel >= 1 ) Util.ConsoleLog( '<br>program queryUrl: ' + queryUrl );


			// Retrieve orgunits without any event
			RESTUtil.retreiveData_Synch( queryUrl, function( json_SqlViewData )
			{			
				if ( json_SqlViewData !== undefined )
				{
					// Structure sqlView Data && submit data for each row in SQL result
					var json_structuredList = app.getStructuredList_JsonData( json_SqlViewData );
					// Util.ConsoleLog( 'json_structuredList: ' + JSON.stringify( json_structuredList ) );

					// Update Aggregate side with New Unknown and Changed to Known orgUnits
					app.process_UnknownChanges( json_structuredList, programData );

					// Update Aggregate side with orgUnits unassociated with Program
					// app.process_ClearUnknown( json_structuredList );
				}
				else
				{
					Util.ConsoleLog( '<br>sqlView did not return data: ' + queryUrl );
					_foundFailedCase = true;
				}
			});	
		}
		else
		{
			if ( _logLevel >= 1 ) Util.ConsoleLog( 'program skipped due to one of the value missing - program: ' + programId + ', unknown DE Id: ' + unknownDeId );
		}	
	}
	catch ( ex )
	{
		Util.ConsoleLog( '<br><br>###-ERROR- on Program ' + programData.id + ': ' + ex.stack );
		_foundFailedCase = true;
	}				
}



app.getStructuredList_JsonData = function( jsonSqlViewData )
{
	var json_dataAll = [];
	var json_structuredList = { 'aggr': [], 'event': [] };

	var jsonDataList = jsonSqlViewData.rows;

	// Get all data. add into structure
	for( var i = 0; i < jsonDataList.length; i++ )
	{
		var data = jsonDataList[i];

		json_dataAll.push( { 
			'ouid': data[0]
			,'type': data[1]
			,'value': data[2]
			,'prgrel': data[3]
		} );
	}


	// split the data into 2 - aggr and event
	for( var i = 0; i < json_dataAll.length; i++ )
	{
		var jsonData = json_dataAll[i];

		if ( jsonData.type === "aggr" )
		{
			// 0, 1, ""
			if ( jsonData.value === "1" ) jsonData.value = "unknown";
			else if ( jsonData.value === "0" ) jsonData.value = "known";
			else if ( jsonData.value === "" ) jsonData.value = "noData";

			if ( jsonData.prgrel === "" ) jsonData.prgrel = "notInProgram";
			else jsonData.prgrel = "inProgram";

			json_structuredList.aggr.push( jsonData );
		}
		else if ( jsonData.type === "event" )
		{
			if ( jsonData.value === "0" ) jsonData.value = "unknown";
			else jsonData.value = "known";
			
			jsonData.prgrel = "inProgram";

			json_structuredList.event.push( jsonData );
		}
	}

	return json_structuredList;
}


// Update Aggregate side with New Unknown and Changed to Known orgUnits
app.process_UnknownChanges = function( json_structuredList, programData )
{
	var aggrList = json_structuredList.aggr;
	var eventList = json_structuredList.event;


	// STEP 1. compare the aggregate and event side to see which ones are new unknown.
	for( var i = 0; i < eventList.length; i++ )
	{
		var eventData = eventList[i];

		try
		{
			if ( eventData.value === "unknown" )
			{
				if ( _mode === "Compare" )
				{
					// check if aggregate list has this
					var matchAggrData = Util.getItemFromList( aggrList, eventData.ouid, "ouid" );

					// If event side detects 'unknown' and aggregate side does not already have it as 'unknown', submit it for next 24 months (starting from this month)
					if ( matchAggrData === undefined || matchAggrData.value !==  "unknown" )
					{
						app.submitDataToAggr( eventData, "unknown", programData );
					}
				}
				else
				{
					app.submitDataToAggr( eventData, "unknown", programData );
				}
			}
		}
		catch ( ex )
		{
			Util.ConsoleLog( '<br>== FAILED During OrgUnit: ' + eventData.ouid );			
			_foundFailedCase = true;
		}	
	}
}


app.process_ClearUnknown = function( json_structuredList )
{
	var aggrList = json_structuredList.aggr;
	//var eventList = json_structuredList.event;

	// STEP 1. look at aggregate data and remove the ou data unassociated to program.
	for( var i = 0; i < aggrList.length; i++ )
	{
		var aggrData = aggrList[i];

		// For now, only update the 'unknown' ones..  <-- rather than
		// updating all Unassociated ones (OUs to program)
		if ( aggrData.value === "unknown" && aggrData.prgrel === "notInProgram" )
		{
			app.submitDataToAggr( aggrData, "notInProgram" );
		}
	}
}


app.submitDataToAggr = function( dataJson, type, programData )
{
	//var period = app.generateCurPeriod();	
	var period = Util.generateCurPeriodFromStr( _startDateFormatted );

	if ( type === "unknown" )
	{
		var jsonData = [];
		var ouid = dataJson.ouid;

		for ( i = 0; i < 24; i++ )
		{
			var pe = app.generateNextPeriodCode( period, i );

			jsonData.push( app.getJsonData( programData.deList[KEYWORD_DE_STATUS_UNKNOWN], ouid, pe, "1") );
			jsonData.push( app.getJsonData( programData.deList[KEYWORD_DE_STATUS_YES], ouid, pe, "0") );
			jsonData.push( app.getJsonData( programData.deList[KEYWORD_DE_STATUS_NO], ouid, pe, "0") );
		}


		app.submitDataValueSet( "post", _queryUrl_dataValueSet_ADD_UPDATE, { "dataValues" : jsonData }, function( success )
		{
			if ( success )
			{
				if ( _logLevel >= 1 ) Util.ConsoleLog( '<br>--- UNKNOWN case, OU: ' + ouid + ', Success' );
			}
			else
			{
				Util.ConsoleLog( '<br>--- UNKNOWN case, OU: ' + ouid + ', FAILED!!' );
				_foundFailedCase = true;
			}
		});

	}
	// else if ( type === "known" )  // <-- This gets changed/entered from custom form
	//		Which, on Save, submits to aggregate side
	//		, Thus, no need to run at here.
	else if ( type === "notInProgram" )
	{
		var jsonData = [];
		var ouid = dataJson.ouid;

		for ( i = 0; i < 24; i++ )
		{
			var pe = app.generateNextPeriodCode( period, i );

			// QUESTION: Need to confirm (with Rodolfo) that below list are not covering everying...
			jsonData.push( app.getJsonData( programData.deList[KEYWORD_DE_STATUS_UNKNOWN], ouid, pe, "") );
			//jsonData.push( app.getJsonData( AGG_DE_NETWORK_INCLUDED, ouid, pe, "") );
			//jsonData.push( app.getJsonData( AGG_DE_NETWORK_EXCLUDED, ouid, pe, "") );
		}


		// WHAT ABOUT CLEARING OTHER DATA?
		app.submitDataValueSet( "post", _queryUrl_dataValueSet_DELETE, { "dataValues" : jsonData }, function( success )
		{
			if ( success )
			{
				if ( _logLevel >= 1 ) Util.ConsoleLog( '<br>--- CLEAR case, OU: ' + ouid + ', Success' );
			}
			else
			{
				Util.ConsoleLog( '<br>--- CLEAR case, OU: ' + ouid + ', FAILED!!' );
				_foundFailedCase = true;
			}
		});
	}
}

// =============================================

app.formatStartDate = function( startDateInput )
{
	return ( startDateInput === "CURRENT" ) ? Util.getDateStringYYYYMM( new Date(), "-", "01" ) : startDateInput;
}

app.generateCurPeriod = function()
{
	var curDate =  new Date();
	var month = curDate.getMonth() + 1;
	month = ( month < 10 ) ? "0" + month : month;
	
	return curDate.getFullYear() + "" + month;
}


Util.generateCurPeriodFromStr = function( strDate )
{
	var period = "";

	if ( Util.checkValue( strDate ) )
	{
		var year = strDate.substring(0, 4);
		var month = strDate.substring(5, 7);
		var period = year + month;
	}

	return period;
};


app.generateNextPeriodCode = function( period, i )
{
	var dateTemp = Util.getDate_FromYYYYMM( period );
	dateTemp.setMonth( dateTemp.getMonth() + i );

	return Util.getDateStringYYYYMM( dateTemp );
}

// 	Calculate the number of months between lastUpdate of event and a period
app.generateMonthSinceDate = function( date, period )
{
	var year1 = eval( date.substring(0,4) );
	var year2 = eval( period.substring(0,4) );
	
	var month1 = eval( date.substring(5,7) );
	var month2 = eval( period.substring(4,6) );
	
	return ( (year2 - year1) * 12 + (month2 - month1) );
};

app.getJsonData = function( deId, ouId, pe, value )
{
	return {
		'dataElement' : deId,
		'categoryoptioncombo' : _catOptionComboDefault,
		'orgUnit' : ouId,
		'period' : pe,
		'value' : value
	}
}
		
app.submitDataValueSet = function( submitType, queryUrl, jsonData, returnFunc )
{
	//var queryUrl = _queryUrl_dataValueSet;

	RESTUtil.submitData_Synch( submitType, queryUrl, jsonData, function( response )
	{
		if ( returnFunc ) returnFunc( true );
		//if ( _logLevel >= 1 ) Util.ConsoleLog( '<br>-- OrgUnit Id ' + ouid + ' - Bulk DataValues Submitted at ' + new Date() );	
	}
	, function( response )
	{
		if ( returnFunc ) returnFunc( false );

		//Util.ConsoleLog( '<br>-- OrgUnit Id ' + ouid + ' - Bulk DataValues Submit Failed at' + new Date() );	
	});
}

// ----------------------------------------------
// --------------- Log Program Related -----------------

LogProgram._program_Log = "n0rbwJPQQ7D";
LogProgram._programStage_Log = "g3i9LyCLQ8a";
LogProgram._orgUnit_Root_Log = "tBRaGpbSPfW";  // _MSI Countries - one orgUnit on root that will be used for this log program

LogProgram.DE_ID_ScriptRunName = "lnbo7EXJQKc";
LogProgram.DE_ID_RunBy = "vrNOgU8uKs1";
LogProgram.DE_ID_ProgramOption = "OfC5cYpjdvo";
LogProgram.DE_ID_OrgUnitOption = "tIWEVfEuRfJ";
LogProgram.DE_ID_DateFromTo = "c1j95hikpWI";
LogProgram.DE_ID_StartedTime = "odl5iTMPHJK";
LogProgram.DE_ID_EndTime = "aJB3qLdKYXN";
LogProgram.DE_ID_OverallResult = "qiRa8iwGtFE";
LogProgram.DE_ID_FullReport = "e9CLQZqGJPo";

LogProgram.createLog = function( sourceType, returnFunc )
{
	try
	{		
		var queryUrl = _queyrUrl_event;
		var json_Event = LogProgram.composeEventJson( sourceType );

		RESTUtil.submitData_Synch( 'post', queryUrl, json_Event, function( response )
		{
			json_Event.event = LogProgram.getEventId_FromResponse( response );
			returnFunc( true, json_Event );
		}
		, function( response )
		{
			Util.ConsoleLog( '<br>FAILED TO CREATE LOG' );
			returnFunc( false, json_Event );
		});
	}
	catch( ex )
	{
		Util.ConsoleLog( '<br>FAILED on CreateLog Method' );		
		returnFunc( false, undefined );		
	}
};

// Setup the end time and 2 results
LogProgram.updateLog = function( eventId, result, logText, returnFunc )
{	
	var currentDateTime = Util.getDHIS_DateTimeFormat( new Date() );

	var queryUrl = _queyrUrl_event + '/' + eventId;


	RESTUtil.retreiveData_Synch( queryUrl, function( jsonEvent )
	{
		if ( jsonEvent )
		{
			LogProgram.dataValuesPush( jsonEvent.dataValues, LogProgram.DE_ID_EndTime, currentDateTime );
			LogProgram.dataValuesPush( jsonEvent.dataValues, LogProgram.DE_ID_OverallResult, result );
			LogProgram.dataValuesPush( jsonEvent.dataValues, LogProgram.DE_ID_FullReport, logText );

			RESTUtil.submitData_Synch( 'put', queryUrl, jsonEvent, function( response )
			{
				if ( returnFunc ) returnFunc( true, jsonEvent );
			}
			, function( response )
			{
				Util.ConsoleLog( '<br>FAILED on Update the Log Program' );
				if ( returnFunc ) returnFunc( false, jsonEvent );
			});
		}
		else
		{
			Util.ConsoleLog( '<br>FAILED on Retrieve the Log Program' );
			if ( returnFunc ) returnFunc( false, jsonEvent );			
		}
	});
};

LogProgram.getEventId_FromResponse = function( response )
{
	var eventId = "";

	var returnData = JSON.parse( response.data.toString( RESTUtil.encoding ) );

	if ( returnData && returnData.response && returnData.response.importSummaries && returnData.response.importSummaries.length > 0 )
	{
		var summary = returnData.response.importSummaries[0];

		if ( summary.reference ) eventId = summary.reference;
	}

	return eventId;	
}


LogProgram.composeEventJson = function( sourceType )
{
	var json_Event = {};

	var currentDateTime = Util.getDHIS_DateTimeFormat( new Date() );

	json_Event.program = LogProgram._program_Log;
	json_Event.programStage = LogProgram._programStage_Log;
	json_Event.orgUnit = LogProgram._orgUnit_Root_Log;
	json_Event.eventDate = currentDateTime;
	json_Event.dataValues = [];

	LogProgram.dataValuesPush( json_Event.dataValues, LogProgram.DE_ID_ScriptRunName, _scriptName );
	LogProgram.dataValuesPush( json_Event.dataValues, LogProgram.DE_ID_RunBy, sourceType );
	LogProgram.dataValuesPush( json_Event.dataValues, LogProgram.DE_ID_ProgramOption, _program );
	LogProgram.dataValuesPush( json_Event.dataValues, LogProgram.DE_ID_OrgUnitOption, _ouid );
	LogProgram.dataValuesPush( json_Event.dataValues, LogProgram.DE_ID_DateFromTo, "From: " + _startDate );
	LogProgram.dataValuesPush( json_Event.dataValues, LogProgram.DE_ID_StartedTime, currentDateTime );

	return json_Event;
}

LogProgram.dataValuesPush = function( jsonDataValues, deId, value )
{
	var deObj = Util.getItemFromList( jsonDataValues, deId, "dataElement" );

	if ( deObj ) deObj.value = value;
	else jsonDataValues.push( { "dataElement": deId, "value": value });
}

// ----------------------------------------------
// --------------- RESTUtil Related -----------------

RESTUtil.isSuccess = function( response, option )
{
	var success = false;
	
	if ( option !== undefined && option == "SettingText" )
	{
		success = ( response && response.status >= 200 && response.status < 400 );
	}
	else
	{
		success = ( response && response.status >= 200 && response.status < 400 );
	}

	return success;
};

RESTUtil.retreiveData_Synch = function( queryUrl, returnFunc, option )
{
	// Request for events - all on the program
	var response = urlsync.request( queryUrl, RESTUtil.options );

	if ( RESTUtil.isSuccess( response, option ) )
	{
		var returnVal = JSON.parse( response.data.toString( RESTUtil.encoding ) );
		
		returnFunc( returnVal );
	}
	else
	{
		returnFunc( undefined );
	}
};


RESTUtil.submitData_Synch = function( submitType, queryUrl, jsonData, successFunc, failFunc )
{
	if ( _noSubmit )
	{
		Util.ConsoleLog( '<br> =====> Data No Submit Mode ============' );
	}
	else
	{

		var submitOptions = {
			auth: RESTUtil.options.auth,
			timeout: RESTUtil.options.timeout,
			data: JSON.stringify( jsonData ),
			headers: {
				'Content-Type': 'application/json'
			},
			method: submitType
		};
			
		var response = urlsync.request( queryUrl, submitOptions );
			
		if ( RESTUtil.isSuccess( response ) ) 
		{
			if ( successFunc !== undefined ) successFunc( response );
		}
		else 
		{
			if ( failFunc !== undefined ) failFunc( response );

			Util.ConsoleLog( '<br>--Failed. Response: ' + response );
		}	
	}
};


// ----------------------------------------------
// --------------- Util Related -----------------

Util.checkDefined = function( input ) {

	if( input !== undefined && input != null ) return true;
	else return false;
};

Util.checkValue = function( input ) {

	if ( Util.checkDefined( input ) && input.length > 0 ) return true;
	else return false;
};
		
		
Util.getItemFromList = function( list, value, propertyName ) 
{
	var item;

	if ( propertyName === undefined ) propertyName = "id";

	for( var i = 0; i < list.length; i++ )
	{
		var listItem = list[i];

		if ( listItem[ propertyName ] == value )
		{
			item = listItem;
			break;
		}
	}

	return item;
};

Util.getStartCurrentMonth = function()
{
	var date = new Date();
	
	var year = date.getFullYear();
	var month = date.getMonth() + 1;
	month = ( month < 10 ) ? "0" + month : month;
	
	return year + "-" + month + "-01";
};


Util.getEndCurrentMonth = function()
{
	var date = new Date();
	
	var lastDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
	
	var year = lastDate.getFullYear();
	
	var month = lastDate.getMonth() + 1;
	month = ( month < 10 ) ? "0" + month : month;
	
	var day = lastDate.getDate();
	day = ( day < 10 ) ? "0" + day : day;
	
	return year + "-" + month + "-" + day;
};

Util.getDate_FromYYYYMM = function( strDate )
{
	var date;

	if ( Util.checkValue( strDate ) )
	{
		var year = strDate.substring(0, 4);
		var month = strDate.substring(4, 6);

		date = new Date( year, month - 1 );
	}

	return date;
};

Util.getDateStringYYYYMM = function( date, inBtw, dateOption )
{
	var returnVal = "";

	if ( inBtw === undefined) inBtw = "";


	var yyyy = date.getFullYear().toString();
	var mm = ( date.getMonth() + 1 ).toString(); // getMonth() is zero-based

	returnVal = yyyy + inBtw + ( mm[1] ? mm : "0" + mm[0] );		

	if ( dateOption )
	{
		if ( dateOption === "DD" )
		{
			var dd  = date.getDate().toString();
			returnVal += inBtw + ( dd[1] ? dd : "0" + dd[0] );
		}
		else
		{
			returnVal += inBtw + dateOption;
		}
	}

	return returnVal;
};


Util.generateCurPeriodFromStr = function( strDate )
{
	var period = "";

	if ( Util.checkValue( strDate ) )
	{
		var year = strDate.substring(0, 4);
		var month = strDate.substring(5, 7);
		var period = year + month;
	}

	return period;
};

Util.ConsoleLog = function( msg )
{
	_logText += msg + '\n';

	console.log( msg );
};

Util.getDHIS_DateTimeFormat = function( datetime )
{
	var returnVal = "";
	var inBtw = "-";
	
	var yyyy = datetime.getFullYear().toString();
	var mm = Util.fillLeadingZero( ( datetime.getMonth() + 1 ).toString() ); // getMonth() is zero-based
	var dd  = Util.fillLeadingZero( datetime.getDate().toString() );
	var hr = Util.fillLeadingZero( datetime.getHours().toString() );
	var min = Util.fillLeadingZero( datetime.getMinutes().toString() );
	var sec = Util.fillLeadingZero( datetime.getSeconds().toString() );

	returnVal = yyyy + inBtw + mm + inBtw + dd + 'T' + hr + ':' + min + ':' + sec;

	return returnVal;
};


Util.fillLeadingZero = function( val )
{
	return ( val[1] ) ? val : "0" + val[0];
};


// --------------- End of Util Related -----------------
// -----------------------------------------------------



// ---------------------------------------------------

app.run();
