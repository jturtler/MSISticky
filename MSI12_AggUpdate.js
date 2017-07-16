// 'MSI12_AggUpdate.js'
//
// - ABOUT:
//	 For applying the 'MSI Custom Event Form 1.2 - Segmentation Log' logic/processing
//		per orgUnit.
//	 If specific 'ouid' is not provided as parameter, it will run against all orgUnits
//		associated with the program ('Segmentation Log')
//
// - OPERATIONS:
//		1. Use sqlView to retrieve all the events associated with the program
//			and organize(group) them by orgUnit.
//		2. Per orgUnit, on events in it, calculate 'Previous Status' & 'Days since previous event'
//		4. Generate and save the sticky data element values on aggregate side.
//
//	- NOTE:
//		- When saving new sticky data values (on aggregate side)
//			, it deletes all previously existing data.  For easy mass delete on
//			dataValues, it uses dataSet.  

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
// ----- Show Logs & Override Var -----------
// level 0: display error message, level 1: display step message and process message, level 2: more detailed
var _logLevel = ( _argvSetObj[ "logLevel" ] !== undefined ) ? Number( _argvSetObj[ "logLevel" ] ) : 1;


// ----- UIDs and Urls -----------
var _apiUrl = _serverUrl + "/api/";


// ==== CatOptionCombo Default (Different Between Servers) ====
var _catOptionComboDefault = "CQ6ibh5Ggda";

var _programId = "nPVbI9R3Avm";

// ==== DataElements ====
var AGG_DE_SEGMENTATION_A = "IXd6OFCZAfl";
var AGG_DE_SEGMENTATION_B = "lwhzwU6nrJh";
var AGG_DE_SEGMENTATION_C = "RDAsWi4QOmo";
var AGG_DE_SEGMENTATION_D = "Mo76PCg8nZf";
var AGG_DE_SEGMENTATION_UNKNOWN = "WlwUwXL7zjg"; // Sticky Segmentation 

var AGG_DE_DATE_LAST_CHANGE = "k0Ws0xA2vDj";
var AGG_DE_UPDATED_THIS_MONTH = "DRvlWf9T4tg";
var AGG_DE_MONTHS_SINCE_LAST_UPDATE = "hXLyGfE2sFi";

var EVENT_DE_SEGMENTATION_PREVIOUS = "T2iHkAEidOd";
var EVENT_DE_DAYS_IN_PREV = "UrD7yr6JLEf";

// ==== DataSet =====
var DATASET_UID_STICKY_SEGMENTATION_LOG = "IATj4rSpSwx"; // orion server DS id
// ==== Sql View and query URL ====
var _queryUrl_sqlViewData_EventsData = _apiUrl + 'sqlViews/VBbWciUfbDf/data.json';

var _queryUrl_dataValueSet_ADD_UPDATE = _apiUrl + 'dataValueSets';
var _queryUrl_dataValueSet_DELETE = _apiUrl + 'dataValueSets?importStrategy=UPDATE';

var _queyrUrl_event = _apiUrl + 'events';

// ==== Simple Global Variable Related ====
var _logText = "";	// collect the console log data and use it to output in Log Program event.
var _foundFailedCase = false;

