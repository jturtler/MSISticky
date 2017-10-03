// TO RUN this file on console
//node LogAccreditationUnknown20.js [server]:https://sandbox.orion.mariestopes.org [ouid]:X3ZW0ACPevW [program]:qaT1muhnoR2

var urlsync = require('urllib-sync');
var fs = require('fs');
var settingObj = JSON.parse(fs.readFileSync('setting.txt', 'utf8'));
eval( urlsync.request( settingObj.jsFile ).data.toString( 'utf8' )+'' );

RESTUtil.options = { auth: settingObj.dhis.user + ':' + settingObj.dhis.password, timeout: 600000 };
RESTUtil.encoding = 'utf8';

// ----- App Objects -----------
var app = {};

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
var _logLevel = ( _argvSetObj[ "logLevel" ] !== undefined ) ? Number( _argvSetObj[ "logLevel" ] ) : 0;
// --------------------------------------------

var _startDateFormatted = "";	// Will be set in later moment


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
		var sourceData = {};
		sourceData.ouid = _ouid;
		sourceData.programId = _program;
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

			_startDateFormatted = Util.formatStartDate( _startDate );


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
			if ( logCreated ) LogProgram.updateLog( eventLogJson.event, !_foundFailedCase, _logText, _apiUrl, function() {} );
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


// ---------------------------------------------------
// Level 1
app.processProgram = function( programData )
{
	try
	{		
		var programId = programData.id;
		var unknownDeId = programData.deList[M_UID.KEYWORD_DE_STATUS_UNKNOWN];
		
		if ( programId && unknownDeId )
		{
			// Retrieve Latest events of orgunits in current month
			var queryUrl = _queryUrl_sqlViewData_Unknown + '&var=ouid:' + _ouid + '&var=startDate:' + _startDateFormatted;

			queryUrl = queryUrl.replace( KEYWORD_PROGRAMID, programData.id );
			queryUrl = queryUrl.replace( KEYWORD_UNKNOWN_DEID, programData.deList[M_UID.KEYWORD_DE_STATUS_UNKNOWN] );


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
					// app.process_ClearUnknownAndKnown( json_structuredList, programData );
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


app.process_ClearUnknownAndKnown = function( json_structuredList, programData )
{
	var aggrList = json_structuredList.aggr;
	//var eventList = json_structuredList.event;

	// STEP 1. look at aggregate data and remove the ou data unassociated to program.
	for( var i = 0; i < aggrList.length; i++ )
	{
		var aggrData = aggrList[i];

		// For now, only update the 'unknown' ones..  <-- rather than
		// updating all Unassociated ones (OUs to program)
		// if ( aggrData.value === "unknown" && aggrData.prgrel === "notInProgram" )
		if ( aggrData.prgrel === "notInProgram" )
		{
			app.submitDataToAggr( aggrData, "notInProgram", programData );
		}
	}
}

// ---------------------------------------------------
// LEVEL 3
app.submitDataToAggr = function( dataJson, type, programData )
{
	//var period = app.generateCurPeriod();	
	var period = Util.generateCurPeriodFromStr( _startDateFormatted );

	if ( type === "unknown" )
	{
		var ouid = dataJson.ouid;

		// Add Aggr Data 24 periods
		var deListObj_Unknown = {};
		deListObj_Unknown[ programData.deList[M_UID.KEYWORD_DE_STATUS_UNKNOWN] ] = "1";
		deListObj_Unknown[ programData.deList[M_UID.KEYWORD_DE_STATUS_YES] ] = "0";
		deListObj_Unknown[ programData.deList[M_UID.KEYWORD_DE_STATUS_NO] ] = "0";

		AggrDataUtil.addData24Pe( deListObj_Unknown, ouid, period, _apiUrl, 'UNKNOWN case', function() {}, function() 
		{
			_foundFailedCase = true;
		} );
		// Delete Aggr Data 24 periods
		var deListObj_UnknownDelete = {};
		deListObj_UnknownDelete[ programData.deListObj[M_UID.KEYWORD_DE_DATE_LAST_CHANGE_DATE] ] = "2017-01-01";
		deListObj_UnknownDelete[ programData.deListObj[M_UID.KEYWORD_DE_MONTH_SINCE_LAST_UPDATE] ] = "0";
		
		AggrDataUtil.deleteData24Pe( deListObj_UnknownDelete, ouid, period, _apiUrl, 'UNKNOWN CLEAR case' );
	}
	// else if ( type === "known" )  // <-- This gets changed/entered from custom form
	//		Which, on Save, submits to aggregate side
	//		, Thus, no need to run at here.
	else if ( type === "notInProgram" )
	{
		var ouid = dataJson.ouid;

		var deListObj = {};
		deListObj[ programData.deListObj[M_UID.KEYWORD_DE_STATUS_UNKNOWN] ] = "0";
		deListObj[ programData.deListObj[M_UID.KEYWORD_DE_STATUS_YES] ] = "0";
		deListObj[ programData.deListObj[M_UID.KEYWORD_DE_STATUS_NO] ] = "0";
		deListObj[ programData.deListObj[M_UID.KEYWORD_DE_MONTH_SINCE_LAST_UPDATE] ] = "0";
		deListObj[ programData.deListObj[M_UID.KEYWORD_DE_DATE_LAST_CHANGE_DATE] ] = "2017-01-01";

		AggrDataUtil.deleteDataBySearchDe( deListObj, ouid, 'ALL', programData.deListObj[M_UID.KEYWORD_DE_STATUS_YES], _apiUrl, 'notInProgram CLEAR case' );		
	}
}

// ----------------------------------------------------

app.setDEData = function( programData )
{
	programData.deList = {};

	programData.deList[ M_UID.KEYWORD_DE_STATUS_UNKNOWN ] = "";
	programData.deList[ M_UID.KEYWORD_DE_STATUS_YES ] = "";
	programData.deList[ M_UID.KEYWORD_DE_STATUS_NO ] = "";
	programData.deList[ M_UID.KEYWORD_DE_MONTH_SINCE_LAST_UPDATE ] = "";
	programData.deList[ M_UID.KEYWORD_DE_DATE_LAST_CHANGE_DATE ] = "";
	
	var attributeValues = programData.attributeValues;
	
	for( var i = 0; i < attributeValues.length; i++ )
	{
		var attrVal = attributeValues[i];
		if( attrVal.attribute.id === M_UID.ATTR_STATUS_UNKNOWN ){
			programData.deList[M_UID.KEYWORD_DE_STATUS_UNKNOWN] = attrVal.value;
		}
		else if( attrVal.attribute.id === M_UID.ATTR_STATUS_YES ){
			programData.deList[M_UID.KEYWORD_DE_STATUS_YES] = attrVal.value;
		}
		else if( attrVal.attribute.id === M_UID.ATTR_STATUS_NO ){
			programData.deList[M_UID.KEYWORD_DE_STATUS_NO] = attrVal.value;
		}
		else if( attrVal.attribute.id === M_UID.ATTR_MONTHS_SINCE_LAST_UPDATE ){
			programData.deList[M_UID.KEYWORD_DE_MONTH_SINCE_LAST_UPDATE] = attrVal.value;
		}
		else if( attrVal.attribute.id === M_UID.ATTR_LAST_CHANGED_DATE ){
			programData.deList[M_UID.KEYWORD_DE_DATE_LAST_CHANGE_DATE] = attrVal.value;
		}
	}
}

// =============================================


// ---------------------------------------------------

app.run();
