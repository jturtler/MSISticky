/** HOW TO RUN THIS FILE in console
** node MISStatusLog11.js [server]:https://sandbox.orion.mariestopes.org/ [ou]:<uid>
**/
var urlsync = require('urllib-sync');
var fs = require('fs');
var settingLoc = '/tmp/nodejs/setting.txt';
var settingLoc2 = 'setting.txt';
var settingObj = JSON.parse( (fs.existsSync(settingLoc)) ? fs.readFileSync(settingLoc, 'utf8') : fs.readFileSync(settingLoc2, 'utf8') ); 
eval( urlsync.request( settingObj.jsFile, {timeout: 600000} ).data.toString( 'utf8' )+'' );

RESTUtil.options = { auth: settingObj.dhis.user + ':' + settingObj.dhis.password, timeout: 600000 };
RESTUtil.encoding = 'utf8';

// NEED TO move more common features out of this file/class.
// --> Any smallest logic unit/modual - to be shared by Form and nodeJS

// ----- App Objects -----------
var app = {};

// --------------------------------------------
var _argvSetObj = Util.createArgvSetObj( process.argv );
var _noSubmit = ( _argvSetObj[ "noSubmit" ] !== undefined ) ? _argvSetObj[ "noSubmit" ] : false;
var _serverUrl = ( _argvSetObj[ "server" ] !== undefined ) ? _argvSetObj[ "server" ] : "http://localhost:8080";
var _sourceType = ( _argvSetObj[ "sourceType" ] !== undefined ) ? _argvSetObj[ "sourceType" ] : "Manual";
var _ouid = ( _argvSetObj[ "ouid" ] !== undefined ) ? _argvSetObj[ "ouid" ] : "ALL";
var _startDate = ( _argvSetObj[ "startDate" ] !== undefined ) ? _argvSetObj[ "startDate" ] : "CURRENT";
// if 'mode' is 'Compare', it will check against Aggregate side, and only update Unknown if not exists in aggregate side
var _mode = ( _argvSetObj[ "mode" ] !== undefined ) ? _argvSetObj[ "mode" ] : "Normal";
// level 0: display error message // level 1: display step message and process message // level 2: display more detailed data
var _logLevel = ( _argvSetObj[ "logLevel" ] !== undefined ) ? Number( _argvSetObj[ "logLevel" ] ) : 0;

var _startDateFormatted = "";	// Will be set in later moment


// ==== Sql View and Query Related ====
var _apiUrl = _serverUrl + "/api/";
//var _programTableId = 245008;
//var _deTableId_unknown = 244959;

var _queryUrl_sqlViewData_Unknown = _apiUrl + 'sqlViews/zDtkWCN7AuF/data.json?var=prgid:' + M_UID.PROGRAM_ID_STATUS + '&var=unknowndeid:' + M_UID.AGG_DE_FRANCHISEE_UNKNOWN;
//http://localhost:8080/api/sqlViews/SYkTNXsvuIZ/data.json?var=prgid:245008&var=unknowndeid:244959&var=ouid:ALL
//http://localhost:8080/api/sqlViews/zDtkWCN7AuF/data.json?var=prgid:i8IL2nSOkKX&var=unknowndeid:By1ehX6g7Iv&var=ouid:ALL&var=startDate:2017-01-01
// local: SYkTNXsvuIZ, prod: zDtkWCN7AuF
var _queryUrl_sqlViewData_DataSearch = _apiUrl + 'sqlViews/PgVKlgcVLUt/data.json?var=ouid:[ouid]&var=deid:[deid]';

var _queryUrl_dataValueSet_ADD_UPDATE = _apiUrl + 'dataValueSets';
var _queryUrl_dataValueSet_DELETE = _apiUrl + 'dataValueSets?importStrategy=DELETE';
var _queyrUrl_event = _apiUrl + 'events';

// ==== Simple Global Variable Related ====
var _logText = "";	// collect the console log data and use it to output in Log Program event.
var _foundFailedCase = false;

var _scriptName = "MSI11_Unknown.js";