var _scriptName = "MSI12_AggUpdate.js";

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

			var queryUrl = _queryUrl_sqlViewData_EventsData + '?var=ouid:' + _ouid + '&var=prgid:' + _programId;

			if ( _logLevel >= 1 ) Util.ConsoleLog( '<br>Events queryUrl: ' + queryUrl );

			RESTUtil.retreiveData_Synch( queryUrl, function( json_SqlViewData )
			{			
				if ( json_SqlViewData !== undefined )
				{
					// Structure sqlView Data && submit data for each row in SQL result
					var json_structuredList = app.getStructuredList_JsonData( json_SqlViewData );
					if ( _logLevel >= 1 ) Util.ConsoleLog( '<br>Events Count: ' + json_structuredList.length );


					// populate data + orgUnit Group update??
					var eventList_GroupByOrgUnit = app.updateData( json_structuredList );
					if ( _logLevel >= 1 ) Util.ConsoleLog( '<br>OrgUnit Count: ' + Object.keys( eventList_GroupByOrgUnit ).length );


					// Update Aggregate side
					app.process_AggUpdate( eventList_GroupByOrgUnit );
				}
				else
				{
					Util.ConsoleLog( '<br>sqlView did not return data: ' + queryUrl );
					_foundFailedCase = true;
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
		Util.ConsoleLog( '<br><br>###-ERROR- on Events Retrieval: ' + ex.stack );
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
app.updateData = function( jsonDataList )
{
	var ouId;

	// reset all the 'prevStatus' and 'elapsedDateSince'
	app.resetPrevRelatedData( jsonDataList );

	// Group the event by orgUnit and process to set Prev and elapseSince
	var eventList_GroupByOrgUnit = Util.getGroupByData( jsonDataList, 'ouId' );

	//Util.ConsoleLog( 'Group by ouId data: ' + JSON.stringify( eventList_GroupByOrgUnit ) );
	process.stdout.write( "Processing Prev Data: " );

	for ( ouId in eventList_GroupByOrgUnit )
	{
		process.stdout.write( "." );

		var ouEventList = eventList_GroupByOrgUnit[ ouId ];
		var ouEventList_sorted = Util.sortByKey( ouEventList, "eventDate" );

		// 'Prev Status' &'elapsed days since prev event' set/submit
		app.updatePrevRelatedData( ouEventList_sorted );		
	}

	console.log( "[Done]" );

	return eventList_GroupByOrgUnit;
}

app.updateEvent = function( eventId, updateDeList )
{
	var queryUrl = _queyrUrl_event + '/' + eventId;

	if ( updateDeList && updateDeList.length > 0 )
	{
		RESTUtil.retreiveData_Synch( queryUrl, function( json_Event )
		{			
			if ( json_Event )
			{
				// update the event dataElements value
				for( var i = 0; i < updateDeList.length; i++ )
				{
					var deValObj = updateDeList[i];
					//deVal.deId, value

					var existingDeValObj = Util.getItemFromList( json_Event.dataValues, deValObj.deId, 'dataElement' );

					if ( existingDeValObj ) existingDeValObj.value = deValObj.value;
					else json_Event.dataValues.push( { "dataElement": deValObj.deId, "value": deValObj.value });
				}

				if ( updateDeList.length > 0 ) 
				{
					// submit the data..
					RESTUtil.submitData_Synch( 'put', queryUrl, json_Event, function( response )
					{
						if ( _logLevel >= 2 ) Util.ConsoleLog( '<br>-- Event Updated: ' + eventId );	
					}
					, function( response )
					{
						Util.ConsoleLog( '<br>-- Event Update Failed: ' + eventId );	
					});					
				}
			}
			else
			{
				Util.ConsoleLog( '<br>Event Retrieval - could not get event: ' + eventId );
			}
		});		
	}
}


app.resetPrevRelatedData = function( eventList )
{
	for( var i = 0; i < eventList.length; i++ )
	{
		var eventData = eventList[i];

		eventData.prevSts = "";
		eventData.elapsDate = "";
	}
}

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
			updateDeList.push( { "deId": EVENT_DE_SEGMENTATION_PREVIOUS, "value": eventData.prevSts } );
			updateDeList.push( { "deId": EVENT_DE_DAYS_IN_PREV, "value": eventData.elapsDate } );

			app.updateEvent( eventData.eventId, updateDeList );			
		}
	}
}

// -------------------------------------------------

app.process_OUGroupUpdate = function( eventList_GroupByOrgUnit )
{
	// per orgUnit, get the last event..
	var ouId;

	for ( ouId in eventList_GroupByOrgUnit )
	{
		try
		{
			var ouEventList = eventList_GroupByOrgUnit[ ouId ];
			var ouEventList_sorted = Util.sortByKey( ouEventList, "eventDate" );

			if ( _logLevel >= 1 ) Util.ConsoleLog( 'OUGroup Update for ouId: ' + ouId + ', ' + ouEventList_sorted.length + ' EVENTS' );

			if ( ouEventList_sorted.length > 0 )
			{
				var latestEventData = ouEventList_sorted[ ouEventList_sorted.length - 1 ];

				app.setOrgUnitGroups( ouId, latestEventData.status );
			}
			else
			{
				// clear the orgUnitGroup for this ou <-- QUESTION - Should it have 'NETWORK_EXCLUDED' 
				app.setOrgUnitGroups( ouId, '' );
			}
		}
		catch ( ex )
		{
			Util.ConsoleLog( '<br><br>###-ERROR- on OUGroup Update, ouId: ' + ouId + ', msg: ' + ex.stack );
			_foundFailedCase = true;
		}
	}
}


