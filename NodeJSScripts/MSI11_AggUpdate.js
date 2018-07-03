// 'MSI11_AggUpdate.js'
//
// - ABOUT:
//	 For applying the 'MSI Custom Event Form 1.1 - Status Log' logic/processing
//		per orgUnit.
//	 If specific 'ouid' is not provided as parameter, it will run against all orgUnits
//		associated with the program ('Status Log')
//
// - OPERATIONS:
//		1. Use sqlView to retrieve all the events associated with the program
//			and organize(group) them by orgUnit.
//		2. Per orgUnit, on events in it, calculate 'Previous Status' & 'Days since previous event'
//		3. Update OrgUnitGroup of orgUnit by the latest event on orgUnit
//		4. Generate and save the sticky data element values on aggregate side.
//
//	- NOTE:
//		- When saving new sticky data values (on aggregate side)
//			, it deletes all previously existing data.  For easy mass delete on
//			dataValues, it uses dataSet.  
//
//		- 'Recently emptied event OU case' (on 2018-01-01):
//			- We can either reset/remove entire orgUnitGroup data & aggregate data on all orgUnit
//			- Or we can look for specific 'recently emptied event' case orgUnits.
//				- By getting orgUnits with orgUnitGroup (related to form11), called 'pre-existing'
//				- Comparing to orgUnits with events, called 'current-existing'
//				- orgUnits not on 'current-existing', but on 'pre-existing' are the recently emptied ones.
//

var urlsync = require('urllib-sync');
var fs = require('fs');
var settingObj = require( './setting' );
//var settingLoc = '/msi_nodejs/nodejs/setting.txt';
//var settingLoc2 = 'setting.txt';
//var settingObj = JSON.parse( (fs.existsSync(settingLoc)) ? fs.readFileSync(settingLoc, 'utf8') : fs.readFileSync(settingLoc2, 'utf8') ); 
eval( urlsync.request( settingObj.jsFile, {timeout: 600000} ).data.toString( 'utf8' )+'' );

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
// ----- Show Logs & Override Var -----------
// level 0: display error message, level 1: display step message and process message, level 2: more detailed
var _logLevel = ( _argvSetObj[ "logLevel" ] !== undefined ) ? Number( _argvSetObj[ "logLevel" ] ) : 0;
var _startDate = "ALL";

// ----- UIDs and Urls -----------
var _apiUrl = _serverUrl + "/api/";

// ==== Sql View and query URL ====
var _queryUrl_sqlViewData_EventsData = _apiUrl + 'sqlViews/IElcYd2UtZJ/data.json';

var _queryUrl_dataValueSet_ADD_UPDATE = _apiUrl + 'dataValueSets';
var _queryUrl_dataValueSet_DELETE = _apiUrl + 'dataValueSets?importStrategy=UPDATE';

var _queyrUrl_event = _apiUrl + 'events';

// ==== Simple Global Variable Related ====
var _logText = "";	// collect the console log data and use it to output in Log Program event.
var _foundFailedCase = false;

var _scriptName = "MSI11_AggUpdate.js";