var _name_unknown = "unknown";
var _name_notInProgram =  "notInProgram";
var _name_Compare = "Compare";

// ---------------------------------------------------
// --------------- App Run Method --------------------

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
			if( _logLevel && _logLevel >= 1 ) Util.ConsoleLog( '<br>--- Script Start - at ' + ( new Date() ).toString() + ' with arguments: ' + JSON.stringify( process.argv ) );

			_startDateFormatted = Util.formatStartDate( _startDate );

			var queryUrl = _queryUrl_sqlViewData_Unknown + '&var=ouid:' + _ouid + '&var=startDate:' + _startDateFormatted;
			if( _logLevel && _logLevel >= 1 ) Util.ConsoleLog( '<br>--- sqlView queryUrl: ' + queryUrl );


			// Retrieve SQL data
			RESTUtil.retreiveData_Synch( queryUrl, function( json_SqlViewData )
			{			
				if ( json_SqlViewData !== undefined )
				{
					// Structure sqlView Data && submit data for each row in SQL result
					var json_structuredList = app.getStructuredList_JsonData( json_SqlViewData );
					// Util.ConsoleLog( 'json_structuredList: ' + JSON.stringify( json_structuredList ) );

					// Update Aggregate side with New Unknown and Changed to Known orgUnits
					app.process_UnknownChanges( json_structuredList );

					// Update Aggregate side with orgUnits unassociated with Program
					// This works for 'Unknown' case and 'Known' case.
					// TODO:  Maybe should move out of this function?
					app.process_ClearUnknownAndKnown( json_structuredList );
				}
				else
				{
					Util.ConsoleLog( '<br>sqlView did not return data.' );

					_foundFailedCase = true;					
				}
			});
						
			if( _logLevel && _logLevel >= 1 ) Util.ConsoleLog( '<br>--- Ended - at ' + ( new Date() ).toString() );


			// Setup the end time and 2 results
			overallSuccess = !_foundFailedCase;
			if ( logCreated ) LogProgram.updateLog( eventLogJson.event, !_foundFailedCase, _logText, _apiUrl, function() {} );
		});		
	}
	catch ( ex )
	{
		Util.ConsoleLog( '<br><br>###-ERROR-: ' + ex.stack );
	}		
};

// ---------------------------------------------------

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
			if ( jsonData.value === "1" ) jsonData.value = _name_unknown;
			else if ( jsonData.value === "0" ) jsonData.value = "known";
			else if ( jsonData.value === "" ) jsonData.value = "noData";

			if ( jsonData.prgrel === "" ) jsonData.prgrel = _name_notInProgram;
			else jsonData.prgrel = "inProgram";

			json_structuredList.aggr.push( jsonData );
		}
		else if ( jsonData.type === "event" )
		{
			if ( jsonData.value === "0" ) jsonData.value = _name_unknown;
			else jsonData.value = "known";
			
			jsonData.prgrel = "inProgram";

			json_structuredList.event.push( jsonData );
		}
	}

	return json_structuredList;
}