app.setOrgUnitGroups = function( ouId, status )
{
	// Add orgUnit in Group
	app.setOrgUnitToGroup( ouId, OUG_UID_FRANCHISEE_ON_BOARDING, ( status === "ONB" ) );
	app.setOrgUnitToGroup( ouId, OUG_UID_FRANCHISEE_UNDER_CONTACT, ( status === "UNC" ) );
	app.setOrgUnitToGroup( ouId, OUG_UID_FRANCHISEE_SUSPENDED, ( status === "SUS" ) );
	app.setOrgUnitToGroup( ouId, OUG_UID_FRANCHISEE_DEFRANCHISED, ( status === "DEF" ) );

	app.setOrgUnitToGroup( ouId, OUG_UID_NETWORK_INCLUDED, ( status === "UNC" ) );	
	app.setOrgUnitToGroup( ouId, OUG_UID_NETWORK_EXCLUDED, ( status !== "UNC" ) );
}

app.setOrgUnitToGroup = function( ouId, groupId, isAddCase )
{	
	var submitType = ( isAddCase ) ? "post" : "delete";

	var queryUrl = _apiUrl + "organisationUnitGroups/" + groupId + "/organisationUnits/" + ouId;

	RESTUtil.submitData_Synch( submitType, queryUrl, {}, function( response )
	{
		if ( _logLevel >= 2 ) Util.ConsoleLog( '<br>-- OUGroup ' + submitType + ' successful: OrgUnit Id ' + ouId + ', groupId: ' + groupId );	
	}
	, function( response )
	{
		Util.ConsoleLog( '<br>-- OUGroup ' + submitType + ' Failed: OrgUnit Id ' + ouId + ', groupId: ' + groupId );	
		_foundFailedCase = true;
	});	
};


// -------------------------------------------------

