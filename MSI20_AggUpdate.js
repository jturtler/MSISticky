// 'MSI20_AggUpdate.js'
//
// - ABOUT:
//	 For applying the 'MSI Event Form - Accreditation & Authorization Log' logic/processing
//		per orgUnit & per program.
//   Programs that has shortName starting with 'MSI20 -' will be considered as 'Accreditation & Authorization Log' program.
//	 
//	 If specific 'ouid' is not provided as parameter, it will run against all orgUnits.
//	 Same with program - if specific 'program' is not provided, it will run for all program that 
//	 has shortName starting with 'MSI20 -'.
//
// - OPERATIONS:
//		1. Use WebAPI to retrieve programs
//		2. On each program, use sqlView to get events (with start/end date filter)
//		3. 'Cron' job uses '3Days' option that only looks for events that has been
//			created/updated in last 3 days - looking at event create/changed date.
//			This also cause issue with changing middle event only, but not updating
//			later event to aggregate side date move.
//			Thus, added logic to update later events afterwards 
//			if the event is not the latest one.
//		4. Generate and save the sticky data element values on aggregate side.
//
//	- NOTE:
//		- Due to mass-delete implementation via WebAPI needing a dataSet with
//			dataElements, having static dataSet with dataElements on dynamic program
//			list does not work.
//			We will have to go with direct sql statement call from nodeJS, which
//			was not tried/implemented, yet.
//			Thus, data deletion/cleaning on aggregate side does not happen with this script.

var urlsync = require('urllib-sync');
var fs = require('fs');
var settingObj = JSON.parse(fs.readFileSync('setting.txt', 'utf8'));

// ----- App Objects -----------
var app = {};
var Util = {};
var RESTUtil = { options: { auth: settingObj.dhis.user + ':' + settingObj.dhis.password ,timeout: 600000 }, encoding: 'utf8' };
var LogProgram = {};

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

var _argvSetObj = Util.createArgvSetObj( process.argv );
var _noSubmit = ( _argvSetObj[ "noSubmit" ] !== undefined ) ? _argvSetObj[ "noSubmit" ] : false;
var _serverUrl = ( _argvSetObj[ "server" ] !== undefined ) ? _argvSetObj[ "server" ] : "http://localhost:8080";
var _sourceType = ( _argvSetObj[ "sourceType" ] !== undefined ) ? _argvSetObj[ "sourceType" ] : "Manual";		
var _ouid = ( _argvSetObj[ "ouid" ] !== undefined ) ? _argvSetObj[ "ouid" ] : "ALL";
var _program = ( _argvSetObj[ "program" ] !== undefined ) ? _argvSetObj[ "program" ] : "ALL";
var _startDate = ( _argvSetObj[ "startDate" ] !== undefined ) ? _argvSetObj[ "startDate" ] : "ALL";
var _endDate = ( _argvSetObj[ "endDate" ] !== undefined ) ? _argvSetObj[ "endDate" ] : "ALL";
var _mode = ( _argvSetObj[ "mode" ] !== undefined ) ? _argvSetObj[ "mode" ] : "Normal";
// ----- Show Logs & Override Var -----------
// level 0: display error message, level 1: display step message and process message, level 2: more detailed
var _logLevel = ( _argvSetObj[ "logLevel" ] !== undefined ) ? Number( _argvSetObj[ "logLevel" ] ) : 1;


// ----- UIDs and Urls -----------
var _apiUrl = _serverUrl + "/api/";


// ==== CatOptionCombo Default (Different Between Servers) ====
var _catOptionComboDefault = "CQ6ibh5Ggda";

// ==== Attributes ====
var _attr_Status_Unknown = "HuGSI9izuuX"; // Sticky Status - Unknown
var _attr_Status_Yes = "JNCRRIJCsPl"; // Sticky Status - Yes
var _attr_Status_No = "xh8lSWP0dyv"; // Sticky Status - No
var _attr_MonthsSinceLastUpdate = "c0eTL04Qnls"; // Sticky Status - Months since last update
var _attr_DateLastChangeDate = "v6mICtv8rLm"; // Sticky Status - Date last change date