// Update Aggregate side with New Unknown and Changed to Known orgUnits
app.process_UnknownChanges = function( json_structuredList )
{
	var aggrList = json_structuredList.aggr;
	var eventList = json_structuredList.event;


	// STEP 1. compare the aggregate and event side to see which ones are new unknown.
	for( var i = 0; i < eventList.length; i++ )
	{
		var eventData = eventList[i];

		try
		{
			if ( eventData.value === _name_unknown )
			{
				if ( _mode === _name_Compare )
				{
					// check if aggregate list has this
					var matchAggrData = Util.getItemFromList( aggrList, eventData.ouid, "ouid" );

					// If event side detects 'unknown' and aggregate side does not already have it as 'unknown'
					// , submit it for next 24 months (starting from this month)
					if ( matchAggrData === undefined || matchAggrData.value !==  _name_unknown )
					{
						app.submitDataToAggr( eventData, _name_unknown );
					}
				}
				else
				{
					app.submitDataToAggr( eventData, _name_unknown );					
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


app.process_ClearUnknownAndKnown = function( json_structuredList )
{
	var aggrList = json_structuredList.aggr;
	//var eventList = json_structuredList.event;

	// STEP 1. look at aggregate data and remove the ou data unassociated to program.
	for( var i = 0; i < aggrList.length; i++ )
	{
		var aggrData = aggrList[i];

		// For now, only update the 'unknown' ones..  <-- rather than
		// updating all Unassociated ones (OUs to program)
		// if ( aggrData.value === _name_unknown && aggrData.prgrel === _name_notInProgram )
		if ( aggrData.prgrel === _name_notInProgram )
		{
			app.submitDataToAggr( aggrData, _name_notInProgram );
		}
	}
}


app.submitDataToAggr = function( dataJson, type )
{
	//var period = app.generateCurPeriod();	
	var period = Util.generateCurPeriodFromStr( _startDateFormatted );

	if ( type === _name_unknown )
	{
		var ouid = dataJson.ouid;

		// Add Aggr Data 24 periods
		var deListObj_Unknown = {};
		deListObj_Unknown[ M_UID.AGG_DE_FRANCHISEE_UNKNOWN ] = "1";
		deListObj_Unknown[ M_UID.AGG_DE_FRANCHISEE_ON_BOARDING ] = "0";
		deListObj_Unknown[ M_UID.AGG_DE_FRANCHISEE_UNDER_CONTACT ] = "0";
		deListObj_Unknown[ M_UID.AGG_DE_FRANCHISEE_SUSPENDED ] = "0";
		deListObj_Unknown[ M_UID.AGG_DE_FRANCHISEE_DEFRANCHISED ] = "0";
		deListObj_Unknown[ M_UID.AGG_DE_NETWORK_INCLUDED ] = "0";
		deListObj_Unknown[ M_UID.AGG_DE_NETWORK_EXCLUDED ] = "1";

		AggrDataUtil.addData24Pe( deListObj_Unknown, ouid, period, _apiUrl, 'UNKNOWN case', function() {}, function() 
		{
			_foundFailedCase = true;
		} );

		// Delete Aggr Data 24 periods
		var deListObj_UnknownDelete = {};
		deListObj_UnknownDelete[ M_UID.AGG_DE_MONTHS_SINCE_JOINING_NETWORK ] = "0";
		deListObj_UnknownDelete[ M_UID.AGG_DE_MONTHS_SINCE_ONBOARDING ] = "0";
		deListObj_UnknownDelete[ M_UID.AGG_DE_MONTHS_SINCE_SUSPENDED ] = "0";
		deListObj_UnknownDelete[ M_UID.AGG_DE_STATUS_DATE_LAST_CHANGE ] = "2017-01-01";
		deListObj_UnknownDelete[ M_UID.AGG_DE_STATUS_UPDATED_THIS_MONTH ] = "0";
		deListObj_UnknownDelete[ M_UID.AGG_DE_STATUS_MONTHS_SINCE_LAST_UPDATE ] = "0";
		
		AggrDataUtil.deleteData24Pe( deListObj_UnknownDelete, ouid, period, _apiUrl, 'UNKNOWN CLEAR case' );

	}
	// else if ( type === "known" )  // <-- This gets changed/entered from custom form
	//		Which, on Save, submits to aggregate side
	//		, Thus, no need to run at here.
	else if ( type === _name_notInProgram )
	{
		var ouid = dataJson.ouid;

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
		deListObj[ M_UID.AGG_DE_STATUS_DATE_LAST_CHANGE ] = "2017-01-01";
		deListObj[ M_UID.AGG_DE_STATUS_UPDATED_THIS_MONTH ] = "0";
		deListObj[ M_UID.AGG_DE_STATUS_MONTHS_SINCE_LAST_UPDATE ] = "0";
				
		AggrDataUtil.deleteDataBySearchDe( deListObj, ouid, 'ALL', M_UID.AGG_DE_FRANCHISEE_ON_BOARDING, _apiUrl, 'notInProgram CLEAR case' );
	}
}

// ---------------------------------------------------

app.run();