app.process_AggUpdate = function( eventList_GroupByOrgUnit )
{
	// per orgUnit, get the last event..
	var ouId;

	for ( ouId in eventList_GroupByOrgUnit )
	{
		try
		{
			// Delete existing data in Aggregate side first!!
			app.deleteDataValueSet( DATASET_UID_STICKY_SEGMENTATION_LOG, ouId, '1900-01-01', '2500-01-01', function( success )
			{
				var ouEventList = eventList_GroupByOrgUnit[ ouId ];
				var ouEventList_sorted = Util.sortByKey( ouEventList, "eventDate" );

				if ( _logLevel >= 1 ) Util.ConsoleLog( '<br>-- Aggr Update OrgUnit Id ' + ouId + ', eventCount: ' + ouEventList_sorted.length );	


				// STEP 1. go throw event list and submit to aggregate side.
				for( var i = 0; i < ouEventList_sorted.length; i++ )
				{
					try
					{
						var eventData = ouEventList_sorted[i];
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
			Util.ConsoleLog( '<br><br>###-ERROR- on Aggr Update, per orgUnit, ouId: ' + ouId + ', msg: ' + ex.stack );
			_foundFailedCase = true;
		}							
	}
}

app.submitDataToAggr = function( dataJson )
{
	var jsonData = [];

	var period = dataJson.period;
	var ouId = dataJson.ouId;
	var eventDate = dataJson.eventDate.substring(0, 10);
	var sts = dataJson.status;

	// IMPROVEMENT --> IF NEXT EVENT IS KNOWN, WE CAN STOP UP TO THAT EVENT'S PERIOD (MONTH)
	for ( i = 0; i < 24; i++ )
	{
		var pe = app.generateNextPeriodCode( period, i );

		jsonData.push( app.getJsonData( AGG_DE_SEGMENTATION_A, ouId, pe, app.get10_Bool(sts === "A") ) );		
		jsonData.push( app.getJsonData( AGG_DE_SEGMENTATION_B , ouId, pe, app.get10_Bool(sts === "B") ) );
		jsonData.push( app.getJsonData( AGG_DE_SEGMENTATION_C , ouId, pe, app.get10_Bool(sts === "C") ) );
		jsonData.push( app.getJsonData( AGG_DE_SEGMENTATION_D , ouId, pe, app.get10_Bool(sts === "D") ) );
		jsonData.push( app.getJsonData( AGG_DE_SEGMENTATION_UNKNOWN , ouId, pe, app.get10_Bool(sts === "UNK") ) );
	}

	app.submitDataValueSet( "post", _queryUrl_dataValueSet_ADD_UPDATE, { "dataValues" : jsonData }, function( success )
	{
		if ( success )
		{
			if ( _logLevel >= 2 ) Util.ConsoleLog( '<br>--- Aggr Copy 1 case, OU: ' + ouId + ', Success, eventId: ' + dataJson.eventId );
		}
		else
		{
			Util.ConsoleLog( '<br>--- Aggr Copy 1 case, OU: ' + ouId + ', FAILED!!, eventId: ' + dataJson.eventId );
			_foundFailedCase = true;
		}
	});



	// Do this in separate process - so that the content is not too long..
	jsonData = [];

	for ( i = 0; i < 24; i++ )
	{
		var pe = app.generateNextPeriodCode( period, i );

		jsonData.push( app.getJsonData( AGG_DE_DATE_LAST_CHANGE, ouId, pe, eventDate ) );
		jsonData.push( app.getJsonData( AGG_DE_UPDATED_THIS_MONTH, ouId, pe, app.get10_Bool(i == 0) ) );
		jsonData.push( app.getJsonData( AGG_DE_MONTHS_SINCE_LAST_UPDATE, ouId, pe, i ) );

	}

	app.submitDataValueSet( "post", _queryUrl_dataValueSet_ADD_UPDATE, { "dataValues" : jsonData }, function( success )
	{
		if ( success )
		{
			if ( _logLevel >= 2 ) Util.ConsoleLog( '<br>--- Aggr Copy 2 case, OU: ' + ouId + ', Success, eventId: ' + dataJson.eventId );
		}
		else
		{
			Util.ConsoleLog( '<br>--- Aggr Copy 2 case, OU: ' + ouId + ', FAILED!!, eventId: ' + dataJson.eventId );
		}
	});
	
}


app.getFirstEvent_UnderContract = function( eventList )
{
	var event_FirstContract;

	if ( eventList )
	{
		for ( i = 0; i < eventList.length; i++ )
		{
			var event = eventList[i];

			if ( event.status === "UNC" )
			{
				event_FirstContract = event;
				break;
			}
		}
	}

	return event_FirstContract;
};


// -------------------------------------------------

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

app.deleteDataValueSet = function( dataSetId, orgUnitId, startDate, endDate, returnFunc )
{
	try
	{			
		// Retrieve data first
		var queryUrl = _apiUrl + 'dataValueSets.json?dataSet=' + dataSetId + '&startDate=' + startDate + '&endDate=' + endDate + '&orgUnit=' + orgUnitId;

		//console.log( 'delete case, retrieval query: ' + queryUrl );

		RESTUtil.retreiveData_Synch( queryUrl, function( json_Data )
		{			
			if ( json_Data && json_Data.dataValues && json_Data.dataValues.length > 0 )
			{
				var queryUrl_Delete = _apiUrl + 'dataValueSets?importStrategy=DELETE';

				//console.log( 'delete case, subjmit query: ' + queryUrl_Delete );
				var totalCount = json_Data.dataValues.length;

				// Submit max 100 at a time?
				var jsonDataArrayList = Util.splitArrayIntoArrayList( json_Data.dataValues, 50 );
				var successCount = 0;

				for ( i = 0; i < jsonDataArrayList.length; i++ )
				{
					var dataArray = jsonDataArrayList[i];
					var jsonData = { "dataValues": dataArray };

					RESTUtil.submitData_Synch( 'post', queryUrl_Delete, jsonData, function( response )
					{
						//if ( _logLevel >= 1 ) Util.ConsoleLog( '<br>--- Deleted existing data, OU: ' + orgUnitId );
						//returnFunc( true );
						successCount += dataArray.length;
					}
					, function( response )
					{
						//Util.ConsoleLog( '<br>FAILED TO DELETE EXISTING DATA, OU: ' + orgUnitId );
						//console.log( response );
						_foundFailedCase = true;

						//returnFunc( false );
					});
				}

				if ( _logLevel >= 1 ) Util.ConsoleLog( '<br>--- Deleted existing Aggr Data - ' + successCount + ' out of ' + totalCount + ' on OrgUnit: ' + orgUnitId );
				returnFunc( successCount === totalCount );
			}
			else
			{
				returnfunc( true );
			}
		});
	}
	catch( ex )
	{
		Util.ConsoleLog( '<br>FAILED on Delete Existing Data Method, OU: ' + orgUnitId );
		console.log( ex.Error );
		_foundFailedCase = true;
		returnFunc( false );		
	}
};

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
	LogProgram.dataValuesPush( json_Event.dataValues, LogProgram.DE_ID_ProgramOption, _programId );
	LogProgram.dataValuesPush( json_Event.dataValues, LogProgram.DE_ID_OrgUnitOption, _ouid );
	//LogProgram.dataValuesPush( json_Event.dataValues, LogProgram.DE_ID_DateFromTo, "From: " + _startDate );
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


Util.splitArrayIntoArrayList = function( list, maxCount )
{
	var splitedArray = [];

	for ( i = 0, j = list.length; i < j; i += maxCount ) 
	{
    	var tempArray = list.slice( i, i + maxCount );
		splitedArray.push( tempArray );
	}

	return splitedArray;
}	

// --------------- End of Util Related -----------------
// -----------------------------------------------------

// ---------------------------------------------------

app.run();