// ---------------------------------------------------
// --------------- App Run Method --------------------
// ---------------------------------------------------
// Level 0
app.run = function() 
{	
	try
	{
		var sourceData = {};
		sourceData.ouid = _ouid;
		sourceData.programId = M_UID.PROGRAM_ID_STATUS;
		sourceData.scriptName = _scriptName;
		sourceData.sourceType = _sourceType;
		sourceData.startDate = _startDate;
		sourceData.endDate = "";

		LogProgram.createLog( sourceData, _apiUrl, function( logCreated, eventLogJson ) 
		{
			// Only if all the operation was success, consider as success.
			var overallSuccess = false;

			// Retrieve Flagged Events
			if ( _logLevel && _logLevel >= 1 ) Util.ConsoleLog( '<br>--- Script Start - at ' + ( new Date() ).toString() + ' with arguments: ' + JSON.stringify( process.argv ) );

			var queryUrl = _queryUrl_sqlViewData_EventsData + '?var=ouid:' + _ouid + '&var=prgid:' + M_UID.PROGRAM_ID_STATUS;

			if ( _logLevel && _logLevel >= 1 ) Util.ConsoleLog( '<br>Events queryUrl: ' + queryUrl );

			RESTUtil.retreiveData_Synch( queryUrl, function( json_SqlViewData )
			{
				if ( json_SqlViewData !== undefined )
				{
					// Structure sqlView Data && submit data for each row in SQL result
					var json_structuredList = app.getStructuredList_JsonData( json_SqlViewData );
					if ( _logLevel && _logLevel >= 1 ) Util.ConsoleLog( '<br>Events Count: ' + json_structuredList.length );


					// populate data + orgUnit Group update??
					var eventList_byOU = app.updateData( json_structuredList, _ouid );
					if ( _logLevel && _logLevel >= 1 ) Util.ConsoleLog( '<br>OrgUnit Count: ' + Object.keys( eventList_byOU ).length );


					// orgUnit Group update.. - only on the last event (delete if there is existing?)
					app.process_OUGroupUpdate( eventList_byOU );


					// Update Aggregate side
					app.process_AggUpdate( eventList_byOU );
				}
				else
				{
					Util.ConsoleLog( '<br>sqlView did not return data: ' + queryUrl );
					_foundFailedCase = true;
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
		Util.ConsoleLog( '<br><br>###-ERROR- on Events Retrieval: ' + ex.stack );
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
			,'stageId': data[4]

			,'prevSts': data[5]		// <-- what about this?  needs to be added..
			,'status': data[6]
			,'elapsDate': data[7]  // <-- this probably needs to be calculated??
			,'noteData': data[8]
		} );
	}

	return json_dataAll;
}


// Do not add 'try/catch' here since we should not continue if it fails (not have proper data)...
app.updateData = function( jsonDataList, ouid_passed )
{
	var ouId;

	// reset all the 'prevStatus' and 'elapsedDateSince'
	app.resetPrevRelatedData( jsonDataList );

	// Group the event by orgUnit and process to set Prev and elapseSince
	var eventList_byOU = Util.getGroupByData( jsonDataList, 'ouId' );


	// Add Empty Array OrgUnit - for processing deletion. (of OUG & Aggre)
	// If specific orgUnit passed, or if exists in OrgUnitGroup but not in event list
	Util.setEventList_EmptyOuArray( eventList_byOU, ouid_passed, _apiUrl + 'sqlViews/' + AggrDataUtil._sqlViewId_OrgUnitInOUG_Form11 + '/data.json' );


	//Util.ConsoleLog( 'Group by ouId data: ' + JSON.stringify( eventList_byOU ) );
	process.stdout.write( "Processing Prev Data: " );

	for ( ouId in eventList_byOU )
	{
		process.stdout.write( "." );

		var ouEventList = eventList_byOU[ ouId ];
		var ouEventList_sorted = Util.sortByKey( ouEventList, "eventDate" );

		// 'Prev Status' &'elapsed days since prev event' set/submit
		app.updatePrevRelatedData( ouEventList_sorted );		
	}

	console.log( "[Done]" );

	return eventList_byOU;
};

app.process_OUGroupUpdate = function( eventList_byOU )
{

	var ouCount = Object.keys( eventList_byOU ).length;
	var count = 0;

	if ( _logLevel && _logLevel >= 1 ) Util.ConsoleLog( '<BR>=== OUGroup Update: ' );

	for ( var ouId in eventList_byOU )
	{
		try
		{
			count++;
			var ouEventList = eventList_byOU[ ouId ];
			var ouEventList_sorted = Util.sortByKey( ouEventList, "eventDate" );

			if ( _logLevel && _logLevel >= 1 ) Util.ConsoleLog( ' - (' + count + '/' + ouCount + ') ouId: ' + ouId + ', events: ' + ouEventList_sorted.length );

			if ( ouEventList_sorted.length > 0 )
			{
				var latestEventData = ouEventList_sorted[ ouEventList_sorted.length - 1 ];

				OUGroupUtil.setOUGroups_StatusLog( ouId, latestEventData.status, _apiUrl );
			}
			else
			{
				// clear the orgUnitGroup for this ou <-- QUESTION - Should it have 'NETWORK_EXCLUDED' 
				OUGroupUtil.setOUGroups_StatusLog( ouId, '', _apiUrl );
			}
		}
		catch ( ex )
		{
			Util.ConsoleLog( '<br><br>###-ERROR- on OUGroup Update, ouId: ' + ouId + ', msg: ' + ex.stack );
			_foundFailedCase = true;
		}
	}
};

app.process_AggUpdate = function( eventList_byOU )
{
	var ouCount = Object.keys( eventList_byOU ).length;
	var count = 0;

	if ( _logLevel && _logLevel >= 1 ) Util.ConsoleLog( '<BR>=== Aggr Update: ' );

	for ( var ouId in eventList_byOU )
	{
		try
		{
			count++;
			if ( _logLevel && _logLevel >= 1 ) Util.ConsoleLog( ' - (' + count + '/' + ouCount + ') ouid: ' + ouId );
			
			// Delete existing data in Aggregate side first!!
			app.deleteDataValueSet( ouId, function( success ) 
			{
				var ouEventList = eventList_byOU[ ouId ];
				var ouEventList_sorted = Util.sortByKey( ouEventList, "eventDate" );

				if ( _logLevel && _logLevel >= 1 ) Util.ConsoleLog( ' eventCount: ' + ouEventList_sorted.length );

				// STEP 1. go throw event list and submit to aggregate side.
				for( var i = 0; i < ouEventList_sorted.length; i++ )
				{
					try
					{
						var eventData = ouEventList_sorted[i];
						//app.submitDataToAggr( eventData, event_LastUnderContract, event_LastOnBoarding, event_LastSuspended );
						app.submitDataToAggr( eventData );
					}
					catch ( ex )
					{
						Util.ConsoleLog( '<br><br>###-ERROR- on Aggr Update, per Event, ouId: ' + ouId + ', msg: ' + ex.stack );
						_foundFailedCase = true;
					}							
				}
			});
		}
		catch ( ex )
		{
			Util.ConsoleLog( '<BR><BR> == ###-ERROR- on Aggr Update, per orgUnit, ouId: ' + ouId + ', msg: ' + ex.stack );
			_foundFailedCase = true;
		}							
	}
};

// ---------------------------------------------------
// Level 2
app.resetPrevRelatedData = function( eventList )
{
	for( var i = 0; i < eventList.length; i++ )
	{
		var eventData = eventList[i];

		eventData.prevSts = "";
		eventData.elapsDate = "";
	}
};

app.updatePrevRelatedData = function( eventList )
{
	for( var i = 0; i < eventList.length; i++ )
	{
		var eventData = eventList[i];

		if ( i > 0 )
		{
			var prevEventData = eventList[i-1];

			eventData.prevSts = prevEventData.status;

			eventData.elapsDate = Util.getDateDiffStr_FromStr( eventData.eventDate, prevEventData.eventDate );

			var updateDeList = [];
			updateDeList.push( { "deId": M_UID.EVENT_DE_STATUS_PREVIOUS, "value": eventData.prevSts } );
			updateDeList.push( { "deId": M_UID.EVENT_DE_DAYS_IN_PREV, "value": eventData.elapsDate } );

			EventDataUtil.updateEventDataValue( eventData.eventId, _apiUrl, updateDeList );	
		}
	}
};

// -------------------------------------------------
app.submitDataToAggr = function( dataJson )
{
	var jsonData = [];

	var period = dataJson.period;
	var ouId = dataJson.ouId;
	var eventDate = dataJson.eventDate.substring(0, 10);
	var sts = dataJson.status;


	// 1. Add Aggr Data G_VAR.numMonthsCopy periods
	var deListObj = {};
	deListObj[ M_UID.AGG_DE_FRANCHISEE_UNKNOWN ] =  Util.get10_Bool(sts === M_UID.STATUS_CODE_Unknown);
	deListObj[ M_UID.AGG_DE_FRANCHISEE_ON_BOARDING ] = Util.get10_Bool(sts === M_UID.STATUS_CODE_OnBoarding);
	deListObj[ M_UID.AGG_DE_FRANCHISEE_UNDER_CONTACT ] = Util.get10_Bool(sts === M_UID.STATUS_CODE_UnderContract);
	deListObj[ M_UID.AGG_DE_FRANCHISEE_SUSPENDED ] = Util.get10_Bool(sts === M_UID.STATUS_CODE_Suspended);
	deListObj[ M_UID.AGG_DE_FRANCHISEE_DEFRANCHISED ] = Util.get10_Bool(sts === M_UID.STATUS_CODE_Defranchised);
	deListObj[ M_UID.AGG_DE_NETWORK_INCLUDED ] = Util.get10_Bool(sts === M_UID.STATUS_CODE_UnderContract);
	deListObj[ M_UID.AGG_DE_NETWORK_EXCLUDED ] = Util.get10_Bool(sts !== M_UID.STATUS_CODE_UnderContract);

	AggrDataUtil.addData24Pe( deListObj, ouId, period, _apiUrl, 'Add Aggr Data over ' + G_VAR.numMonthsCopy + ' periods(C1), event(' + dataJson.eventId + ')', function() { 
	}
	, function() { _foundFailedCase = true; } 
	);


	// 2. Remove MonthsSince related
	var deUid_monthsSince = app.getMonthsSinceUid_FromStatusCode( sts );	
	app.monthsSince_Dels( deUid_monthsSince, ouId, eventDate );
	

	// 3. Insert Data
	periodListDataObj = {};

	// DJP: needs a lot of refactoring -- doing a very similar thing here to
	// AggrDataUtil.getPeList_Next24Pe and could do with generalising the
	// addData24Pe and addData_withPeDataList util methods
	var cDate = new Date();
	var peDate = Util.getDate_FromYYYYMM(period)

	var periodsToDate = (cDate.getFullYear() - peDate.getFullYear()) * 12
						 + (cDate.getMonth() - peDate.getMonth());

	for ( i = 0; i < G_VAR.numMonthsCopy + periodsToDate; i++ )
	{
		var pe = Util.generateNextPeriodCode( period, i );

		var periodDataObj = {};

		periodDataObj[ deUid_monthsSince ] = i + '';

		periodDataObj[ M_UID.AGG_DE_STATUS_LAST_CHANGE ] = eventDate;
		periodDataObj[ M_UID.AGG_DE_STATUS_UPDATE_THIS_MONTH ] = Util.get10_Bool(i == 0);
		periodDataObj[ M_UID.AGG_DE_STATUS_MONTHS_SINCE_LAST_UPDATE ] = i + '';

		periodListDataObj[ pe ] = periodDataObj;
	}

	AggrDataUtil.addData_withPeDataList( periodListDataObj, ouId, _apiUrl, 'Add Aggr Data over ' + G_VAR.numMonthsCopy + ' periods(C2), event(' + dataJson.eventId + ')', function() { 		
	}
	, function() { _foundFailedCase = true; } 
	);
};


app.getMonthsSinceUid_FromStatusCode = function( currStatusCode )
{
	var deUid_monthsSince = "";
	if ( currStatusCode === M_UID.STATUS_CODE_UnderContract ) deUid_monthsSince = M_UID.AGG_DE_MONTHS_SINCE_JOINING_NETWORK;
	else if ( currStatusCode === M_UID.STATUS_CODE_OnBoarding ) deUid_monthsSince = M_UID.AGG_DE_MONTHS_SINCE_ONBOARDING;
	else if ( currStatusCode === M_UID.STATUS_CODE_Suspended ) deUid_monthsSince = M_UID.AGG_DE_MONTHS_SINCE_SUSPENDED;

	return deUid_monthsSince;
}

app.monthsSince_Dels = function( deUid_monthsSince, ouId, eventDate )
{
	var prevMonthDateStr = Util.dateStrMonthChange( eventDate, -1 );
	
	// 1. Delete Other months since 
	var deListObj_others = {};
	
	if ( deUid_monthsSince !== M_UID.AGG_DE_MONTHS_SINCE_JOINING_NETWORK ) deListObj_others[ M_UID.AGG_DE_MONTHS_SINCE_JOINING_NETWORK ] = "0";
	if ( deUid_monthsSince !== M_UID.AGG_DE_MONTHS_SINCE_ONBOARDING ) deListObj_others[ M_UID.AGG_DE_MONTHS_SINCE_ONBOARDING ] = "0";
	if ( deUid_monthsSince !== M_UID.AGG_DE_MONTHS_SINCE_SUSPENDED ) deListObj_others[ M_UID.AGG_DE_MONTHS_SINCE_SUSPENDED ] = "0";

	// THIS IS SYNC SUBMIT...
	AggrDataUtil.deleteDataBySearchDe( undefined, deListObj_others, ouId, eventDate, 'ALL', '11', undefined, _apiUrl, "Remove other months since future periods" );	


	// 2. Remove/Add for current status months since dataValues
	if ( deUid_monthsSince )
	{
		var deListObj = {};
		deListObj[ deUid_monthsSince ] = "0";

		// 2A. Delete the data (monthsSince) on previous periods
		AggrDataUtil.deleteDataBySearchDe( undefined, deListObj, ouId, 'ALL', prevMonthDateStr, '11', undefined, _apiUrl, "Remove previous periods monthsSince case" );
	}
}

app.deleteDataValueSet = function( orgUnitId, afterDelFunc )
{
	try
	{			
		var deListObj = {};
		deListObj[ M_UID.AGG_DE_FRANCHISEE_UNKNOWN ] = "0";
		deListObj[ M_UID.AGG_DE_FRANCHISEE_ON_BOARDING ] = "0";
		deListObj[ M_UID.AGG_DE_FRANCHISEE_UNDER_CONTACT ] = "0";
		deListObj[ M_UID.AGG_DE_FRANCHISEE_SUSPENDED ] = "0";
		deListObj[ M_UID.AGG_DE_FRANCHISEE_DEFRANCHISED ] = "0";
		deListObj[ M_UID.AGG_DE_NETWORK_INCLUDED ] = "0";
		deListObj[ M_UID.AGG_DE_NETWORK_EXCLUDED ] = "0";
		deListObj[ M_UID.AGG_DE_MONTHS_SINCE_JOINING_NETWORK ] = "0";
		deListObj[ M_UID.AGG_DE_MONTHS_SINCE_ONBOARDING ] = "0";
		deListObj[ M_UID.AGG_DE_MONTHS_SINCE_SUSPENDED ] = "0";
		deListObj[ M_UID.AGG_DE_STATUS_LAST_CHANGE ] = "2017-01-01";
		deListObj[ M_UID.AGG_DE_STATUS_UPDATE_THIS_MONTH ] = "0";
		deListObj[ M_UID.AGG_DE_STATUS_MONTHS_SINCE_LAST_UPDATE ] = "0";
				
		AggrDataUtil.deleteDataBySearchDe( undefined, deListObj, orgUnitId, 'ALL', 'ALL', '11', undefined, _apiUrl, 'CLEAR data before update.', function()
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

// =========================================

app.run();


