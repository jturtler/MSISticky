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
eval( urlsync.request( settingObj.jsFile ).data.toString( 'utf8' )+'' );

RESTUtil.options = { auth: settingObj.dhis.user + ':' + settingObj.dhis.password, timeout: 600000 };
RESTUtil.encoding = 'utf8';

// ----- App Objects -----------
var app = {};


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
var _logLevel = ( _argvSetObj[ "logLevel" ] !== undefined ) ? Number( _argvSetObj[ "logLevel" ] ) : 0;


// ----- UIDs and Urls -----------
var _apiUrl = _serverUrl + "/api/";

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
// Level 0
app.run = function() 
{	
	try
	{
		var sourceData = {};
		sourceData.ouid = _ouid;
		sourceData.programId = _program;
		sourceData.scriptName = _scriptName;
		sourceData.sourceType = _sourceType;
		sourceData.startDate = _startDate;
		sourceData.endDate = _endDate;

		LogProgram.createLog( sourceData, _apiUrl, function( logCreated, eventLogJson ) 
		{
			// Only if all the operation was success, consider as success.
			var overallSuccess = false;

			// Retrieve Flagged Events
			if ( _logLevel && _logLevel >= 1 ) Util.ConsoleLog( '<br>--- Script Start - at ' + ( new Date() ).toString() + ' with arguments: ' + JSON.stringify( process.argv ) );


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

			if ( _logLevel && _logLevel >= 1 ) Util.ConsoleLog( '<br>--- Ended - at ' + ( new Date() ).toString() );

			// Setup the end time and 2 results
			overallSuccess = !_foundFailedCase;
			if ( logCreated ) LogProgram.updateLog( eventLogJson.event, !_foundFailedCase, _logText, _apiUrl, function() {} );
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

// ---------------------------------------------------
// Level 1
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


				if ( _logLevel && _logLevel >= 1 ) Util.ConsoleLog( '<br>program queryUrl: ' + queryUrl );


				RESTUtil.retreiveData_Synch( queryUrl, function( json_SqlViewData )
				{			
					if ( json_SqlViewData !== undefined )
					{
						// Structure sqlView Data && submit data for each row in SQL result
						var json_structuredList = app.getStructuredList_JsonData( json_SqlViewData );

						// group event by ou
						var eventList_byOU = Util.getGroupByData( json_structuredList, 'ouId' );
						
						// Update Aggregate side with New Unknown and Changed to Known orgUnits
						app.process_AggUpdate( eventList_byOU, programData );

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
};

// ---------------------------------------------------
// Level 1
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
app.process_AggUpdate = function( eventList_byOU, programData )
{
	// per orgUnit, get the last event..
	//var ouId;

	for ( var ouId in eventList_byOU )
	{
		try
		{
			// Need to pass 'programData' <-- for program info
			// Delete existing data in Aggregate side first!!
			app.deleteDataValueSet( ouId, programData, function( success ) 
			{
				var ouEventList = eventList_byOU[ ouId ];
				var ouEventList_sorted = Util.sortByKey( ouEventList, "eventDate" );

				if ( _logLevel && _logLevel >= 1 ) Util.ConsoleLog( '<br>-- Aggr Update OrgUnit Id ' + ouId + ', eventCount: ' + ouEventList_sorted.length );
				// STEP 1. go throw event list and submit to aggregate side.
				for( var i = 0; i < ouEventList_sorted.length; i++ )
				{				
						try
						{
					app.submitDataToAggr( ouEventList_sorted[i], programData );
						}
						catch ( ex )
						{
							Util.ConsoleLog( '<br><br>###-ERROR- on Aggr Update, per Event, ouId: ' + ouId + ', msg: ' + ex.stack );
							_foundFailedCase = true;
						}					
				
				}

				// STEP 2. If the last event has more later events, then, retrieve more and process them.
				app.checkAndGetLaterEvents( ouEventList_sorted, ouId, programData.id, function( laterEvents )
				{
					for( var i = 0; i < laterEvents.length; i++ )
					{				
						app.submitDataToAggr( laterEvents[i], programData );
					}
				});
			
			});

		}
		catch ( ex )
		{
			Util.ConsoleLog( '<BR><BR> == ###-ERROR- on Aggr Update, per orgUnit, ouId: ' + ouId + ', msg: ' + ex.stack );
			_foundFailedCase = true;
		}									
	}			
};

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
	var endPeriod = Util.generatePeriodByDate( expireDate );
	var period = dataJson.period;
	var pe = period;
	
	if ( !expireDate || !endPeriod ) fixed24Case = true;


	// Do this in separate process - so that the content is not too long..
	periodListDataObj = {};

	// Only generate aggregate data values from eventDate to expireDate
	var idx = 0;
	while ( 
		( fixed24Case && idx < 24 ) 
		|| ( !fixed24Case && pe <= endPeriod ) )
	{
		var periodDataObj = {};

		var noMonths = Util.generateMonthSinceDate( eventDate, pe );

		periodDataObj[ programData.deListObj[M_UID.KEYWORD_DE_STATUS_UNKNOWN] ] = unknownVal;
		periodDataObj[ programData.deListObj[M_UID.KEYWORD_DE_STATUS_YES] ] = yesVal;
		periodDataObj[ programData.deListObj[M_UID.KEYWORD_DE_STATUS_NO] ] = noVal;
		periodDataObj[ programData.deListObj[M_UID.KEYWORD_DE_MONTH_SINCE_LAST_UPDATE] ] = noMonths;
		periodDataObj[ programData.deListObj[M_UID.KEYWORD_DE_DATE_LAST_CHANGE_DATE] ] = eventDate;

		periodListDataObj[ pe ] = periodDataObj;

		// Next iteration
		idx++;
		pe = Util.generateNextPeriodCode( period, idx );
	}

	AggrDataUtil.addData_withPeDataList( periodListDataObj, ouId, _apiUrl, 'Add Aggr Data over periods, event(' + dataJson.eventId + ')', function() { 		
	}
	, function() { _foundFailedCase = true; } 
	);
}

// -------------------------------------------
// Level 2

app.deleteDataValueSet = function( orgUnitId, programData, afterDelFunc )
{
	try
	{			
		var deListObj = {};
		deListObj[ programData.deListObj[M_UID.KEYWORD_DE_STATUS_UNKNOWN] ] = "0";
		deListObj[ programData.deListObj[M_UID.KEYWORD_DE_STATUS_YES] ] = "0";
		deListObj[ programData.deListObj[M_UID.KEYWORD_DE_STATUS_NO] ] = "0";
		deListObj[ programData.deListObj[M_UID.KEYWORD_DE_MONTH_SINCE_LAST_UPDATE] ] = "0";
		deListObj[ programData.deListObj[M_UID.KEYWORD_DE_DATE_LAST_CHANGE_DATE] ] = "2017-01-01";
								
		AggrDataUtil.deleteDataBySearchDe( deListObj, orgUnitId, 'ALL', programData.deListObj[M_UID.KEYWORD_DE_STATUS_YES], _apiUrl, 'CLEAR data before update.', function()
		{
			Util.ConsoleLog( '<BR> == SUCCESS ON deleteDataBySearchDe' );
			afterDelFunc( true );
		}, function()
		{
			Util.ConsoleLog( '<BR> === FAILED on Delete Existing Data Method, OU: ' + orgUnitId );
			_foundFailedCase = true;
			afterDelFunc( false );
		} );


	}
	catch( ex )
	{
		
		Util.ConsoleLog( '<br> THROWN ERROR -- FAILED on Delete Existing Data Method, OU: ' + orgUnitId );
		console.log( ex );
		_foundFailedCase = true;
		afterDelFunc( false );
	}
};

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

app.setDEData = function( programData )
{
	programData.deListObj = {};
	programData.deListObj[M_UID.KEYWORD_DE_STATUS_UNKNOWN] = '';
	programData.deListObj[M_UID.KEYWORD_DE_STATUS_YES] = '';
	programData.deListObj[M_UID.KEYWORD_DE_STATUS_NO] = '';
	programData.deListObj[M_UID.KEYWORD_DE_MONTH_SINCE_LAST_UPDATE] = '';
	programData.deListObj[M_UID.KEYWORD_DE_DATE_LAST_CHANGE_DATE] = '';

	var attributeValues = programData.attributeValues;
	
	for( var i = 0; i < attributeValues.length; i++ )
	{
		var attrVal = attributeValues[i];
		if( attrVal.attribute.id === M_UID.ATTR_STATUS_UNKNOWN ){
			programData.deListObj[M_UID.KEYWORD_DE_STATUS_UNKNOWN] = attrVal.value;
		}
		else if( attrVal.attribute.id === M_UID.ATTR_STATUS_YES ){
			programData.deListObj[M_UID.KEYWORD_DE_STATUS_YES] = attrVal.value;
		}
		else if( attrVal.attribute.id === M_UID.ATTR_STATUS_NO ){
			programData.deListObj[M_UID.KEYWORD_DE_STATUS_NO] = attrVal.value;
		}
		else if( attrVal.attribute.id === M_UID.ATTR_MONTHS_SINCE_LAST_UPDATE ){
			programData.deListObj[M_UID.KEYWORD_DE_MONTH_SINCE_LAST_UPDATE] = attrVal.value;
		}
		else if( attrVal.attribute.id === M_UID.ATTR_LAST_CHANGED_DATE ){
			programData.deListObj[M_UID.KEYWORD_DE_DATE_LAST_CHANGE_DATE] = attrVal.value;
		}
	}


	// Only if all the DataElement UID were provided, process the program.
	programData.deListValid = ( 
		programData.deListObj[M_UID.KEYWORD_DE_STATUS_UNKNOWN]
		&& programData.deListObj[M_UID.KEYWORD_DE_STATUS_YES]
		&& programData.deListObj[M_UID.KEYWORD_DE_STATUS_NO]
		&& programData.deListObj[M_UID.KEYWORD_DE_MONTH_SINCE_LAST_UPDATE]
		&& programData.deListObj[M_UID.KEYWORD_DE_DATE_LAST_CHANGE_DATE] );
}


// ---------------------------------------------------

app.run();