// ==== Data Elements keywords ====
var KEYWORD_DE_STATUS_UNKNOWN = "Status_Unknown"; // Sticky Status - Unknown
var KEYWORD_DE_STATUS_YES = "Status_Yes";// Sticky Status - Yes
var KEYWORD_DE_STATUS_NO = "Status_No"; // Sticky Status - No
var KEYWORD_DE_MONTH_SINCE_LAST_UPDATE = "Month_Since_Last_Update"; // Sticky Status - Months since last update
var KEYWORD_DE_DATE_LAST_CHANGE_DATE = "Date_Last_Change_Date"; // Sticky Status - Date last change date


// ==== Sql View and query URL ====
var KEYWORD_STARTDATE = "@KEYWORD_STARTDATE";
var KEYWORD_ENDDATE = "@KEYWORD_ENDDATE";
var KEYWORD_PROGRAMID = "@KEYWORD_PROGRAMID";

var _queryUrl_ProgramListWithDE = _apiUrl + 'programs.json?paging=false&fields=id,name,attributeValues[value,attribute[id]]&filter=shortName:like:MSI_20-';

var _queryUrl_sqlViewData_EventsData = _apiUrl + 'sqlViews/i3PZx8PUQtd/data.json';

// THOUGHTS: - NEED TO WORRY ABOUT THE DUPLICATE ONES ON SAME MONTH?
/* select DISTINCT ON(psi.organisationunitid, psi.programstageid)
 psi.programstageinstanceid, org.uid, to_char( psi.executiondate,'YYYYMM'), psi.executiondate, statusdata.value, expirationdate.value, psi.programstageid
*/

var _queryUrl_dataValueSet_ADD_UPDATE = _apiUrl + 'dataValueSets';
var _queryUrl_dataValueSet_DELETE = _apiUrl + 'dataValueSets?importStrategy=UPDATE';

var _queyrUrl_event = _apiUrl + 'events';

// ==== Simple Global Variable Related ====
var _logText = "";	// collect the console log data and use it to output in Log Program event.
var _foundFailedCase = false;

var _scriptName = "MSI20_AggUpdate.js";

// ---------------------------------------------------
// --------------- App Run Method --------------------

