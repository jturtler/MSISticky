/** HOW TO RUN THIS FILE in console
** node MISStatusLog11.js [server]:https://sandbox.orion.mariestopes.org/ [ou]:<uid>
**/
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
var _startDate = ( _argvSetObj[ "startDate" ] !== undefined ) ? _argvSetObj[ "startDate" ] : "CURRENT";
// if 'mode' is 'Compare', it will check against Aggregate side, and only update Unknown if not exists in aggregate side
var _mode = ( _argvSetObj[ "mode" ] !== undefined ) ? _argvSetObj[ "mode" ] : "Normal";
// level 0: display error message // level 1: display step message and process message // level 2: display more detailed data
var _logLevel = ( _argvSetObj[ "logLevel" ] !== undefined ) ? Number( _argvSetObj[ "logLevel" ] ) : 0;

var _startDateFormatted = "";	// Will be set in later moment

/*
// ==== CatOptionCombo Default (Different Between Servers) ====
var M_UID.CATOPTIONCOMBO_DEFAULT = "CQ6ibh5Ggda";

// ==== DataElements ====
var AGG_DE_SEGMENTATION_A = "IXd6OFCZAfl";
var AGG_DE_SEGMENTATION_B = "lwhzwU6nrJh";
var AGG_DE_SEGMENTATION_C = "RDAsWi4QOmo";
var AGG_DE_SEGMENTATION_D = "Mo76PCg8nZf";
var AGG_DE_SEGMENTATION_UNKNOWN = "WlwUwXL7zjg"; // Sticky Segmentation - Unknown

var AGG_DE_DATE_LAST_CHANGE = "k0Ws0xA2vDj";
var AGG_DE_UPDATED_THIS_MONTH = "DRvlWf9T4tg";
var AGG_DE_MONTHS_SINCE_LAST_UPDATE = "hXLyGfE2sFi";

var _programId = "nPVbI9R3Avm";
var _stageId = "qofz8VA3rt4";
//var _programTableId = 245275;
//var _deTableId_unknown = 244970;
*/

// ==== Sql View ====
var _apiUrl = _serverUrl + "/api/";


var _queryUrl_sqlViewData_Unknown = _apiUrl + 'sqlViews/zDtkWCN7AuF/data.json?var=prgid:' +  M_UID.PROGRAM_ID_SEG + '&var=unknowndeid:' +  M_UID.AGG_DE_SEGMENTATION_UNKNOWN;
//http://localhost:8080/api/sqlViews/SYkTNXsvuIZ/data.json?var=prgid:245275&var=unknowndeid:244970&var=ouid:ALL
// local: SYkTNXsvuIZ, prod: zDtkWCN7AuF

var _queryUrl_dataValueSet_ADD_UPDATE = _apiUrl + 'dataValueSets';
var _queryUrl_dataValueSet_DELETE = _apiUrl + 'dataValueSets?importStrategy=DELETE';
var _queyrUrl_event = _apiUrl + 'events';

// ==== Simple Global Variable Related ====
var _logText = "";	// collect the console log data and use it to output in Log Program event.
var _foundFailedCase = false;

var _scriptName = "MSI12_Unknown.js";

// ---------------------------------------------------
// --------------- App Run Method --------------------

app.run = function() 
{	
	try
	{
		var sourceData = {};
		sourceData.ouid = _ouid;
		sourceData.programId = M_UID.PROGRAM_ID_SEG;
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
			if ( eventData.value === "unknown" )
			{
				if ( _mode === "Compare" )
				{
					// check if aggregate list has this
					var matchAggrData = Util.getItemFromList( aggrList, eventData.ouid, "ouid" );

					// If event side detects 'unknown' and aggregate side does not already have it as 'unknown', submit it for next 24 months (starting from this month)
					if ( matchAggrData === undefined || matchAggrData.value !==  "unknown" )
					{
						app.submitDataToAggr( eventData, "unknown" );
					}
				}
				else
				{
					app.submitDataToAggr( eventData, "unknown" );					
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
		// if ( aggrData.value === "unknown" && aggrData.prgrel === "notInProgram" )
		if ( aggrData.prgrel === "notInProgram" )
		{
			app.submitDataToAggr( aggrData, "notInProgram" );
		}
	}
}


app.submitDataToAggr = function( dataJson, type )
{
	//var period = app.generateCurPeriod();	
	var period = Util.generateCurPeriodFromStr( _startDateFormatted );

	if ( type === "unknown" )
	{
		var ouid = dataJson.ouid;

		// Add Aggr Data 24 periods
		var deListObj_Unknown = {};
		deListObj_Unknown[ M_UID.AGG_DE_SEGMENTATION_UNKNOWN ] = "1";
		deListObj_Unknown[ M_UID.AGG_DE_SEGMENTATION_A ] = "0";
		deListObj_Unknown[ M_UID.AGG_DE_SEGMENTATION_B ] = "0";
		deListObj_Unknown[ M_UID.AGG_DE_SEGMENTATION_C ] = "0";
		deListObj_Unknown[ M_UID.AGG_DE_SEGMENTATION_D ] = "0";
		deListObj_Unknown[ M_UID.AGG_DE_SEGMENTATION_DISENFRANCHISED ] = "0";

		AggrDataUtil.addData24Pe( deListObj_Unknown, ouid, period, _apiUrl, 'UNKNOWN case', function() {}, function() 
		{
			_foundFailedCase = true;
		} );

		// Delete Aggr Data 24 periods
		var deListObj_UnknownDelete = {};
		deListObj_UnknownDelete[ M_UID.AGG_DE_SEGMENTATION_DATE_LAST_CHANGE ] = "2017-01-01";
		deListObj_UnknownDelete[ M_UID.AGG_DE_SEGMENTATION_UPDATE_THIS_MONTH ] = "0";
		deListObj_UnknownDelete[ M_UID.AGG_DE_SEGMENTATION_MONTHS_SINCE_LAST_UPDATE ] = "0";
		
		AggrDataUtil.deleteData24Pe( deListObj_UnknownDelete, ouid, period, _apiUrl, 'UNKNOWN CLEAR case' );

	}
	// else if ( type === "known" )  // <-- This gets changed/entered from custom form
	//		Which, on Save, submits to aggregate side
	//		, Thus, no need to run at here.
	else if ( type === "notInProgram" )
	{
		var ouid = dataJson.ouid;

		var deListObj = {};
		deListObj[ M_UID.AGG_DE_SEGMENTATION_UNKNOWN ] = "0";
		deListObj[ M_UID.AGG_DE_SEGMENTATION_A ] = "0";
		deListObj[ M_UID.AGG_DE_SEGMENTATION_B ] = "0";
		deListObj[ M_UID.AGG_DE_SEGMENTATION_C ] = "0";
		deListObj[ M_UID.AGG_DE_SEGMENTATION_D ] = "0";
		deListObj[ M_UID.AGG_DE_SEGMENTATION_DISENFRANCHISED ] = "0";
		deListObj[ M_UID.AGG_DE_SEGMENTATION_DATE_LAST_CHANGE ] = "2017-01-01";
		deListObj[ M_UID.AGG_DE_SEGMENTATION_UPDATE_THIS_MONTH ] = "0";
		deListObj[ M_UID.AGG_DE_SEGMENTATION_MONTHS_SINCE_LAST_UPDATE ] = "0";

		AggrDataUtil.deleteDataBySearchDe( deListObj, ouid, 'ALL', M_UID.AGG_DE_SEGMENTATION_A, _apiUrl, 'notInProgram CLEAR case' );
	}
}

// ---------------------------------------------------

app.run();