app.run = function() 
{	
	try
	{
	
		LogProgram.createLog( _sourceType, function( logCreated, eventLogJson ) 
		{
			// Only if all the operation was success, consider as success.
			var overallSuccess = false;

	
			// Retrieve Flagged Events
			if ( _logLevel >= 1 ) Util.ConsoleLog( '<br>--- Script Start - at ' + ( new Date() ).toString() + ' with arguments: ' + JSON.stringify( process.argv ) );


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
	programData.deListObj = {};
	programData.deListObj[KEYWORD_DE_STATUS_UNKNOWN] = '';
	programData.deListObj[KEYWORD_DE_STATUS_YES] = '';
	programData.deListObj[KEYWORD_DE_STATUS_NO] = '';
	programData.deListObj[KEYWORD_DE_MONTH_SINCE_LAST_UPDATE] = '';
	programData.deListObj[KEYWORD_DE_DATE_LAST_CHANGE_DATE] = '';

	var attributeValues = programData.attributeValues;
	
	for( var i = 0; i < attributeValues.length; i++ )
	{
		var attrVal = attributeValues[i];
		if( attrVal.attribute.id === _attr_Status_Unknown ){
			programData.deListObj[KEYWORD_DE_STATUS_UNKNOWN] = attrVal.value;
		}
		else if( attrVal.attribute.id === _attr_Status_Yes ){
			programData.deListObj[KEYWORD_DE_STATUS_YES] = attrVal.value;
		}
		else if( attrVal.attribute.id === _attr_Status_No ){
			programData.deListObj[KEYWORD_DE_STATUS_NO] = attrVal.value;
		}
		else if( attrVal.attribute.id === _attr_MonthsSinceLastUpdate ){
			programData.deListObj[KEYWORD_DE_MONTH_SINCE_LAST_UPDATE] = attrVal.value;
		}
		else if( attrVal.attribute.id === _attr_DateLastChangeDate ){
			programData.deListObj[KEYWORD_DE_DATE_LAST_CHANGE_DATE] = attrVal.value;
		}
	}


	// Only if all the DataElement UID were provided, process the program.
	programData.deListValid = ( 
		programData.deListObj[KEYWORD_DE_STATUS_UNKNOWN]
		&& programData.deListObj[KEYWORD_DE_STATUS_YES]
		&& programData.deListObj[KEYWORD_DE_STATUS_NO]
		&& programData.deListObj[KEYWORD_DE_MONTH_SINCE_LAST_UPDATE]
		&& programData.deListObj[KEYWORD_DE_DATE_LAST_CHANGE_DATE] );
}


// ---------------------------------------------------

app.processProgram = function( programData )
{
	try
	{
		if ( !programData.deListValid )
		{
			if ( _logLevel >= 1 ) Util.ConsoleLog( '<br>program ' + programData.id + ' does not have all the DE populated: ' + JSON.stringify( programData.deListObj ) );
		}
		else
		{
			var programId = programData.id;
			
			if ( programId )
			{
				// Retrieve Latest events of orgunits in current month
				var queryUrl = _queryUrl_sqlViewData_EventsData + '?var=ouid:' + _ouid + '&var=prgid:' + programId + '&var=startDate:' + _startDate + '&var=endDate:' + _endDate + '&var=mode:' + _mode;


				if ( _logLevel >= 1 ) Util.ConsoleLog( '<br>program queryUrl: ' + queryUrl );


				RESTUtil.retreiveData_Synch( queryUrl, function( json_SqlViewData )
				{			
					if ( json_SqlViewData !== undefined )
					{
						// Structure sqlView Data && submit data for each row in SQL result
						var json_structuredList = app.getStructuredList_JsonData( json_SqlViewData );

						var eventList_GroupByOrgUnit = Util.getGroupByData( json_structuredList, 'ouId' );
						
						// Update Aggregate side with New Unknown and Changed to Known orgUnits
						app.process_AggUpdate( eventList_GroupByOrgUnit, programData );

					}
					else
					{
						Util.ConsoleLog( '<br>program events sqlView did not return data: ' + queryUrl );
						_foundFailedCase = true;
					}
				});	
			}
			else
			{
				if ( _logLevel >= 1 ) Util.ConsoleLog( 'program skipped due to one of the value missing - program: ' + programId );
			}	
		}
	}
	catch ( ex )
	{
		Util.ConsoleLog( '<br><br>###-ERROR- on Program ' + programData.id + ': ' + ex.stack );
		_foundFailedCase = true;
	}				
}

// ---------------------------------------------------

app.getStructuredList_JsonData = function( jsonSqlViewData )
{
	var json_dataAll = [];

	var jsonDataList = jsonSqlViewData.rows;

	// Get all data. add into structure
	for( var i = 0; i < jsonDataList.length; i++ )
	{
		var data = jsonDataList[i];

		json_dataAll.push( { 
			'eventId': data[0]
			,'ouId': data[1]
			,'period': data[2]
			,'eventDate': data[3]
			,'statusVal': data[4]
			,'expireDate': data[5]
			,'stageId': data[6]
			,'laterEvents': data[7]
		} );
	}

	return json_dataAll;
}

// Spend 40 min to finish this and talk to Tran about her sql?
app.process_AggUpdate = function( eventList_GroupByOrgUnit, programData )
{
	// per orgUnit, get the last event..
	var ouId;

	for ( ouId in eventList_GroupByOrgUnit )
	{
		try
		{	
			var ouEventList = eventList_GroupByOrgUnit[ ouId ];
			var ouEventList_sorted = Util.sortByKey( ouEventList, "eventDate" );

			// STEP 1. go throw event list and submit to aggregate side.
			for( var i = 0; i < ouEventList_sorted.length; i++ )
			{				
				app.submitDataToAggr( ouEventList_sorted[i], programData );
			}

			// STEP 2. If the last event has more later events, then, retrieve more and process them.
			app.checkAndGetLaterEvents( ouEventList_sorted, ouId, programData.id, function( laterEvents )
			{
				for( var i = 0; i < laterEvents.length; i++ )
				{				
					app.submitDataToAggr( laterEvents[i], programData );
				}
			});

		}
		catch ( ex )
		{
			Util.ConsoleLog( '<br><br>###-ERROR- on Aggr Update, per orgUnit, ouId: ' + ouId + ', msg: ' + ex.stack );
			_foundFailedCase = true;
		}									
	}			
}

app.checkAndGetLaterEvents = function( ouEventList, ouId, programId, returnFunc )
{
	// STEP 2. If the last event has more later events, then, retrieve more and process them.
	if ( ouEventList.length > 0 )
	{
		var lastEvent = ouEventList[ ouEventList.length - 1 ];

		if ( Number( lastEvent.laterEvents ) > 0 )
		{
			// retrieve them..
			var startDate = lastEvent.eventDate.substring(0, 10);
			var queryUrl = _queryUrl_sqlViewData_EventsData + '?var=ouid:' + ouId + '&var=prgid:' + programId + '&var=startDate:' + startDate + '&var=endDate:ALL&var=mode:Normal';

			if ( _logLevel >= 1 ) Util.ConsoleLog( '<br>=== LATER EVENT: program queryUrl: ' + queryUrl );

			RESTUtil.retreiveData_Synch( queryUrl, function( json_SqlViewData )
			{			
				if ( json_SqlViewData !== undefined )
				{
					// Structure sqlView Data && submit data for each row in SQL result
					var json_structuredList = app.getStructuredList_JsonData( json_SqlViewData );
					// Do not do sorting on eventDate again - since sql statement has sort-by.

					// Since later events could be in same event date as the last event
					// , the search by last event Date will also retrieve last event again.
					// Remove that event. - But only if the last event is the 1st event returned.
					if ( json_structuredList[0].eventId === lastEvent.eventId ) Util.RemoveFromArray( json_structuredList, 'eventId', lastEvent.eventId )

					returnFunc( json_structuredList );
				}
				else
				{
					Util.ConsoleLog( '<br>Later Events sqlView did not return data: ' + queryUrl );
					_foundFailedCase = true;
				}
			});
		}
	}
}


app.submitDataToAggr = function( dataJson, programData )
{
	var jsonData = [];
	var ouId = dataJson.ouId;
	var fixed24Case = false;

	var status = dataJson.statusVal;

	var unknownVal = ( status == "UNK" ) ? "1" : "0";
	var yesVal = ( status == "YES" ) ? "1" : "0";
	var noVal = ( status == "NO" ) ? "1" : "0";
		
	// Generate startPeriod and endPeriod
	var eventDate = dataJson.eventDate.substring(0, 10);
	var expireDate = dataJson.expireDate;
	var endPeriod = app.generatePeriodByDate( expireDate );
	var period = dataJson.period;
	var pe = period;
	
	if ( !expireDate || !endPeriod ) fixed24Case = true;


	// Only generate aggregate data values from eventDate to expireDate
	var idx = 0;
	while ( 
		( fixed24Case && idx < 24 ) 
		|| ( !fixed24Case && pe <= endPeriod ) )
	{
		var noMonths = app.generateMonthSinceDate( eventDate, pe );

		jsonData.push( app.getJsonData( programData.deListObj[KEYWORD_DE_STATUS_UNKNOWN], ouId, pe, unknownVal ) );

		jsonData.push( app.getJsonData( programData.deListObj[KEYWORD_DE_STATUS_YES], ouId, pe, yesVal ) );

		jsonData.push( app.getJsonData( programData.deListObj[KEYWORD_DE_STATUS_NO], ouId, pe, noVal ) );

		jsonData.push( app.getJsonData( programData.deListObj[KEYWORD_DE_MONTH_SINCE_LAST_UPDATE], ouId, pe, noMonths ) );

		jsonData.push( app.getJsonData( programData.deListObj[KEYWORD_DE_DATE_LAST_CHANGE_DATE], ouId, pe, eventDate ) );
		
		idx++;
		pe = app.generateNextPeriodCode( period, idx );
	}

		
	// Submit data	
	app.submitDataValueSet( "post", _queryUrl_dataValueSet_ADD_UPDATE, { "dataValues" : jsonData }, function( success )
	{
		if ( success )
		{
			if ( _logLevel >= 1 ) Util.ConsoleLog( '<br>--- SUCCESS - AggCopy case, OU: ' + ouId + ', eventId: ' + dataJson.eventId + ', eventDate: ' + dataJson.eventDate );
		}
		else
		{
			Util.ConsoleLog( '<br>--- FAILED - AggCopy case, OU: ' + ouId + ', eventId: ' + dataJson.eventId );
			_foundFailedCase = true;
		}
	});
}

app.get10_Bool = function( flag )
{
	if ( flag ) return "1";
	else return "0";
}

app.generatePeriodByDate = function( dateStr )
{
	return dateStr.substring(0, 4) + "" + dateStr.substring(5, 7);
}

app.generateNextPeriodCode = function( period, i )
{
	var dateTemp = Util.getDate_FromYYYYMM( period );
	dateTemp.setMonth( dateTemp.getMonth() + i );

	return Util.getDateStringYYYYMM( dateTemp );
}

// 	Calculate the number of months between lastUpdate of event and a period
app.generateMonthSinceDate = function( date, period )
{
	var year1 = Number( date.substring(0,4) );
	var year2 = Number( period.substring(0,4) );
	
	var month1 = Number( date.substring(5,7) );
	var month2 = Number( period.substring(4,6) );
	
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
	LogProgram.dataValuesPush( json_Event.dataValues, LogProgram.DE_ID_DateFromTo, "From: " + _startDate + ", To: " + _endDate );
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
}

Util.RemoveFromArray = function( list, propertyName, value )
{
	var index;

	for( var i = 0; i < list.length; i++ )
	{				
		var item = list[i];
		if ( item[ propertyName ] == value ) 
		{
			index = i;
			break;
		}
	}

	if ( index !== undefined ) 
	{
		list.splice( index, 1 );
	}

	return index;
}


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

	if ( dateOption !== undefined && dateOption == "DD" )
	{
		var dd  = date.getDate().toString();
		returnVal = returnVal + inBtw + ( dd[1] ? dd : "0" + dd[0] );
	}

	return returnVal;
};
		

Util.sortByKey = function( array, key ) {
	return array.sort( function( a, b ) {
		var x = a[key]; var y = b[key];
		return ( ( x < y ) ? -1 : ( ( x > y ) ? 1 : 0 ) );
	});
};

Util.getDate_FromYYYYMMDD = function( strDate )
{
	var date;

	if ( strDate )
	{
		var year = strDate.substring(0, 4);
		var month = strDate.substring(5, 7);
		var date = strDate.substring(8, 10);

		date = new Date( year, month - 1, date );
	}

	return date;
}
	
Util.getDateDiff = function( futureDate, pastDate )
{
	var timeDiff = Math.abs( futureDate.getTime() - pastDate.getTime() );

	return Math.ceil( timeDiff / ( 1000 * 3600 * 24 ) );
}


Util.getDateDiffStr_FromStr = function( currEventDateStr, prevEventDateStr )
{
	var dateDiffStr = "";

	if ( currEventDateStr && prevEventDateStr )
	{
		var currEventDate = Util.getDate_FromYYYYMMDD( currEventDateStr );

		var prevEventDate = Util.getDate_FromYYYYMMDD( prevEventDateStr );

		dateDiffStr = "" + Util.getDateDiff( currEventDate, prevEventDate );
	}

	return dateDiffStr;
}


Util.getGroupByData = function( jsonDataList, prop )
{
	var listObj = {};

	// get unique ou
	for( var i = 0; i < jsonDataList.length; i++ )
	{
		var jsonData = jsonDataList[i];
		var propVal = jsonData[ prop ];
		var objWithList = listObj[ propVal ];
		
		if ( objWithList ) objWithList.push( jsonData );
		else
		{
			// array with one event in it.
			listObj[ propVal ] = [ jsonData ];
		}
	}

	return listObj;
}


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
