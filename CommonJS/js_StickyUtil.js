/* ---------------------------
== Class List:
	- G_VAR		- Global Variables
	- M_UID		- UID lists
	- Util		- Common Util Methods
	- RESTUtil	- REST api helper (Data Retrieval, Submit, Update, Delete )
	- LogProgram - Logging program events submit related
	- OUGroupUtil - OrgUnit Group related
	- AggrDataUtil - Aggregate side data (DataValues) related
	- EventDataUtil - Event side data related
	- MSIStatusLog - MSI Status Form (1.1) related
	- MSISegLog	- MSI Segmentation Form (1.2) related
*/ 

// NOTE: LAST change date - 2017-12-18
// console.log( 'js_StickyUtil.js local loaded v1.13' );


// ---------------------------------
// ---- STATIC CLASSES --------------------
var G_VAR = {};
var M_UID = {};
var Util = {};
var RESTUtil = {};
var LogProgram = {};
var OUGroupUtil = {};  
var AggrDataUtil = {};  // Add/Update/Delete Aggregate data - REQUIRES/Uses 'Util' & 'RESTUtil' class.
var EventDataUtil = {};  

// ---------------------------------
// ---- VARIABLES --------------------
G_VAR.numMonthsCopy = 60;  // Change it on dataSet to allow this.

RESTUtil.options = { auth: ':', timeout: 600000 };
RESTUtil.encoding = 'utf8';

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

AggrDataUtil._sqlViewId_DataSearch = 'PgVKlgcVLUt';
AggrDataUtil._sqlViewId_DataSearch_Form11 = 'GnPIvGzQU7G';
AggrDataUtil._sqlViewId_DataSearch_Form12 = 'WFnFbxx9aMC';
AggrDataUtil._sqlViewId_DataSearch_Form20 = 'BpSi9iZ1mdb';

AggrDataUtil._sqlViewId_OrgUnitInOUG_Form11 = 'Fu3Wc9pt112';
AggrDataUtil._sqlViewId_OrgUnitInOUG_Form12 = 'Sou7m9Ptwec';


// ----------------------------------------------
// --------------- UIDs -----------------
// ====== COMMON ==================

// ==== DataElements ====
M_UID.EVENT_DE_DAYS_IN_PREV = "UrD7yr6JLEf";
M_UID.EVENT_DE_NOTE = "Yww3Z8MYo1e";

// ==== CatOptionCombo ====
M_UID.CATOPTIONCOMBO_DEFAULT = "CQ6ibh5Ggda";  // _catOptionComboDefault

// ====== STATUS LOG RELATED ======
M_UID.PROGRAM_ID_STATUS = "i8IL2nSOkKX";
M_UID.STAGE_ID_STATUS = "qofz8VA3rt4";

// ==== STATUS CODE ====
M_UID.STATUS_CODE_OnBoarding = "ONB";
M_UID.STATUS_CODE_UnderContract = "UNC";
M_UID.STATUS_CODE_Suspended = "SUS";
M_UID.STATUS_CODE_Defranchised = "DEF";

// ==== DataElements ====
M_UID.AGG_DE_FRANCHISEE_ON_BOARDING = "K7wCU6apTwc";
M_UID.AGG_DE_FRANCHISEE_UNDER_CONTACT = "DS6lHr4eEnw";
M_UID.AGG_DE_FRANCHISEE_SUSPENDED = "In8fazkWqO5";
M_UID.AGG_DE_FRANCHISEE_DEFRANCHISED = "otjftbeXFW2";
M_UID.AGG_DE_FRANCHISEE_UNKNOWN = "By1ehX6g7Iv"; // Sticky Status - Franchisee - Unknown
M_UID.AGG_DE_NETWORK_INCLUDED = "o0i2ESQppT5";
M_UID.AGG_DE_NETWORK_EXCLUDED = "R3JYgPw22T2";

M_UID.AGG_DE_STATUS_UPDATE_THIS_MONTH = "CSQts1sZhE9";
M_UID.AGG_DE_STATUS_MONTHS_SINCE_LAST_UPDATE = "uSpx4DHdae6";
M_UID.AGG_DE_STATUS_LAST_CHANGE = "RpslYBBLJ2Q";

M_UID.AGG_DE_MONTHS_SINCE_JOINING_NETWORK = "n1gp668Y4Hq";
M_UID.AGG_DE_MONTHS_SINCE_ONBOARDING = "ap3kA4OU2UO";
M_UID.AGG_DE_MONTHS_SINCE_SUSPENDED = "gtRZqUPY4r0";

M_UID.EVENT_DE_STATUS = "XhFcLwoD1Dr";
M_UID.EVENT_DE_STATUS_PREVIOUS = "k95lcIlS4bv";

// ==== OrgUnit Groups UID ====
// OUG_UID_ vs GROUP_OU_
M_UID.OUG_UID_FRANCHISEE_ON_BOARDING = "bieIPjDl9rK";
M_UID.OUG_UID_FRANCHISEE_UNDER_CONTACT = "InJBtUUZy2c";
M_UID.OUG_UID_FRANCHISEE_SUSPENDED = "f2sBZWvPAAM";
M_UID.OUG_UID_FRANCHISEE_DEFRANCHISED = "jyhbiSfzbU5";
M_UID.OUG_UID_FRANCHISEE_UNKNOWN = "";
M_UID.OUG_UID_NETWORK_INCLUDED = "qZzR4nEdbWW";
M_UID.OUG_UID_NETWORK_EXCLUDED = "olNLe6DMrgA";

// ==== DataSet =====
M_UID.DATASET_UID_STICKY_STATUS_LOG = "mdYzjEg88qe"; // orion server DS id


// ======================================
// ====== SEGMENTATION LOG RELATED ======

M_UID.PROGRAM_ID_SEG = "nPVbI9R3Avm";
M_UID.STAGE_ID_SEG = "PsdqRrx0KbU";

// ==== DataElements ====
M_UID.AGG_DE_SEGMENTATION_A = "IXd6OFCZAfl";
M_UID.AGG_DE_SEGMENTATION_B = "lwhzwU6nrJh";
M_UID.AGG_DE_SEGMENTATION_C = "RDAsWi4QOmo";
M_UID.AGG_DE_SEGMENTATION_D = "Mo76PCg8nZf";
M_UID.AGG_DE_SEGMENTATION_UNKNOWN = "WlwUwXL7zjg"; // Sticky Segmentation 
M_UID.AGG_DE_SEGMENTATION_DISENFRANCHISE = "GZYmBByQIpc";

M_UID.AGG_DE_SEGMENTATION_A1 = "pPusa1XgLvR";
M_UID.AGG_DE_SEGMENTATION_B1 = "gzItNuOawEm";
M_UID.AGG_DE_SEGMENTATION_B2 = "TvP8vLtLokJ";
M_UID.AGG_DE_SEGMENTATION_C1 = "cpcwuFL4P63";
M_UID.AGG_DE_SEGMENTATION_C2 = "n6ebQdtTEg0";
M_UID.AGG_DE_SEGMENTATION_D1 = "mB0Z390lvLE";
M_UID.AGG_DE_SEGMENTATION_D2 = "DmGOQFmcuqf";
M_UID.AGG_DE_SEGMENTATION_D3 = "h0RirtCDuE6";
M_UID.AGG_DE_SEGMENTATION_D4 = "jLevV7SYpaY";

M_UID.AGG_DE_SEGMENTATION_UPDATE_THIS_MONTH = "DRvlWf9T4tg";
M_UID.AGG_DE_SEGMENTATION_MONTHS_SINCE_LAST_UPDATE = "hXLyGfE2sFi";
M_UID.AGG_DE_SEGMENTATION_DATE_LAST_CHANGE = "k0Ws0xA2vDj";

M_UID.EVENT_DE_SEGMENTATION = "wYoGZDnvu3n";
M_UID.EVENT_DE_SEGMENTATION_SUB = "DwXW311h36K";
M_UID.EVENT_DE_SEGMENTATION_PREVIOUS = "T2iHkAEidOd";
M_UID.EVENT_DE_SEGMENTATION_SUB_PREVIOUS = "Lwugb7O0coU";

// ==== OU GROUP ====
M_UID.OUG_UID_SEGMENTATION_A = "VgUniUYGInI";
M_UID.OUG_UID_SEGMENTATION_B = "h90V7SLY1bm";
M_UID.OUG_UID_SEGMENTATION_C = "dgJIod9A9Zz";
M_UID.OUG_UID_SEGMENTATION_D = "ZFY5dg0Cr3N";
M_UID.OUG_UID_SEGMENTATION_UNKNOWN = "Rx8VFFO2ZU0";
M_UID.OUG_UID_SEGMENTATION_DISENFRANCHISE = "Jw7MSDwSY8O";
M_UID.OUG_UID_SEGMENTATION_A1 = "m9GtDGXSunQ";
M_UID.OUG_UID_SEGMENTATION_B1 = "NgXHFUIoxN0";
M_UID.OUG_UID_SEGMENTATION_B2 = "VVG5scxK6iZ";
M_UID.OUG_UID_SEGMENTATION_C1 = "iakoo2fTHpn";
M_UID.OUG_UID_SEGMENTATION_C2 = "f0KMYmwOHg6";
M_UID.OUG_UID_SEGMENTATION_D1 = "lQfFa7sohBT";
M_UID.OUG_UID_SEGMENTATION_D2 = "SWIUrFEvpQN";
M_UID.OUG_UID_SEGMENTATION_D3 = "qDCqiWmf3IE";
M_UID.OUG_UID_SEGMENTATION_D4 = "rl9mPY1Ni3U";

// ==== CODE ====
M_UID.SEGMENTATION_CODE_A = "A";
M_UID.SEGMENTATION_CODE_B = "B";
M_UID.SEGMENTATION_CODE_C = "C";
M_UID.SEGMENTATION_CODE_D = "D";
M_UID.SEGMENTATION_CODE_A1 = "A1";
M_UID.SEGMENTATION_CODE_B1 = "B1";
M_UID.SEGMENTATION_CODE_B2 = "B2";
M_UID.SEGMENTATION_CODE_C1 = "C1";
M_UID.SEGMENTATION_CODE_C2 = "C2";
M_UID.SEGMENTATION_CODE_D1 = "D1";
M_UID.SEGMENTATION_CODE_D2 = "D2";
M_UID.SEGMENTATION_CODE_D3 = "D3";
M_UID.SEGMENTATION_CODE_D4 = "D4";
M_UID.SEGMENTATION_CODE_UNKNOWN = "UNK";
M_UID.SEGMENTATION_CODE_DISENFRANCHISE = "DISENF";

// ==== DataSet =====
M_UID.DATASET_UID_STICKY_SEGMENTATION_LOG = "IATj4rSpSwx"; // orion server DS id


// ======================================
// ====== ACCREDITATION LOG RELATED ======

// ==== Attributes ====
M_UID.ATTR_STATUS_UNKNOWN = "HuGSI9izuuX"; // Sticky Status - Unknown
M_UID.ATTR_STATUS_YES = "JNCRRIJCsPl"; // Sticky Status - Yes
M_UID.ATTR_STATUS_NO = "xh8lSWP0dyv"; // Sticky Status - No
M_UID.ATTR_MONTHS_SINCE_LAST_UPDATE = "c0eTL04Qnls"; // Sticky Status - Months since last update
M_UID.ATTR_LAST_CHANGED_DATE = "v6mICtv8rLm"; // Sticky Status - Date last change date

// ==== Data Elements keywords ====
M_UID.KEYWORD_DE_STATUS_UNKNOWN = "Status_Unknown"; // Sticky Status - Unknown
M_UID.KEYWORD_DE_STATUS_YES = "Status_Yes";// Sticky Status - Yes
M_UID.KEYWORD_DE_STATUS_NO = "Status_No"; // Sticky Status - No
M_UID.KEYWORD_DE_MONTH_SINCE_LAST_UPDATE = "Month_Since_Last_Update"; // Sticky Status - Months since last update
M_UID.KEYWORD_DE_DATE_LAST_CHANGE_DATE = "Date_Last_Change_Date"; // Sticky Status - Date last change date

// ==== Sql View keywords ====  [NEVER USED]
M_UID.KEYWORD_STARTDATE = "@KEYWORD_STARTDATE";
M_UID.KEYWORD_ENDDATE = "@KEYWORD_ENDDATE";
M_UID.KEYWORD_PROGRAMID = "@KEYWORD_PROGRAMID";


// ----------------------------------------------
// --------------- Util Related -----------------

// -- Essentials and List/Array Related ------------
	
Util.checkDefined = function( input ) {

	if( input !== undefined && input != null ) return true;
	else return false;
};

Util.checkValue = function( input ) {

	if ( Util.checkDefined( input ) && input.length > 0 ) return true;
	else return false;
};


Util.sortByKey = function( array, key ) {
	return array.sort( function( a, b ) {
		var x = a[key]; var y = b[key];
		return ( ( x < y ) ? -1 : ( ( x > y ) ? 1 : 0 ) );
	});
};


Util.findItemFromList = function( listData, searchProperty, searchValue )
{
	var foundData;

	$.each( listData, function( i, item )
	{
		if ( item[ searchProperty ] == searchValue )
		{
			foundData = item;
			return false;
		}
	});

	return foundData;
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

Util.removeItemFromList = function( listData, searchProperty, searchValue )
{
	$.each( listData, function( i, item )
	{
		if ( item[ searchProperty ] == searchValue )
		{
			listData.splice(i, 1);
			return false;
		}
	});
};

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
};

// ----------------------------

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
};

Util.getDateDiff = function( futureDate, pastDate )
{
	var timeDiff = Math.abs( futureDate.getTime() - pastDate.getTime() );

	return Math.ceil( timeDiff / ( 1000 * 3600 * 24 ) );
};

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
};

Util.monthsDiff = function( futureDate, pastDate )
{
	var year1 = Number( pastDate.substring(0,4) );
	var year2 = Number( futureDate.substring(0,4) );
	
	var month1 = Number( pastDate.substring(5,7) );
	var month2 = Number( futureDate.substring(5,7) );
	
	return ( ( ( year2 - year1 ) * 12 ) + ( month2 - month1 ) );
};

Util.convertStrToDate = function( dateStr )
{
	var year = dateStr.substring( 0, 4 );
	var month = eval( dateStr.substring( 5,7 ) ) - 1;
	var day = dateStr.substring( 8,10 );
	
	return new Date( year, month, day );
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


Util.generateNextPeriodCode = function( period, i )
{
	var dateTemp = Util.getDate_FromYYYYMM( period );
	dateTemp.setMonth( dateTemp.getMonth() + i );

	return Util.getDateStringYYYYMM( dateTemp );
};

Util.dateStrMonthChange = function( strDate, i )
{
	var dateTemp = Util.getDate_FromYYYYMMDD( strDate );
	dateTemp.setMonth( dateTemp.getMonth() + i );
		
	return Util.getDateStringYYYYMM( dateTemp, '-', 'DD' );	
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

// ---------------------------

Util.getGroupByData = function( jsonDataList, prop )
{
	var listObj = {};

	// get unique ou
	for( var i = 0; i < jsonDataList.length; i++ )
	{
		var jsonData = jsonDataList[i];
		var propVal = jsonData[ prop ];  // if prop is 'ouid', we get the ouid value as 'propVal'

		// obj in new list, if ready created..
		var objWithList = listObj[ propVal ]; 
		
		// If already exists in the list, get it(inner array) and append to the array..
		// The new list will consist of 'id : [ {jsonData}, {jsonData} ]', each 'jsonData' is the full json data of original (the event data?).
		if ( objWithList ) objWithList.push( jsonData );
		else
		{
			// new case - array with one event in it.
			listObj[ propVal ] = [ jsonData ];
		}
	}

	return listObj;
};


Util.ConsoleLog = function( msg )
{
	if ( _logText !== undefined && _logText ) _logText += msg + '\n';

	console.log( msg );
};


Util.fillLeadingZero = function( val )
{
	return ( val[1] ) ? val : "0" + val[0];
};


// -- JQuery Ones - Form specific

Util.disableTag = function( tag, isDisable )
{
	tag.prop( 'disabled', isDisable);
	
	for( var i=0; i<tag.length; i++ )
	{
		var element = $(tag[i]);
		if( element.prop( "tagName" ) == 'SELECT' || element.prop( "tagName" ) == 'INPUT' )
		{
			if( isDisable )
			{
				element.css( 'background-color', '#FAFAFA' ).css( 'cursor', 'auto' ).css( 'color', '#444' );
			}
			else
			{
				element.css( 'background-color', 'white' ).css( 'cursor', '' );
			}
		}
	}
};

// ========== OTHERS ==================

// ---- nodeJS Specific?
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
};


// =========== DHIS Related Utils ============


// -------------------------------------------------------------------------
// Periods
// -------------------------------------------------------------------------

Util.generateEventPeriod = function( eventDate )
{
	var year = eventDate.substring(0, 4);
	var month = eventDate.substring(5, 7);
	
	return year + month;
};

Util.getAddedMonthStr = function( selectedPeriod, i )
{
	var dateTemp = Util.getDate_FromYYYYMM( selectedPeriod );

	dateTemp.setMonth( dateTemp.getMonth() + i );

	return Util.getDateStringYYYYMM( dateTemp );
};


// Get 'DataValueJson' <-- TODO: Replace - on Scripts!!
//Util.getJsonData = function( deId, ouid, pe, catOpCombo, value )
Util.composeDataValueJson = function( deId, peId, ouId, value )
{
	return {
		'dataElement' : deId,
		'categoryoptioncombo' : M_UID.CATOPTIONCOMBO_DEFAULT,
		'orgUnit' : ouId,
		'period' : peId,
		'value' : value
	}
};

Util.composeEventJson = function( programId, stageId, ouId, eventDate )
{
	var json_Event = {};

	//var currentDateTime = Util.getDHIS_DateTimeFormat( new Date() );
	json_Event.program = programId;
	json_Event.programStage = stageId;
	json_Event.orgUnit = ouId;
	json_Event.eventDate = eventDate;
	json_Event.dataValues = [];

	return json_Event;
};

Util.getDataValueByDeId = function( dataValues, deId )
{
	var returnVal = "";

	if ( dataValues )
	{
		var dvObj = Util.findItemFromList( dataValues, "dataElement", deId );
		if ( dvObj ) returnVal = dvObj.value;
	}

	return returnVal;
};

Util.dataValuesPush = function( jsonDataValues, deId, value )
{
	var deObj = Util.getItemFromList( jsonDataValues, deId, "dataElement" );

	if ( deObj ) deObj.value = value;
	else jsonDataValues.push( { "dataElement": deId, "value": value });
};


Util.get10_Bool = function( flag )
{
	if ( flag ) return "1";
	else return "0";
}

Util.generatePeriodByDate = function( dateStr )
{
	return dateStr.substring(0, 4) + "" + dateStr.substring(5, 7);
}

// 	Calculate the number of months between lastUpdate of event and a period
Util.generateMonthSinceDate = function( date, period )
{
	var year1 = Number( date.substring(0,4) );
	var year2 = Number( period.substring(0,4) );
	
	var month1 = Number( date.substring(5,7) );
	var month2 = Number( period.substring(4,6) );
	
	return ( (year2 - year1) * 12 + (month2 - month1) );
};


Util.getLastEvent_InStatus = function( eventList, statusCode )
{
	var event_LastInStatus;

	if ( eventList )
	{
		for ( i = eventList.length - 1; i >= 0; i-- )
		{
			var event = eventList[i];

			if ( event.status === statusCode )
			{
				event_LastInStatus = event;
				break;
			}
		}
	}

	return event_LastInStatus;
};

Util.formatStartDate = function( startDateInput )
{
	return ( startDateInput === "CURRENT" ) ? Util.getDateStringYYYYMM( new Date(), "-", "01" ) : startDateInput;
};

// -------------------------------------------------------------------------
// Check and generate Data Values
// -------------------------------------------------------------------------
		
// Check data
Util.checkIfEventDateInCurPeriod = function( eventDate, period )
{
	var eventPeriod = Util.generateEventPeriod( eventDate );
	return ( eventPeriod === period );
};


// --- Empty data in orgUnitList (Object) ------------------
Util.setEventList_EmptyOuArray = function( eventList_byOU, ouid, queryUrl_OrgUnitInOUG )
{
	// If this is one specific orgUnit request case, if data(event) emtpy case, manually add it 
	//	- for it to process further, for updating ouGroup, deleting data.
	if ( ouid === "ALL" )
	{
		if ( queryUrl_OrgUnitInOUG !== undefined )
		{
			Util.retreiveOrgUnitInOUG( queryUrl_OrgUnitInOUG, function( orgUnitsInObj ) 
			{
				for ( var ouid_OUG in orgUnitsInObj )
				{
					if ( eventList_byOU[ ouid_OUG ] === undefined )
					{
						// Add emtpy array for this orgUnit - for processing deletion. (of OUG & Aggre)
						eventList_byOU[ ouid_OUG ] = [];
					}
				}

				var emptiedFoundNo = Object.keys( eventList_byOU ).length;
				if ( emptiedFoundNo > 0 )
				{
					if ( _logLevel !== undefined && _logLevel >= 1 ) Util.ConsoleLog( '<br>--- emptiedFoundNo: ' + emptiedFoundNo );
				}
			});
		}
	}
	else
	{ 
		if ( eventList_byOU[ ouid ] === undefined )
		{
			eventList_byOU[ ouid ] = [];
		}
	}
};

Util.retreiveOrgUnitInOUG = function( queryUrl, returnFunc )
{
	var json_orgUnits = {};

	RESTUtil.retreiveData_Synch( queryUrl, function( json_SqlViewData )
	{
		if ( json_SqlViewData !== undefined )
		{
			var jsonDataList = json_SqlViewData.rows;

			// Get all data. add into structure
			for( var i = 0; i < jsonDataList.length; i++ )
			{
				var data = jsonDataList[i];

				json_orgUnits[ data[0] ] = "Y";
			}
		}

		returnFunc( json_orgUnits );
	});	
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


// ========== Asynch =================	

RESTUtil.retrieveData = function( url, returnSuccess, returnBefore, returnDone )
{
	RESTUtil.retrieveData_Async ( url, returnSuccess, returnBefore, returnDone );
}

RESTUtil.retrieveData_Async = function( url, returnSuccess, returnBefore, returnDone )
{
	$.ajax(
	{
		type: "GET"
		,url: url
		,beforeSend: function( xhr ) {
			if ( returnBefore ) returnBefore();
		}
		,success: function( response ) 
		{	
			if ( returnSuccess ) returnSuccess( response );
		}
	}).done( function( data ) {
		if ( returnDone ) returnDone();
	});
};

RESTUtil.retreiveData_Asynch = function( queryUrl, returnFunc )
{
	$.ajax(
	{
		type: "GET"
		,url: queryUrl
		,success: function( response ) 
		{	
			if ( returnFunc ) returnFunc( response );
		}
		,error: function() {
			if ( returnFunc ) returnFunc( undefined );
		}		
	});
};

RESTUtil.submitData_Async = function( type, url, jsonData, returnSuccess, returnFail )
{
	$.ajax(
	{
		type: type
		,url: url
		,dataType: "json"
		,data: JSON.stringify( jsonData )
		,headers: {
			'Content-Type': 'application/json'
		}
		//,beforeSend: function( xhr ) {
		//	if ( returnBefore ) returnBefore();
		//}
		,success: function( response ) 
		{	
			if ( returnSuccess ) returnSuccess( response );
		}
		,error: function() {
			if ( returnFail ) returnFail();
		}		
	});
};


RESTUtil.submitData_Asynch = function( submitType, queryUrl, jsonData, successFunc, failFunc )
{
	//if ( _noSubmit )  Util.ConsoleLog( '<br> =====> Data No Submit Mode ============' );
	$.ajax(
	{
		type: submitType
		,url: queryUrl
		,dataType: "json"
		,data: JSON.stringify( jsonData )
		,headers: {
			'Content-Type': 'application/json'
		}
		,success: function( response ) 
		{	
			if ( successFunc ) successFunc( response );

			// DEBUG
			//console.log( 'SUCCESS - RESTUtil.submitData_Asynch, Response: ' + response );				
		}
		,error: function( response ) {
			if ( failFunc ) failFunc( response );
			Util.ConsoleLog( '<br>--Failed. Response: ' + response );				

			// DEBUG
			//console.log( 'FAIL - RESTUtil.submitData_Asynch, Response: ' + response );				
		}		
	});
};


// ----------------------------------------------
// --------------- Log Program Related -----------------
LogProgram.createLog = function( sourceData, apiUrl, returnFunc )
{
	try
	{		
		var queryUrl = apiUrl + 'events';

		var json_Event = LogProgram.composeEventJson( sourceData );

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
LogProgram.updateLog = function( eventId, result, logText, apiUrl, returnFunc )
{	
	var currentDateTime = Util.getDHIS_DateTimeFormat( new Date() );

	var queryUrl = apiUrl + 'events/' + eventId;

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


LogProgram.composeEventJson = function( sourceData )
{
	var json_Event = {};

	var currentDateTime = Util.getDHIS_DateTimeFormat( new Date() );

	json_Event.program = LogProgram._program_Log;
	json_Event.programStage = LogProgram._programStage_Log;
	json_Event.orgUnit = LogProgram._orgUnit_Root_Log;
	json_Event.eventDate = currentDateTime;
	json_Event.dataValues = [];

	LogProgram.dataValuesPush( json_Event.dataValues, LogProgram.DE_ID_ScriptRunName, sourceData.scriptName );
	LogProgram.dataValuesPush( json_Event.dataValues, LogProgram.DE_ID_RunBy, sourceData.sourceType );
	LogProgram.dataValuesPush( json_Event.dataValues, LogProgram.DE_ID_ProgramOption, sourceData.programId );
	LogProgram.dataValuesPush( json_Event.dataValues, LogProgram.DE_ID_OrgUnitOption, sourceData.ouid );
	LogProgram.dataValuesPush( json_Event.dataValues, LogProgram.DE_ID_StartedTime, currentDateTime );

	if ( sourceData.startDate )
	{
		var dateRangeText = "From: " + sourceData.startDate;

		if ( sourceData.endDate ) dateRangeText += ", To: " + sourceData.endDate;
	
		LogProgram.dataValuesPush( json_Event.dataValues, LogProgram.DE_ID_DateFromTo, dateRangeText );	
	} 


	return json_Event;
}

LogProgram.dataValuesPush = function( jsonDataValues, deId, value )
{
	var deObj = Util.getItemFromList( jsonDataValues, deId, "dataElement" );

	if ( deObj ) deObj.value = value;
	else jsonDataValues.push( { "dataElement": deId, "value": value });
}


// ----------------------------------------------
// --------------- OUGroupUtil Related -----------------
// setOrgUnitGroups --> setOUGroups_StatusLog
OUGroupUtil.setOUGroups_StatusLog = function( ouid, status, apiUrl )
{
	// Add orgUnit in Group
	OUGroupUtil.setOrgUnitToGroup( ouid, M_UID.OUG_UID_FRANCHISEE_ON_BOARDING, ( status === M_UID.STATUS_CODE_OnBoarding ), apiUrl );
	OUGroupUtil.setOrgUnitToGroup( ouid, M_UID.OUG_UID_FRANCHISEE_UNDER_CONTACT, ( status === M_UID.STATUS_CODE_UnderContract ), apiUrl );
	OUGroupUtil.setOrgUnitToGroup( ouid, M_UID.OUG_UID_FRANCHISEE_SUSPENDED, ( status === M_UID.STATUS_CODE_Suspended ), apiUrl );
	OUGroupUtil.setOrgUnitToGroup( ouid, M_UID.OUG_UID_FRANCHISEE_DEFRANCHISED, ( status === M_UID.STATUS_CODE_Defranchised ), apiUrl );

	OUGroupUtil.setOrgUnitToGroup( ouid, M_UID.OUG_UID_NETWORK_INCLUDED, ( status === M_UID.STATUS_CODE_UnderContract ), apiUrl );	
	OUGroupUtil.setOrgUnitToGroup( ouid, M_UID.OUG_UID_NETWORK_EXCLUDED, ( status !== M_UID.STATUS_CODE_UnderContract ), apiUrl );
}


OUGroupUtil.setOUGroups_SegLog = function( ouid, status, apiUrl )
{
	// Add orgUnit in Group
	OUGroupUtil.setOrgUnitToGroup( ouid, M_UID.OUG_UID_SEGMENTATION_A, ( status === M_UID.SEGMENTATION_CODE_A ), apiUrl );
	OUGroupUtil.setOrgUnitToGroup( ouid, M_UID.OUG_UID_SEGMENTATION_B, ( status === M_UID.SEGMENTATION_CODE_B ), apiUrl );
	OUGroupUtil.setOrgUnitToGroup( ouid, M_UID.OUG_UID_SEGMENTATION_C, ( status === M_UID.SEGMENTATION_CODE_C ), apiUrl );
	OUGroupUtil.setOrgUnitToGroup( ouid, M_UID.OUG_UID_SEGMENTATION_D, ( status === M_UID.SEGMENTATION_CODE_D ), apiUrl );
	OUGroupUtil.setOrgUnitToGroup( ouid, M_UID.OUG_UID_SEGMENTATION_UNKNOWN, ( status === M_UID.SEGMENTATION_CODE_UNKNOWN ), apiUrl );
	OUGroupUtil.setOrgUnitToGroup( ouid, M_UID.OUG_UID_SEGMENTATION_DISENFRANCHISE, ( status === M_UID.SEGMENTATION_CODE_DISENFRANCHISE ), apiUrl );
}

OUGroupUtil.setOUGroups_SegLog_WithSub = function( ouid, status, subStatus, apiUrl )
{
	// NOTE: TODO: COULD INHANCE THIS?  RATER THAN TRYING THE DELETION OF ALL, WE MIGHT LOOK FOR THEM FIRST?

	// Add orgUnit in Group
	OUGroupUtil.setOrgUnitToGroup( ouid, M_UID.OUG_UID_SEGMENTATION_A1, ( subStatus === M_UID.SEGMENTATION_CODE_A1 ), apiUrl );
	OUGroupUtil.setOrgUnitToGroup( ouid, M_UID.OUG_UID_SEGMENTATION_B1, ( subStatus === M_UID.SEGMENTATION_CODE_B1 ), apiUrl );
	OUGroupUtil.setOrgUnitToGroup( ouid, M_UID.OUG_UID_SEGMENTATION_B2, ( subStatus === M_UID.SEGMENTATION_CODE_B2 ), apiUrl );
	OUGroupUtil.setOrgUnitToGroup( ouid, M_UID.OUG_UID_SEGMENTATION_C1, ( subStatus === M_UID.SEGMENTATION_CODE_C1 ), apiUrl );
	OUGroupUtil.setOrgUnitToGroup( ouid, M_UID.OUG_UID_SEGMENTATION_C2, ( subStatus === M_UID.SEGMENTATION_CODE_C2 ), apiUrl );
	OUGroupUtil.setOrgUnitToGroup( ouid, M_UID.OUG_UID_SEGMENTATION_D1, ( subStatus === M_UID.SEGMENTATION_CODE_D1 ), apiUrl );
	OUGroupUtil.setOrgUnitToGroup( ouid, M_UID.OUG_UID_SEGMENTATION_D2, ( subStatus === M_UID.SEGMENTATION_CODE_D2 ), apiUrl );
	OUGroupUtil.setOrgUnitToGroup( ouid, M_UID.OUG_UID_SEGMENTATION_D3, ( subStatus === M_UID.SEGMENTATION_CODE_D3 ), apiUrl );
	OUGroupUtil.setOrgUnitToGroup( ouid, M_UID.OUG_UID_SEGMENTATION_D4, ( subStatus === M_UID.SEGMENTATION_CODE_D4 ), apiUrl );

	OUGroupUtil.setOrgUnitToGroup( ouid, M_UID.OUG_UID_SEGMENTATION_A, ( status === M_UID.SEGMENTATION_CODE_A ), apiUrl );
	OUGroupUtil.setOrgUnitToGroup( ouid, M_UID.OUG_UID_SEGMENTATION_B, ( status === M_UID.SEGMENTATION_CODE_B ), apiUrl );
	OUGroupUtil.setOrgUnitToGroup( ouid, M_UID.OUG_UID_SEGMENTATION_C, ( status === M_UID.SEGMENTATION_CODE_C ), apiUrl );
	OUGroupUtil.setOrgUnitToGroup( ouid, M_UID.OUG_UID_SEGMENTATION_D, ( status === M_UID.SEGMENTATION_CODE_D ), apiUrl );
	OUGroupUtil.setOrgUnitToGroup( ouid, M_UID.OUG_UID_SEGMENTATION_UNKNOWN, ( status === M_UID.SEGMENTATION_CODE_UNKNOWN ), apiUrl );
	OUGroupUtil.setOrgUnitToGroup( ouid, M_UID.OUG_UID_SEGMENTATION_DISENFRANCHISE, ( status === M_UID.SEGMENTATION_CODE_DISENFRANCHISE ), apiUrl );
}

/*
1.9.4.2. Adding or removing multiple objects
You can add or remove multiple objects from a collection in one request with a payload like this:

{
  "identifiableObjects": [
    { "id": "IDA" },
    { "id": "IDB" },
    { "id": "IDC" }
  ]
}
*/


OUGroupUtil.setOrgUnitToGroup = function( ouId, groupId, isAddCase, apiUrl )
{	
	var submitType = ( isAddCase ) ? "post" : "delete";

	var queryUrl = apiUrl + "organisationUnitGroups/" + groupId + "/organisationUnits/" + ouId;

	RESTUtil.submitData_Synch( submitType, queryUrl, {}, function( response )
	{
		if ( _logLevel && _logLevel >= 2 ) Util.ConsoleLog( '<br>-- OUGroup ' + submitType + ' successful: OrgUnit Id ' + ouId + ', groupId: ' + groupId );	
	}
	, function( response )
	{
		Util.ConsoleLog( '<br>-- OUGroup ' + submitType + ' Failed: OrgUnit Id ' + ouId + ', groupId: ' + groupId );	
		if ( _foundFailedCase ) _foundFailedCase = true;
	});	
};

// Async
OUGroupUtil.addOrgUnitToGroup = function( ouId, groupId, apiUrl )
{
	var url = apiUrl + "organisationUnitGroups/" + groupId + "/organisationUnits/" + ouId;

	RESTUtil.submitData_Async( 'POST', url, new Object(), function() {
	}, function() {
		console.log( 'Failed to add orgUnit ' + ouId + ' to group ' + groupId );
	});			
};
		
OUGroupUtil.removeOrgUnitToGroup = function( ouId, groupId, apiUrl )
{
	var url = apiUrl + "organisationUnitGroups/" + groupId + "/organisationUnits/" + ouId;

	RESTUtil.submitData_Async( 'DELETE', url, new Object(), function() {
	}, function() {
		console.log( 'Failed to remove orgUnit ' + ouId + ' from group ' + groupId );
	});				
};


OUGroupUtil.matchAndJoin_OuGroup = function( ouId, ougId, ougId2, url )
{
	if ( ougId === ougId2 ) OUGroupUtil.addOrgUnitToGroup( ouId, ougId, url );
	else OUGroupUtil.removeOrgUnitToGroup( ouId, ougId, url );
}

// ------------------------------------------------
// --- AggrDataUtil Class -------------------------


// TODO: MAKE IT THE MAIN AND ONLY ONE!!!!
AggrDataUtil.deleteDataBySearchDe = function( formAsyncStr, deListObj, ouid, startDate, endDate, formType, form20Id, apiUrl, msgText, returnSuccess, returnFailure )
{
	// retrieve period - 'startDate' example '2017-01-01'
	AggrDataUtil.retrieveDataSearchPeriods( ouid, formType, form20Id, startDate, endDate, apiUrl, function( dataPeriods )
	{
		//AggrDataUtil.retrieveDataSearchPeriods = function( ouid, formType, form20Id, startDate, endDate, apiUrl, returnFunc, formAsyncStr )

		var peList = AggrDataUtil.getPeListFromDateStr( dataPeriods );

		var queryUrl_delete = apiUrl + 'dataValueSets?importStrategy=DELETE';
		AggrDataUtil.changeData ( deListObj, peList, ouid, queryUrl_delete, msgText, returnSuccess, returnFailure, formAsyncStr );
	}, formAsyncStr );
};


AggrDataUtil.deleteData24Pe = function( deListObj, ouid, period, apiUrl, msgText, returnSuccess, returnFailure )
{
	var peList = AggrDataUtil.getPeList_Next24Pe( period );

	var queryUrl_delete = apiUrl + 'dataValueSets?importStrategy=DELETE';
	AggrDataUtil.changeData ( deListObj, peList, ouid, queryUrl_delete, msgText );	
};

AggrDataUtil.addData24Pe = function( deListObj, ouid, period, apiUrl, msgText, returnSuccess, returnFailure )
{
	var peList = AggrDataUtil.getPeList_Next24Pe( period );

	var queryUrl_addUpdate = apiUrl + 'dataValueSets?importStrategy=CREATE_AND_UPDATE';
	AggrDataUtil.changeData( deListObj, peList, ouid, queryUrl_addUpdate, msgText, returnSuccess, returnFailure );
};

AggrDataUtil.addData_withPeDataList = function( periodListDataObj, ouid, apiUrl, msgText, returnSuccess, returnFailure )
{
	var queryUrl_addUpdate = apiUrl + 'dataValueSets?importStrategy=CREATE_AND_UPDATE';
	AggrDataUtil.changeData_WithPeDataList( periodListDataObj, ouid, queryUrl_addUpdate, msgText, returnSuccess, returnFailure );
};


// -----------------------------------------------

AggrDataUtil.retrieveDataSearchPeriods = function( ouid, formType, form20Id, startDate, endDate, apiUrl, returnFunc, formAsyncStr )
{
	var sqlViewId = "";
	var tailCondition = "";

	if ( formType === "11" ) sqlViewId = AggrDataUtil._sqlViewId_DataSearch_Form11;
	else if ( formType === "12" ) sqlViewId = AggrDataUtil._sqlViewId_DataSearch_Form12;
	else if ( formType === "20" ) 
	{
		sqlViewId = AggrDataUtil._sqlViewId_DataSearch_Form20;
		if ( !form20Id ) form20Id = '';  // case of error - being undefined..
		tailCondition = '&var=prgid:' + form20Id;
	}

	var queryUrl = apiUrl + 'sqlViews/' + sqlViewId 
		+ '/data.json?var=ouid:' + ouid
		+ '&var=startDate:' + startDate
		+ '&var=endDate:' + endDate 
		+ tailCondition;
	
	// Retrieve SQLView data
	var retrieveFunc = ( formAsyncStr && formAsyncStr === 'formAsync' ) ? RESTUtil.retreiveData_Asynch : RESTUtil.retreiveData_Synch;

	retrieveFunc( queryUrl, function( json_SqlViewData )	
	{
		var returnList = [];
		var sqlRowsData = ( json_SqlViewData !== undefined ) ? json_SqlViewData.rows : [];

		for( var i = 0; i < sqlRowsData.length; i++ )
		{
			var data = sqlRowsData[i];
			returnList.push( data[0] );
		}
		
		returnFunc( returnList );
	});	
};


AggrDataUtil.changeData = function( deListObj, peList, ouid, queryUrl, msgText, returnSuccess, returnFailure, formAsyncStr )
{
	var jsonData = [];
	var hasFailure = false;

	for ( var i = 0; i < peList.length; i++ )
	{
		var pe = peList[i];

		for ( var deid in deListObj )
		{
			var defaultVal = deListObj[ deid ];
			jsonData.push( Util.composeDataValueJson( deid, pe, ouid, defaultVal ) );
		}

		// send around 100 data on each..
		if ( jsonData.length > 100 )
		{
			AggrDataUtil.submitDataValueSet( ouid, jsonData, queryUrl, msgText, function() {}, function() { hasFailure = true }, formAsyncStr );
			jsonData = [];
		}
	}

	if ( jsonData.length > 0 ) AggrDataUtil.submitDataValueSet( ouid, jsonData, queryUrl, msgText, function() {}, function() { hasFailure = true }, formAsyncStr );	


	if ( !hasFailure )
	{
		if ( !formAsyncStr && _logLevel && _logLevel >= 1 ) Util.ConsoleLog( '<br>--- ' + msgText + ', OU: ' + ouid + ', Success' );

		if ( returnSuccess ) returnSuccess();
	}
	else
	{
		Util.ConsoleLog( '<br>--- ' + msgText + ', OU: ' + ouid + ', FAILED!!' );

		if ( returnFailure ) returnFailure();
	}
};


AggrDataUtil.changeData_WithPeDataList = function( periodListDataObj, ouid, queryUrl, msgText, returnSuccess, returnFailure )
{
	var jsonData = [];
	var hasFailure = false;

	for ( var pe in periodListDataObj )
	{
		var periodDataObj = periodListDataObj[ pe ];

		for ( var deid in periodDataObj )
		{
			var val = periodDataObj[ deid ];
			jsonData.push( Util.composeDataValueJson( deid, pe, ouid, val ) );
		}
		
		// send around 100 data on each..
		if ( jsonData.length > 100 )
		{
			AggrDataUtil.submitDataValueSet( ouid, jsonData, queryUrl, msgText, function() {}, function() { hasFailure = true } );
			jsonData = [];
		}
	}


	if ( jsonData.length > 0 ) AggrDataUtil.submitDataValueSet( ouid, jsonData, queryUrl, msgText, function() {}, function() { hasFailure = true }  );	


	if ( !hasFailure )
	{
		if ( _logLevel && _logLevel >= 1 ) Util.ConsoleLog( '<br>--- ' + msgText + ', OU: ' + ouid + ', Success' );

		if ( returnSuccess ) returnSuccess();
	}
	else
	{
		Util.ConsoleLog( '<br>--- ' + msgText + ', OU: ' + ouid + ', FAILED!!' );

		if ( returnFailure ) returnFailure();
	}	
};


// =================================================

AggrDataUtil.submitDataValueSet = function( ouid, jsonData, queryUrl, msgText, returnSuccess, returnFailure, formAsyncStr )
{
	var submitFunc = ( formAsyncStr && formAsyncStr === 'formAsync' ) ? RESTUtil.submitData_Asynch : RESTUtil.submitData_Synch;

	submitFunc( "post", queryUrl, { "dataValues" : jsonData }, returnSuccess, returnFailure );
}

AggrDataUtil.getPeList_Next24Pe = function( period )
{
	var peList = [];

	for ( i = 0; i < G_VAR.numMonthsCopy; i++ )
	{
		peList.push( Util.generateNextPeriodCode( period, i ) );
	}

	return peList;
}

AggrDataUtil.getPeListFromDateStr = function( dataPeriods )
{
	var peList = [];

	for ( i = 0; i < dataPeriods.length; i++ )
	{
		var pe = Util.generateCurPeriodFromStr( dataPeriods[i] );
		peList.push( pe );
	}

	return peList;
};

				
//me.submitDataValueSet = function( jsonData )
// 			var queryUrl_dataValueSet = me._queryURL_api + 'dataValueSets';

AggrDataUtil.submitDataValueSet_Async = function( jsonData, queryUrl, returnSuccess, returnFailure )
{
	// console.log( 'AggrDataUtil.submitDataValueSet_Async: jqueryUrl : ' +  queryUrl + 'dataValueSets' + ', jsonData: ' + JSON.stringify( jsonData) );
	var queryUrl_dataValSet = queryUrl + 'dataValueSets';

	RESTUtil.submitData_Async( 'POST', queryUrl_dataValSet, jsonData, function( response ) {		

		if ( response && response.status && response.status === 'SUCCESS' )
		{
			console.log( 'SUCCESS - Bulk DataValues via dataValueSets Submitted. ' );
			if ( returnSuccess ) returnSuccess();						
		}
		else
		{
			console.log( 'FAILED - Bulk DataValues Submit Failed' );	
			if ( returnFailure ) returnFailure();	
		}
	}, function() {
		console.log( 'FAILED - Bulk DataValues Submit Failed' );	
		if ( returnFailure ) returnFailure();
	});	
};

AggrDataUtil.submitDataValueSet_Sync = function( jsonData, queryUrl, returnSuccess, returnFailure )
{
	var queryUrl_dataValSet = queryUrl + 'dataValueSets';

	RESTUtil.submitData_Async( 'POST', queryUrl_dataValSet, jsonData, function( response ) 
	{		
		if ( response && response.status && response.status === 'SUCCESS' )
		{
			console.log( 'SUCCESS - Bulk DataValues via dataValueSets Submitted. ' );
			if ( returnSuccess ) returnSuccess();						
		}
		else
		{
			console.log( 'FAILED - Bulk DataValues Submit Failed' );	
			if ( returnFailure ) returnFailure();	
		}
	}, function() {
		console.log( 'FAILED - Bulk DataValues Submit Failed' );	
		if ( returnFailure ) returnFailure();
	});	
};

// Should have 'Async' and 'Sync' version..
AggrDataUtil.saveStatusDataValue = function( eventDate, deId, ouId, value, url, syncStr )
{
	var json_structuredList = [];
	var curPeriod = Util.generateEventPeriod( eventDate );
	for ( i = 0; i < G_VAR.numMonthsCopy; i++ )
	{
		var peId = Util.getAddedMonthStr( curPeriod, i );
		var dataValue = Util.composeDataValueJson( deId, peId, ouId, value );
		json_structuredList.push( dataValue );
		// me.saveMonthlyDataValue( deId, peId, ouId, value );
	}
	
	var jsonList = { "dataValues" : json_structuredList };

	if ( syncStr && syncStr === 'Sync' ) AggrDataUtil.submitDataValueSet_Sync( jsonList, url );
	else AggrDataUtil.submitDataValueSet_Async( jsonList, url );
};

AggrDataUtil.matchAndSave_DataValue = function( eventDate, ouId, deId, deId2, url )
{
	var value = ( deId === deId2 ) ? "1" : "0";

	AggrDataUtil.saveStatusDataValue( eventDate, deId, ouId, value, url );		
};

// ----------------------------------------------------

// ------------------------------------------------
// --- EventDataUtil Class -------------------------
// app.updateEvent --> updateEventDataValue, added 'apiUrl' param
EventDataUtil.updateEventDataValue = function( eventId, apiUrl, updateDeList )
{
	var queryUrl = apiUrl + 'events/' + eventId;

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
						if ( _logLevel && _logLevel >= 2 ) Util.ConsoleLog( '<br>-- Event Updated: ' + eventId );	
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
};

EventDataUtil.retrieveEventsDesc = function( ouId, programId, stageId, apiUrl, returnFunc )
{
	var eventList;

	// Sorting does not work with paging, thus, we can not get just one..  
	// <-- might consider using SQLVIEW for this..
	var url = apiUrl + "events.json?program=" + programId + "&stage=" + stageId + "&orgUnit=" + ouId 
	+ "&fields=event,eventDate,dataValues[dataElement,value]" 
	+ "&skipPaging=true&order=eventDate:DESC";
	//"&totalPages=true&page=1&order=eventDate:DESC";  // &pageSize=2  <-- Setting this somehow breaks the ordering.

	RESTUtil.retrieveData_Async( url, function( response ) {
		eventList = response.events;
	}
	, function() {}
	, function() {
		returnFunc( eventList );
	});
};

EventDataUtil.getStatusCodeFromSubStatus = function( subStatusCode )
{
	var statusCode = '';

	if ( subStatusCode )
	{
		if ( subStatusCode.length == 2 )
		{
			statusCode = subStatusCode.substring(0, 1);
		}
		else
		{
			statusCode = subStatusCode;
		}
	}

	return statusCode;
};

// ---------------------------------------------------
// ------ MSI Status Log ------------------------

function MSIStatusLog( segObj )
{
	var me = this;

	me.segObj = segObj;
	
	me.misStatusLogDivTag = $("#misStatusLogDiv");
	me.loadingDivTag = $("#loadingDiv");		
	
	me._queryURL_api = "../api/";
	me._queryUrl_dataValueSet = me._queryURL_api + 'dataValueSets';
	
	me.statusList = [];
	me.curEventDate = "";
	me.currentEvent;
	me.latestEvent;
	me.lastEvent;
	me.eventList;
	me.caseType = "";
	me.formDisabled = false;

	me.previousStatusInputTag = $( '#qofz8VA3rt4-k95lcIlS4bv-val' );
	me.daysFromPreviousStatusInputTag = $( '#qofz8VA3rt4-UrD7yr6JLEf-val' );
	
	me.eventDateTag = angular.element("[input-field-id='eventDate']");
	me.updateEventBtnTag = $('button').parent().find("[ng-click='updateEvent()']");
	me.addEvent1BtnTag = $('button').parent().find("[ng-click='addEvent(true)']");
	me.addEvent2BtnTag = $('button').parent().find("[ng-click='addEvent()']");
				
					
	me.newStatusClassName = ".newStatus";
	me.previousStatusClassName = ".previousStatus";
	me.daysSincePrevClassName = ".daysSincePrev"; 


	// ====================================================

	me.init = function()
	{
		me.misStatusLogDivTag.hide();
		me.loadingDivTag.show();
		me.loadInitData();
	};
			
	me.setUp_Events = function()
	{
		me.updateEventBtnTag.click( function(e){
			//e.preventDefault();

			me.saveDataValuesAndUpdateOuGroups( "UPDATE" );
		});
		
		me.addEvent1BtnTag.click( function(){
			me.saveDataValuesAndUpdateOuGroups( "NEW" );
		});
		
		me.addEvent2BtnTag.click( function(){
			me.saveDataValuesAndUpdateOuGroups( "NEW" );
		});
		
		me.eventDateTag.change( function(e){
			// After the form is loaded, changing the event date.
			// Will not trigger on NEW event - first date selection.

			e.preventDefault();	
			
			var dateValid = me.checkCurrentEventDate( $(this).val(), me.curEventDate );
			
			me.disableEventBtn( me.formDisabled || !dateValid );


			if ( me.caseType === "NEW" || me.caseType === "LATEST" ) 
			{
				me.setDaysSincePrev( me.lastEvent, me.currentEvent );
			}

		});
		
	};
	
	me.checkCurrentEventDate = function( eventDate, lastEventDate )
	{
		var eventDateCheck = false;

		if( lastEventDate != "" && eventDate < lastEventDate )
		{
			eventDateCheck = false;
			$(".eventDateWarnMsg").show();
		}
		else
		{
			eventDateCheck = true;
			$(".eventDateWarnMsg").hide();
		}

		return eventDateCheck;
	};

	
	me.disableEventBtn = function( disabled )
	{
		Util.disableTag( me.updateEventBtnTag, disabled );
		Util.disableTag( me.addEvent1BtnTag, disabled );
		Util.disableTag( me.addEvent2BtnTag, disabled );
	};
	
	// -------------------------------------------------------------------------
	// Get Current status - This is the "Status" data value of latest event
	// -------------------------------------------------------------------------
	
	me.loadInitData = function()
	{
		me.currentEvent = angular.element("form").scope().currentEvent;

		var queryUrl = me._queryURL_api + "dataElements/" + M_UID.EVENT_DE_STATUS + ".json?fields=optionSet[options[code,name]]";

		RESTUtil.retrieveData_Async( queryUrl, function( response ) {
			me.statusCodeOptions = {};
			me.statusNameOptions = {};
			var options = response.optionSet.options;
			for( var i in options )
			{
				var option = options[i];
				me.statusCodeOptions[option.code] = option.name;
				me.statusNameOptions[option.name] = option.code;
			}
		}
		, function() {			
		}, function() {
			me.getCurrentStatus( function() 
			{
				// me.daysFromPreviousStatusInputTag.focus();
				// angular.element(me.newStatusClassName).click();
			});
		});
	}

	// -------------------------------------------------------------------------
	// Get Current status - This is the "Status" data value of latest event
	// -------------------------------------------------------------------------

	me.getCurrentStatus = function( returnFunc )
	{
		var ouId = angular.element($("#orgUnitTree .selected")).closest('li').attr('id').replace('orgUnit','')

		var url = me._queryURL_api + "events.json?program=" + M_UID.PROGRAM_ID_STATUS + "&stage=" + M_UID.STAGE_ID_STATUS + "&orgUnit=" + ouId + "&fields=event,eventDate,dataValues[dataElement,value]" + "&skipPaging=true&order=eventDate:DESC";
		// Not using paging due to 'Months Since joining' needing to check all data.

		//"&totalPages=true&page=1&order=eventDate:DESC";
		// &pageSize=2  <-- Setting this somehow breaks the ordering.
		// <-- 

		$.ajax(
		{
			type: "GET"
			,url: url
			,beforeSend: function( xhr ) {
				// Progress/Loading Bar?  Hide the main section?
			}
			,success: function( response ) 
			{
				me.curEventDate = "";
				me.caseType = "";
				me.formDisabled = false;
				me.eventList = response.events;

				// NOTE: It might be useful to add current form entry data into the eventList
				//		Otherwise, we should name it 'prevEventList'
				if( me.eventList.length > 0 )
				{
					// STEP 1. Get latest event AND previous of latest event
					var latestEvent = me.eventList[0];
					me.latestEvent = latestEvent;

					var prevEvent = ( me.eventList.length > 1 ) ? me.eventList[1] : undefined;

					me.caseType = me.getCaseType( me.currentEvent, latestEvent );					
					
					// STEP 1. Get Last Event based on caseType
					me.lastEvent = me.getLastEvent( me.caseType, latestEvent, prevEvent );


					// STEP 2. Disable/Enable Form
					me.formDisabled = ( me.caseType === "OLD" );
					me.disableForm( me.formDisabled );

											
					// STEP 3. Set status list for combo box
					me.setStatusList( latestEvent, prevEvent );
					

					// STEP 4. Get CurEventDate
					me.curEventDate = me.getCurEventDate( me.caseType, latestEvent, prevEvent );


					// STEP 5. Setup the DateValidation Message
					me.setUpEventDateValidation( me.eventDateTag, $(".eventDateWarnMsg"), me.curEventDate );
					

					// STEP 6. Perform Event Date Validation
					var dateValid = me.checkCurrentEventDate( me.eventDateTag.val(), me.curEventDate );

					me.disableEventBtn( me.formDisabled || !dateValid );


					// STEP 7. New Event Case - if previous event exists, update the 'previous status' and 'days since previous status'
					if ( me.caseType === "NEW" || me.caseType === "LATEST" ) 
					{
						if ( me.caseType === "NEW" )
						{
							me.setPreviousStatus( me.lastEvent, angular.element( me.previousStatusClassName ).scope().$select );
						}

						me.setDaysSincePrev( me.lastEvent, me.currentEvent );
					}

				}
				else
				{
					// New First Event Case
					me.caseType = "NEW";
					me.disableEventBtn( false );
				}
				
				me.afterLoadedInitData();

				returnFunc();
			}
		//}).done( function( data ) {
		//	me.misStatusLogDivTag.show();
		});
	};

	me.getCaseType = function( currentEvent, latestEvent )
	{
		var caseType = "";

		if ( currentEvent.event === "SINGLE_EVENT" ) caseType = "NEW";
		else if ( currentEvent.event === latestEvent.event ) caseType = "LATEST";
		else caseType = "OLD";

		return caseType;
	}


	me.getLastEvent = function( caseType, latestEvent, prevEvent )
	{
		var lastEvent;

		if ( caseType === "NEW" ) lastEvent = latestEvent;
		else if ( caseType === "LATEST" ) lastEvent = prevEvent;

		return lastEvent;
	}
	
	me.getCurEventDate = function( caseType, latestEvent, prevEvent )
	{
		var curEventDate = "";

		// Get current event date
		if ( caseType === "NEW" )
		{
			curEventDate = latestEvent.eventDate.substring( 0, 10 );
		}
		else if( caseType === "LATEST" && prevEvent !== undefined ) 
		{
			// In 'Update' case, get the date from 'prev' event, not latest event.
			curEventDate = prevEvent.eventDate.substring( 0, 10 );
		}

		return curEventDate;
	}
		
	me.setUpEventDateValidation = function( eventDateTag, eventDateWarnMsgTag, curEventDate )
	{
		eventDateTag.parent().find("span.eventDateWarnMsg").remove();
		
		eventDateTag.parent().append("<span class='eventDateWarnMsg' style='font-style: italic;color: red;'>Only allow a date on/after " + curEventDate + "</span>");

		eventDateWarnMsgTag.hide();
	}


	me.setPreviousStatus = function( latestEvent, prevStatusSelectObj )
	{
		if ( latestEvent !== undefined )
		{
			me.selectByCode( prevStatusSelectObj, me.getStatusCode( latestEvent ) );
		}
	}

	me.setDaysSincePrev = function( latestEvent, currentEvent )
	{
		if ( latestEvent !== undefined )
		{
			var latestEventDate = Util.getDate_FromYYYYMMDD( latestEvent.eventDate );

			var currentEventDate = Util.getDate_FromYYYYMMDD( currentEvent.eventDate );

			var dateDiff = Util.getDateDiff( currentEventDate, latestEventDate );

			me.daysFromPreviousStatusInputTag.val( dateDiff ).change();
		}
	}

	// ----------------

	me.afterLoadedInitData = function()
	{
		me.setUp_Events();
		me.loadingDivTag.hide();
		me.misStatusLogDivTag.show();
		me.setReadOnlyOnes();
	}
	
	me.setStatusList = function( latestEvent, prevEvent )
	{						
		// STEP 0. Get all of status options
		if( me.statusList.length == 0 ){
			me.statusList = angular.element(me.newStatusClassName).scope().$select.items;
		}


		// STEP 1. Get and set latest status
		var curStatusCode = me.getStatusCode( latestEvent );

		
		// STEP 2. Add all status for STATUS combo-box when the form is open
		angular.element(me.newStatusClassName).scope().$select.items = me.statusList;
		var items = angular.element(me.newStatusClassName).scope().$select.items;
		
		// STEP 3. Set the status list belongs to the latest event / prev event
		
		// STEP 3.1 For new event, remove current status option from the status-list
		if( me.currentEvent.event === "SINGLE_EVENT" ) 
		{
			Util.removeItemFromList( items, "code", curStatusCode );
			
			if( curStatusCode != M_UID.STATUS_CODE_OnBoarding ){
				Util.removeItemFromList( items, "code", M_UID.STATUS_CODE_OnBoarding );
			}
		}
		// STEP 3.2 For latest event, based on the prevEvent to generate the status list
		else if( me.currentEvent.event == latestEvent.event && prevEvent !== undefined )
		{
			var statusCode = me.getStatusCode( prevEvent );
			
			Util.removeItemFromList( items, "code", statusCode );
			if( statusCode !== M_UID.STATUS_CODE_OnBoarding ){
				Util.removeItemFromList( items, "code", M_UID.STATUS_CODE_OnBoarding );
			}
		}				
	};
	
	me.getStatusCode = function( event )
	{
		return ( ( event ) ? Util.getDataValueByDeId( event.dataValues, M_UID.EVENT_DE_STATUS ) : "" );
	};
	
	me.selectByCode = function( selectionObj, code )
	{						
		selectionObj.select( Util.findItemFromList( selectionObj.items, "code", code ) );
	}

	me.disableForm = function( disabled )
	{
		//angular.element("form").find("input,select,textarea").attr("disabled", disabled );

		angular.element("form").find("input,select,textarea").not( me.previousStatusClassName + "," + me.daysSincePrevClassName ).attr("disabled", disabled );

		var statusTag = angular.element( me.newStatusClassName );
		statusTag.scope().$select.disabled = disabled;
		if( disabled ) me.setUi_SelectDisable( statusTag );

		// Disable Event Buttons if disabled. - Later, event date check will perform another check to disable the event button.
		me.disableEventBtn( disabled );
	};


	me.setReadOnlyOnes = function()
	{
		// Always disable 'previousStatus' and 'daysSincePrev'
		var prevStatusTag = angular.element( me.previousStatusClassName );
		prevStatusTag.scope().$select.disabled = true;
		me.setUi_SelectReadOnly( prevStatusTag );

		var daysSinceTag = angular.element( me.daysSincePrevClassName ).attr("disabled", true );
		me.setUi_InputDisable( daysSinceTag );			
	}


	me.setUi_SelectDisable = function( tag )
	{
		tag.find("a").css("background-color", "#f4f4f4");
		tag.find("a").css("border", "1px solid #ddd");
		tag.find("span.select2-arrow").find("b").css("background-color", "#ccc");
		tag.find( "abbr" ).hide();
	}

	me.setUi_SelectReadOnly = function( tag )
	{
		tag.find( "a" ).css( "background-color", "White" );
		tag.find( "a" ).css( "border", "none" );
		tag.find( "span.select2-arrow" ).hide();
		tag.find( "abbr" ).hide();
	}

	me.setUi_InputDisable = function( tag )
	{
		//tag.css("background-color", "#f4f4f4");
		tag.css("border", "none");
	}


	// -------------------------------------------------------------------------
	// Save aggregate data in next G_VAR.numMonthsCopy months
	// -------------------------------------------------------------------------
	
	me.saveDataValuesAndUpdateOuGroups = function( type )
	{

		// STEP 1. Get the orgUnit Id of selected event
		var ouId = me.currentEvent.orgUnit;
		if( ouId == undefined )
		{
			ouId = angular.element($("#orgUnitTree .selected")).closest('li').attr('id').replace('orgUnit','');
		}
		

		// STEP 2. Check for RollBack Prev Event Case (on jump months)
		// If event's date is changed into future months
		var prevRollBackCase = me.checkRollBackCase( type, me.latestEvent, me.eventDateTag.val() );
		
				
		// STEP 3. Save aggregate data values and add the event orgUnit in to the orgUnit group
		var curEventStatusName = me.currentEvent[M_UID.EVENT_DE_STATUS];
		var curEventStatusCode = ( curEventStatusName ) ? me.statusNameOptions[curEventStatusName] : "";


		// STEP 4. Run the saving/updating - of dataValues and OU Groups
		if ( prevRollBackCase )
		{
			// Run 'LastEvent' which is 'PrevEvent', and then, run 'CurrentEvent'
			if ( me.lastEvent ) me.saveDataValuesAndUpdateOuGroups_Inner( me.lastEvent.eventDate, me.getStatusCode( me.lastEvent ), ouId );
			
			if ( curEventStatusCode ) me.saveDataValuesAndUpdateOuGroups_Inner( me.currentEvent.eventDate, curEventStatusCode, ouId );
		}
		else
		{
			// Run 'CurrentEvent'
			if ( curEventStatusCode ) me.saveDataValuesAndUpdateOuGroups_Inner( me.currentEvent.eventDate, curEventStatusCode, ouId );
		}
	};
	

	me.checkRollBackCase = function( type, latestEvent, eventDateStr )
	{
		var rollBackCase = false; 

		// Type is 'UPDATE' case and date has changed
		// and changed date is future months (not past and current)
		if ( type === "UPDATE" && me.latestEvent )
		{				
			var previousDateStr = me.latestEvent.eventDate.substring(0, 10);
			var newDateStr = me.eventDateTag.val();
		
			if ( previousDateStr != newDateStr 
				&& Util.monthsDiff( newDateStr, previousDateStr ) >= 1 )
			{
				console.log( "RollBack TRUE Case, Months Diff: " + Util.monthsDiff( newDateStr, previousDateStr ) + ", previousDateStr: " + previousDateStr + ", newDateStr: " + newDateStr );

				rollBackCase = true;
			}
		}

		return rollBackCase;
	};


	me.saveDataValuesAndUpdateOuGroups_Inner = function( eventDate, statusCode, ouId, noMonthsSinceUpdate )
	{
		if ( statusCode )
		{
			if( statusCode == M_UID.STATUS_CODE_OnBoarding ){ // "On boarding"
				me.saveLogStatusData( eventDate, ouId, M_UID.AGG_DE_FRANCHISEE_ON_BOARDING, M_UID.AGG_DE_NETWORK_EXCLUDED, M_UID.OUG_UID_FRANCHISEE_ON_BOARDING, M_UID.OUG_UID_NETWORK_EXCLUDED );
			}
			else if( statusCode == M_UID.STATUS_CODE_UnderContract ){ // "Under Contract"
				me.saveLogStatusData( eventDate, ouId, M_UID.AGG_DE_FRANCHISEE_UNDER_CONTACT, M_UID.AGG_DE_NETWORK_INCLUDED, M_UID.OUG_UID_FRANCHISEE_UNDER_CONTACT, M_UID.OUG_UID_NETWORK_INCLUDED );
			}
			else if( statusCode == M_UID.STATUS_CODE_Suspended ){ // "Suspended"
				me.saveLogStatusData( eventDate, ouId, M_UID.AGG_DE_FRANCHISEE_SUSPENDED, M_UID.AGG_DE_NETWORK_EXCLUDED, M_UID.OUG_UID_FRANCHISEE_SUSPENDED, M_UID.OUG_UID_NETWORK_EXCLUDED );
			}
			else if( statusCode == M_UID.STATUS_CODE_Defranchised ){ // "Defranchised"
				// If successful status change to 'Defranchised', then also perform, segmentation status change
				me.saveLogStatusData( eventDate, ouId, M_UID.AGG_DE_FRANCHISEE_DEFRANCHISED, M_UID.AGG_DE_NETWORK_EXCLUDED, M_UID.OUG_UID_FRANCHISEE_DEFRANCHISED, M_UID.OUG_UID_NETWORK_EXCLUDED );
			}
			
			var eventDate1 = eventDate.substring( 0, 19 ) ;
			
			// Save "Sticky Status - Date last change"
			AggrDataUtil.saveStatusDataValue( eventDate1, M_UID.AGG_DE_STATUS_LAST_CHANGE, ouId, eventDate1, me._queryURL_api );
			

			if ( !( noMonthsSinceUpdate && noMonthsSinceUpdate === "noMonthsSinceUpdate" ) )
			{
				// Save "Sticky Status - updated this month", 
				//      "Sticky Status - Months since last update", 
				//      "Sticky Status - Months since joining network" in G_VAR.numMonthsCopy months
				//me.saveMonthInfoData( eventDate, ouId, currStatusCode )
				me.updateMonthsSinceData( eventDate1, ouId, statusCode );
			}
		}
	}

	me.updateMonthsSinceData = function( eventDate, ouId, currStatusCode )
	{
		var json_structuredList = [];
		var curPeriod = Util.generateEventPeriod( eventDate );

		// Get previousMonths
		var prevMonthDateStr = Util.dateStrMonthChange( eventDate, -1 );
		

		// Get AggDEUid of matching months since
		var deUid_monthsSince = me.getMonthsSinceUid_FromStatusCode( currStatusCode );


		// 1. Delete Other months since 
		me.monthsSince_DelOthers( deUid_monthsSince, ouId, eventDate );
		
		
		// 2. Remove/Add for current status months since dataValues
		if ( deUid_monthsSince )
		{
			var deListObj = {};
			deListObj[ deUid_monthsSince ] = "0";

			// 2A. Delete the data (monthsSince) on previous periods
			AggrDataUtil.deleteDataBySearchDe( 'formAsync', deListObj, ouId, 'ALL', prevMonthDateStr, '11', undefined, me._queryURL_api, "Remove previous periods monthsSince case" );


			// 2B. Save the data to future periods -  add to the jsonList
			for ( i = 0; i < G_VAR.numMonthsCopy; i++ )
			{
				var peId = Util.getAddedMonthStr( curPeriod, i );
				json_structuredList.push( Util.composeDataValueJson( deUid_monthsSince, peId, ouId, i + '' ) );
				json_structuredList.push( Util.composeDataValueJson( M_UID.AGG_DE_STATUS_MONTHS_SINCE_LAST_UPDATE, peId, ouId, i + '' ) );
				json_structuredList.push( Util.composeDataValueJson( M_UID.AGG_DE_STATUS_UPDATE_THIS_MONTH, peId, ouId, Util.get10_Bool(i === 0) ) );				
			}
		}

		
		// 3. Submit the list to update..  <-- too many?  121 counts..
		var jsonList = { "dataValues" : json_structuredList };		
		AggrDataUtil.submitDataValueSet_Async( jsonList, me._queryURL_api );
	};

	
	me.getMonthsSinceUid_FromStatusCode = function( currStatusCode )
	{
		var deUid_monthsSince = "";
		if ( currStatusCode === M_UID.STATUS_CODE_UnderContract ) deUid_monthsSince = M_UID.AGG_DE_MONTHS_SINCE_JOINING_NETWORK;
		else if ( currStatusCode === M_UID.STATUS_CODE_OnBoarding ) deUid_monthsSince = M_UID.AGG_DE_MONTHS_SINCE_ONBOARDING;
		else if ( currStatusCode === M_UID.STATUS_CODE_Suspended ) deUid_monthsSince = M_UID.AGG_DE_MONTHS_SINCE_SUSPENDED;

		return deUid_monthsSince;
	};

	me.monthsSince_DelOthers = function( deUid_monthsSince, ouId, eventDate )
	{
		// 1. Delete Other months since 
		var deListObj_others = {};
		
		if ( deUid_monthsSince !== M_UID.AGG_DE_MONTHS_SINCE_JOINING_NETWORK ) deListObj_others[ M_UID.AGG_DE_MONTHS_SINCE_JOINING_NETWORK ] = "0";
		if ( deUid_monthsSince !== M_UID.AGG_DE_MONTHS_SINCE_ONBOARDING ) deListObj_others[ M_UID.AGG_DE_MONTHS_SINCE_ONBOARDING ] = "0";
		if ( deUid_monthsSince !== M_UID.AGG_DE_MONTHS_SINCE_SUSPENDED ) deListObj_others[ M_UID.AGG_DE_MONTHS_SINCE_SUSPENDED ] = "0";
	
		AggrDataUtil.deleteDataBySearchDe( 'formAsync', deListObj_others, ouId, eventDate, 'ALL', '11', undefined, me._queryURL_api, "Remove other months since future periods" );
	};	


	me.pushMonthsSince_DataValueJson = function ( json_structuredList, dateInStatus, peId, aggDeId, ouId )
	{
		if ( dateInStatus )
		{
			var value = Util.generateMonthSinceDate( dateInStatus, peId );

			var dvTemp = Util.composeDataValueJson( aggDeId, peId, ouId, value );
			
			json_structuredList.push( dvTemp );
		}
	}


	// getDateJoinedNetwork( eventList, statusCode )
	me.getLastEventDate_OfStatus = function( eventList, statusCode, currFormEvent )
	{
		var lastEventDate = "";			

		// If Form status code matches (New or Update case), use the current Form info
		if ( currFormEvent.statusCode === statusCode )
		{
			lastEventDate = currFormEvent.eventDate;
		}
		else
		{
			var event_LastContract = me.getLastEvent_InStatus( eventList, statusCode );
			if ( event_LastContract ) lastEventDate = event_LastContract.eventDate;
		}
						
		return lastEventDate;
	};

	// "UNC" - UnderContract
	//	me.getLastEvent_InStatus( eventList, "UNC" );
	me.getLastEvent_InStatus = function( eventList, statusCode )
	{
		var event_LastInStatus;

		if ( eventList )
		{
			var eventList_sorted = Util.sortByKey( eventList, "eventDate" );

			for ( i = eventList_sorted.length - 1; i >= 0; i-- )
			{
				var event = eventList_sorted[i];

				if ( me.getStatusCode( event ) === statusCode )
				{
					event_LastInStatus = event;
					break;
				}
			}
		}

		return event_LastInStatus;
	};
	
	// ------------------------------

	me.saveLogStatusData = function( eventDate, ouId, aggStatusDeId, aggNetworkDeId, ougStatusId, ougNetworkId )
	{		
		AggrDataUtil.matchAndSave_DataValue( eventDate, ouId, M_UID.AGG_DE_FRANCHISEE_ON_BOARDING, aggStatusDeId, me._queryURL_api );
		AggrDataUtil.matchAndSave_DataValue( eventDate, ouId, M_UID.AGG_DE_FRANCHISEE_UNDER_CONTACT, aggStatusDeId, me._queryURL_api );
		AggrDataUtil.matchAndSave_DataValue( eventDate, ouId, M_UID.AGG_DE_FRANCHISEE_SUSPENDED, aggStatusDeId, me._queryURL_api );
		AggrDataUtil.matchAndSave_DataValue( eventDate, ouId, M_UID.AGG_DE_FRANCHISEE_DEFRANCHISED, aggStatusDeId, me._queryURL_api );
		AggrDataUtil.matchAndSave_DataValue( eventDate, ouId, M_UID.AGG_DE_FRANCHISEE_UNKNOWN, aggStatusDeId, me._queryURL_api );

		AggrDataUtil.matchAndSave_DataValue( eventDate, ouId, M_UID.AGG_DE_NETWORK_INCLUDED, aggNetworkDeId, me._queryURL_api );
		AggrDataUtil.matchAndSave_DataValue( eventDate, ouId, M_UID.AGG_DE_NETWORK_EXCLUDED, aggNetworkDeId, me._queryURL_api );

		OUGroupUtil.matchAndJoin_OuGroup( ouId, M_UID.OUG_UID_FRANCHISEE_ON_BOARDING, ougStatusId, me._queryURL_api );
		OUGroupUtil.matchAndJoin_OuGroup( ouId, M_UID.OUG_UID_FRANCHISEE_UNDER_CONTACT, ougStatusId, me._queryURL_api );
		OUGroupUtil.matchAndJoin_OuGroup( ouId, M_UID.OUG_UID_FRANCHISEE_SUSPENDED, ougStatusId, me._queryURL_api );
		OUGroupUtil.matchAndJoin_OuGroup( ouId, M_UID.OUG_UID_FRANCHISEE_DEFRANCHISED, ougStatusId, me._queryURL_api );
		//OUGroupUtil.matchAndJoin_OuGroup( ouId, M_UID.OUG_UID_FRANCHISEE_UNKNOWN, ougStatusId );

		OUGroupUtil.matchAndJoin_OuGroup( ouId, M_UID.OUG_UID_NETWORK_INCLUDED, ougNetworkId, me._queryURL_api );			
		OUGroupUtil.matchAndJoin_OuGroup( ouId, M_UID.OUG_UID_NETWORK_EXCLUDED, ougNetworkId, me._queryURL_api );

		if ( aggStatusDeId === M_UID.AGG_DE_FRANCHISEE_DEFRANCHISED )
		{
			console.log( 'Status Defranchise Case' );

			// Segmentation 'Disenfranchise' change
			if ( me.segObj )
			{
				me.segObj.addEvent_Disenfranchise( eventDate, ouId, function() 
				{
					console.log( 'Seg Defranchised Success' );
				} );
			}
		}		
	};

	// -------------------------------------------------------------------------
	// Others
	// -------------------------------------------------------------------------
}


// ---------------------------------------------------
// ------ MSI Segmentation Log ------------------------

function MISSegLog()
{
	var me = this;
	
	me.misSegStatusLogDivTag = $("#misSegStatusLogDiv");
	me.loadingDivTag = $("#loadingDiv");	
	
	me._queryURL_api = "../api/";
	me._queryUrl_dataValueSet = me._queryURL_api + 'dataValueSets';
	me._queyrUrl_event = me._queryURL_api + 'events';

	me.statusList = [];
	me.subStatusList = [];
	
	me.curEventDate = "";
	me.currentEvent;
	me.latestEvent;
	me.lastEvent;
	me.eventList;
	me.caseType = "";
	me.formDisabled = false;

	me.eventDateTag = angular.element("[input-field-id='eventDate']");
	me.updateEventBtnTag = $('button').parent().find("[ng-click='updateEvent()']");
	me.addEvent1BtnTag = $('button').parent().find("[ng-click='addEvent(true)']");
	me.addEvent2BtnTag = $('button').parent().find("[ng-click='addEvent()']");
	me.divMsgFormMainTag = $( '#divMsgFormMain');
	
	me.daysFromPreviousStatusInputTag = $( '#qofz8VA3rt4-UrD7yr6JLEf-val' );

	me.spanNewStatusTag = $( '#spanNewStatus' );
	me.spanPreviousStatusTag = $( '#spanPreviousStatus' );

	me.newStatusClassName = ".newStatus";
	me.newSubStatusClassName = ".newSubStatus";
	me.previousStatusClassName = ".previousStatus";
	me.previousSubStatusClassName = ".previousSubStatus";

	me.daysSincePrevClassName = ".daysSincePrev"; 

	// ====================================================

	me.init = function()
	{		
		me.misSegStatusLogDivTag.hide();
		me.loadingDivTag.show();
		me.loadInitData();
	};
	
	
	me.setUp_Events = function()
	{
		$('button').parent().find("[ng-click='updateEvent()']").click( function(e){
			//e.preventDefault();
			me.saveDataValuesAndUpdateOuGroups( "UPDATE" );
		});
		
		$('button').parent().find("[ng-click='addEvent(true)']").click( function(){
			me.saveDataValuesAndUpdateOuGroups( "NEW" );
		});
		
		$('button').parent().find("[ng-click='addEvent()']").click( function(){
			me.saveDataValuesAndUpdateOuGroups( "NEW" );
		});
		
		me.eventDateTag.change( function(e){
			// After the form is loaded, changing the event date.
			// Will not trigger on NEW event - first date selection.

			e.preventDefault();	
			
			var dateValid = me.checkCurrentEventDate( $(this).val(), me.curEventDate );
			
			me.disableEventBtn( me.formDisabled || !dateValid );


			if ( me.caseType === "NEW" || me.caseType === "LATEST" ) 
			{
				me.setDaysSincePrev( me.lastEvent, me.currentEvent );
			}

		});

		// TODO: NEED TO GET ANGULAR JS CHANGE EVENT..
		$( me.newSubStatusClassName ).change( function() {
			alert( 'newSubStatus Changed' );
		});


		angular.element("[id='PsdqRrx0KbU-DwXW311h36K-val']").scope().$select.onSelectCallback = function( a ,b )
		{
			var statusCode = EventDataUtil.getStatusCodeFromSubStatus( b.$item.code );

			me.selectByCode( angular.element( me.newStatusClassName ).scope().$select, statusCode );
		};

	};
	
	me.checkCurrentEventDate = function( eventDate, lastEventDate )
	{
		var eventDateCheck = false;

		if( lastEventDate != "" && eventDate < lastEventDate )
		{
			eventDateCheck = false;
			$(".eventDateWarnMsg").show();
		}
		else
		{
			eventDateCheck = true;
			$(".eventDateWarnMsg").hide();
		}

		return eventDateCheck;
	};

	
	me.disableEventBtn = function( disabled )
	{
		Util.disableTag( me.updateEventBtnTag, disabled );
		Util.disableTag( me.addEvent1BtnTag, disabled );
		Util.disableTag( me.addEvent2BtnTag, disabled );
	};
	
	// -------------------------------------------------------------------------
	// Get Current status - This is the "Status" data value of latest event
	// -------------------------------------------------------------------------
	
	me.loadInitData = function()
	{
		// Clear Data?
		me.spanNewStatusTag.text( '' );
		me.spanPreviousStatusTag.text( '' );


		// Get current Event and populate status
		me.currentEvent = angular.element("form").scope().currentEvent;

		// Populate the Status ( New and Previous)
		if ( me.currentEvent[ M_UID.EVENT_DE_SEGMENTATION_PREVIOUS ] ) me.spanPreviousStatusTag.text( '| ' + me.currentEvent[ M_UID.EVENT_DE_SEGMENTATION_PREVIOUS ] );
		if ( me.currentEvent[ M_UID.EVENT_DE_SEGMENTATION ] ) me.spanNewStatusTag.text( '| ' + me.currentEvent[ M_UID.EVENT_DE_SEGMENTATION ] );
		
		var queyrUrl = me._queryURL_api + "dataElements/" + M_UID.EVENT_DE_SEGMENTATION_SUB + ".json?fields=optionSet[options[code,name]]";
		$.ajax(
		{
			type: "GET"
			,url: queyrUrl
			,success: function( response ) 
			{
				me.statusCodeOptions = {};
				me.statusNameOptions = {};
				var options = response.optionSet.options;
				for( var i in options )
				{
					var option = options[i];
					me.statusCodeOptions[option.code] = option.name;
					me.statusNameOptions[option.name] = option.code;
				}
			}
		}).done( function() {
			me.getCurrentStatus( function() 
			{
				// me.daysFromPreviousStatusInputTag.focus();
				// angular.element(me.newStatusClassName).click();
			});
		});
	};

	// -------------------------------------------------------------------------
	// Get Current status - This is the "Status" data value of latest event
	// -------------------------------------------------------------------------

	me.getCurrentStatus = function( returnFunc )
	{
		var ouId = angular.element($("#orgUnitTree .selected")).closest('li').attr('id').replace('orgUnit','')

		var segEventsUrl = me._queryURL_api + "events.json?program=" + M_UID.PROGRAM_ID_SEG + "&stage=" + M_UID.STAGE_ID_SEG + "&orgUnit=" + ouId 
		+ "&fields=event,eventDate,dataValues[dataElement,value]" 
		+ "&skipPaging=true&order=eventDate:DESC";

		RESTUtil.retrieveData( segEventsUrl, function( response )
		{
			me.checkLastStatusDefranchised( ouId, function( statusDefranchised ) 
			{
				me.curEventDate = "";
				me.caseType = "";
				me.formDisabled = false;
				me.eventList = response.events;
				var dateValid = false;


				if( me.eventList.length > 0 )
				{
					// STEP 1. Get latest event AND previous of latest event
					var latestEvent = me.eventList[0];
					me.latestEvent = latestEvent;
					var prevEvent = ( me.eventList.length > 1 ) ? me.eventList[1] : undefined;
					me.caseType = me.getCaseType( me.currentEvent, latestEvent );					
					

					// STEP 2. Get Last Event based on caseType
					me.lastEvent = me.getLastEvent( me.caseType, latestEvent, prevEvent );


					// STEP 3. Get CurEventDate
					me.curEventDate = me.getCurEventDate( me.caseType, latestEvent, prevEvent );


					// STEP 4. Setup the DateValidation Message
					me.setUpEventDateValidation( me.eventDateTag, $(".eventDateWarnMsg"), me.curEventDate );
					

					// STEP 5. Perform Event Date Validation
					dateValid = me.checkCurrentEventDate( me.eventDateTag.val(), me.curEventDate );


					// STEP 7. New Event Case - if previous event exists, update the 'previous status' and 'days since previous status'
					if ( me.caseType === "NEW" || me.caseType === "LATEST" ) 
					{
						if ( me.caseType === "NEW" )
						{
							me.setPreviousSubStatus( me.lastEvent, angular.element( me.previousSubStatusClassName ).scope().$select, me.spanPreviousStatusTag );												
							//me.setPreviousStatus( me.lastEvent, angular.element( me.previousStatusClassName ).scope().$select );
						}

						me.setDaysSincePrev( me.lastEvent, me.currentEvent );
					}
				}
				else
				{
					// New First Event Case <-- even new, we need to disable it if...						
					dateValid = true;
					me.caseType = "NEW";
				}


				// Disable/Enable form depending on case - and set segm choise if enabled case
				me.formDisabled = me.disableForm( me.caseType, statusDefranchised, dateValid );

				me.afterLoadedInitData();

				returnFunc();

			});
		}, function() {				
		}, function()
		{
			me.misSegStatusLogDivTag.show();
		});
	};


	me.checkLastStatusDefranchised = function( ouId, returnFunc )
	{
		me.retrieveStatusEvents( ouId, function( events )
		{
			var isDefranchised = false;
			if ( events && events.length > 0 )
			{
				var lastStatusEvent = events[ 0 ]; // since in desc order

				var statusCode = Util.getDataValueByDeId( lastStatusEvent.dataValues, M_UID.EVENT_DE_STATUS );

				isDefranchised = ( statusCode === M_UID.STATUS_CODE_Defranchised );
			}

			returnFunc( isDefranchised );
		});			
	}


	me.retrieveStatusEvents	= function( ouId, returnFunc )
	{
		var url = me._queryURL_api + "events.json?program=" + M_UID.PROGRAM_ID_STATUS 
		+ "&stage=" + M_UID.STAGE_ID_STATUS + "&orgUnit=" + ouId 
		+ "&fields=event,eventDate,dataValues[dataElement,value]" 
		+ "&skipPaging=true&order=eventDate:DESC";

		RESTUtil.retrieveData( url, function( response )
		{
			returnFunc( response.events );
		}, function() {
		}, function() {				
		});			
	}

	me.setStatusList = function( formDisabled )
	{	
		if ( !formDisabled )
		{
			// STEP 0. Get all of status options
			if( me.statusList.length == 0 ){
				me.statusList = angular.element(me.newStatusClassName).scope().$select.items;
			}
			
			// STEP 2. Add all status for STATUS combo-box when the form is open
			angular.element(me.newStatusClassName).scope().$select.items = me.statusList;
			var items = angular.element(me.newStatusClassName).scope().$select.items;

			Util.removeItemFromList( items, "code", M_UID.SEGMENTATION_CODE_DISENFRANCHISE );			
		}
	};

	me.setSubStatusList = function( formDisabled )
	{	
		if ( !formDisabled )
		{
			// STEP 0. Get all of status options
			if( me.subStatusList.length == 0 ){
				me.subStatusList = angular.element(me.newSubStatusClassName).scope().$select.items;
			}
			
			// STEP 2. Add all status for STATUS combo-box when the form is open
			angular.element(me.newSubStatusClassName).scope().$select.items = me.subStatusList;
			var items = angular.element(me.newSubStatusClassName).scope().$select.items;

			Util.removeItemFromList( items, "code", M_UID.SEGMENTATION_CODE_DISENFRANCHISE );			
		}
	};

	me.getCaseType = function( currentEvent, latestEvent )
	{
		var caseType = "";

		if ( currentEvent.event === "SINGLE_EVENT" ) caseType = "NEW";
		else if ( currentEvent.event === latestEvent.event ) caseType = "LATEST";
		else caseType = "OLD";

		return caseType;
	}


	me.getLastEvent = function( caseType, latestEvent, prevEvent )
	{
		var lastEvent;

		if ( caseType === "NEW" ) lastEvent = latestEvent;
		else if ( caseType === "LATEST" ) lastEvent = prevEvent;

		return lastEvent;
	}
	
	me.getCurEventDate = function( caseType, latestEvent, prevEvent )
	{
		var curEventDate = "";

		// Get current event date
		if ( caseType === "NEW" )
		{
			curEventDate = latestEvent.eventDate.substring( 0, 10 );
		}
		else if( caseType === "LATEST" && prevEvent !== undefined ) 
		{
			// In 'Update' case, get the date from 'prev' event, not latest event.
			curEventDate = prevEvent.eventDate.substring( 0, 10 );
		}

		return curEventDate;
	}
		
	me.setUpEventDateValidation = function( eventDateTag, eventDateWarnMsgTag, curEventDate )
	{
		eventDateTag.parent().find("span.eventDateWarnMsg").remove();
		
		eventDateTag.parent().append("<span class='eventDateWarnMsg' style='font-style: italic;color: red;'>Only allow a date on/after " + curEventDate + "</span>");

		eventDateWarnMsgTag.hide();
	}


	me.setPreviousStatus = function( latestEvent, prevStatusSelectObj )
	{
		if ( latestEvent !== undefined )
		{
			me.selectByCode( prevStatusSelectObj, me.getStatusCode( latestEvent ) );
		}
	}

	me.setPreviousSubStatus = function( latestEvent, prevSubStatusSelectObj, spanPreviousStatusTag )
	{
		if ( latestEvent !== undefined )
		{
			var subStatusCode = me.getSubStatusCode( latestEvent );
			var statusCode = me.getStatusCode( latestEvent );
			
			me.selectByCode( prevSubStatusSelectObj, subStatusCode );
			
			//var statusCode = EventDataUtil.getStatusCodeFromSubStatus( subStatusCode );

			if ( statusCode ) 
			{
				spanPreviousStatusTag.text( '| ' + statusCode ); 				
				me.selectByCode( angular.element( me.previousStatusClassName ).scope().$select, statusCode );								
			}
		}
	}

	me.setDaysSincePrev = function( latestEvent, currentEvent )
	{
		if ( latestEvent !== undefined )
		{
			var latestEventDate = Util.getDate_FromYYYYMMDD( latestEvent.eventDate );

			var currentEventDate = Util.getDate_FromYYYYMMDD( currentEvent.eventDate );

			var dateDiff = Util.getDateDiff( currentEventDate, latestEventDate );

			me.daysFromPreviousStatusInputTag.val( dateDiff ).change();
		}
	}


	// ----------------
	
	me.afterLoadedInitData = function()
	{
		me.setUp_Events();
		me.loadingDivTag.hide();
		me.misSegStatusLogDivTag.show();
		me.setReadOnlyOnes();
	}

	me.getStatusCode = function( event )
	{
		return me.getEventDataVal( event, M_UID.EVENT_DE_SEGMENTATION );		
	}

	me.getSubStatusCode = function( event )
	{
		return me.getEventDataVal( event, M_UID.EVENT_DE_SEGMENTATION_SUB );		
	}

	me.getEventDataVal = function( event, deId )
	{
		var val = "";
		if( event !== undefined )
		{
			var dataValues = event.dataValues;
			for( var i in dataValues )
			{
				var dataValue = dataValues[i];
				if( dataValue.dataElement === deId )
				{
					val = dataValue.value;
				}
			}
		}
		
		return val;
	};
	
	me.selectByCode = function( selectionObj, code )
	{						
		selectionObj.select( Util.findItemFromList( selectionObj.items, "code", code ) );
	};


	me.disableForm = function( caseType, statusDefranchised, dateValid )
	{
		// 1. if status 1.1 form is in 'Defranchised' mode, disable 'new'/'update' of form 1.2
		// 2. ?? user can not delete 'disenfranchised' event? <--- does not matter..
		// 3. Display message about it <-- ... new or update both case..

		var formDisable = ( caseType === "OLD" || statusDefranchised );

		if  ( statusDefranchised ) me.divMsgFormMainTag.show().text( " *Form disabled due to Status Log in defranchised state." );


		var alwaysDisabledStr = me.previousStatusClassName + "," + me.previousSubStatusClassName + "," + me.newStatusClassName + "," + me.daysSincePrevClassName;
		angular.element("form").find("input,select,textarea").not( alwaysDisabledStr ).attr("disabled", formDisable );


		var subStatusTag = angular.element( me.newSubStatusClassName );
		subStatusTag.scope().$select.disabled = formDisable;
		if( formDisable ) me.setUi_SelectDisable( subStatusTag );

		
		// Set status list for combo box - if enabled, remove the 'disenfranchise..
		//me.setStatusList( formDisable );
		me.setSubStatusList( formDisable );
		
		// Disable Event Buttons if disabled. - Later, event date check will perform another check to disable the event button.
		me.disableEventBtn( formDisable || !dateValid );

		return formDisable;
	};


	me.setReadOnlyOnes = function()
	{
		// Always disable 'previousStatus' and 'daysSincePrev', 'previousSubStatus', 'newStatus'
		/*
		var prevStatusTag = angular.element( me.previousStatusClassName );
		prevStatusTag.scope().$select.disabled = true;
		me.setUi_SelectReadOnly( prevStatusTag );
		*/

		var prevSubStatusTag = angular.element( me.previousSubStatusClassName );
		prevSubStatusTag.scope().$select.disabled = true;
		me.setUi_SelectReadOnly( prevSubStatusTag );

		/*
		var newStatusTag = angular.element( me.newStatusClassName );
		newStatusTag.scope().$select.disabled = true;
		me.setUi_SelectReadOnly( newStatusTag );
		*/

		var daysSinceTag = angular.element( me.daysSincePrevClassName ).attr("disabled", true );
		me.setUi_InputDisable( daysSinceTag );			
	}


	me.setUi_SelectDisable = function( tag )
	{
		tag.find("a").css("background-color", "#f4f4f4");
		tag.find("a").css("border", "1px solid #ddd");
		tag.find("span.select2-arrow").find("b").css("background-color", "#ccc");
		tag.find( "abbr" ).hide();
	}

	me.setUi_SelectReadOnly = function( tag )
	{
		tag.find( "a" ).css( "background-color", "White" );
		tag.find( "a" ).css( "border", "none" );
		tag.find( "span.select2-arrow" ).hide();
		tag.find( "abbr" ).hide();

		/*
		var selectText = tag.find( "span.select2-chosen" ).text();

		if ( selectText.indexOf( "Select or search from the list" ) >= 0 )  tag.find( "span.select2-chosen" ).text( "" );
		*/
	}

	me.setUi_InputDisable = function( tag )
	{
		//tag.css("background-color", "#f4f4f4");
		tag.css("border", "none");
	}

	
	// -------------------------------------------------------------------------
	// Save aggregate data in next G_VAR.numMonthsCopy months
	// -------------------------------------------------------------------------
	
	me.saveDataValuesAndUpdateOuGroups = function( type )
	{

		// STEP 1. Get the orgUnit Id of selected event
		var ouId = me.currentEvent.orgUnit;
		if( ouId == undefined )
		{
			ouId = angular.element($("#orgUnitTree .selected")).closest('li').attr('id').replace('orgUnit','');
		}
		
		// STEP 2. Check for RollBack Prev Event Case (on jump months)
		// If event's date is changed into future months
		var prevRollBackCase = me.checkRollBackCase( type, me.latestEvent, me.eventDateTag.val() );
		

		// STEP 3. Save aggregate data values and add the event orgUnit in to the orgUnit group
		var curEventSubStatusName = me.currentEvent[M_UID.EVENT_DE_SEGMENTATION_SUB];
		var curEventSubStatusCode = ( curEventSubStatusName ) ? me.statusNameOptions[curEventSubStatusName] : "";


		// STEP 4. Run the saving/updating - of dataValues and OU Groups
		if ( prevRollBackCase )
		{		
			// Run 'LastEvent' which is 'PrevEvent', and then, run 'CurrentEvent'
			if ( me.lastEvent ) me.saveDataValuesAndUpdateOuGroups_Inner( me.lastEvent.eventDate, me.getSubStatusCode( me.lastEvent ), ouId, "noMonthsSinceUpdate" );
			
			if ( curEventSubStatusCode ) me.saveDataValuesAndUpdateOuGroups_Inner( me.currentEvent.eventDate, curEventSubStatusCode, ouId );
		}
		else
		{
			// Run 'CurrentEvent'
			if ( curEventSubStatusCode ) me.saveDataValuesAndUpdateOuGroups_Inner( me.currentEvent.eventDate, curEventSubStatusCode, ouId );
		}
	};

	// ------------------------------------------------------------------------------
	// Different Version of 'saveDataValuesAndUpdateOuGroups' - to be called by Form 11
	me.addEvent_Disenfranchise = function( eventDate, ouId, returnFunc )
	{
		var subStatusCode_DISENF = M_UID.SEGMENTATION_CODE_DISENFRANCHISE;

		EventDataUtil.retrieveEventsDesc( ouId, M_UID.PROGRAM_ID_SEG, M_UID.STAGE_ID_SEG, me._queryURL_api, function( eventList )
		{				
			if ( eventList && eventList.length > 0 )
			{
				var lastEvent = eventList[0];

				// Add event here..
				me.createEvent_Seg( eventDate, subStatusCode_DISENF, ouId, lastEvent, function()
				{						
					// Perform the Aggregate side data populate
					me.saveDataValuesAndUpdateOuGroups_Inner( eventDate, subStatusCode_DISENF, ouId );

					if ( returnFunc ) returnFunc();
				});
			}
		});
	}

	me.createEvent_Seg = function( eventDate, subStatusCode, ouId, lastEvent, returnFunc )
	{
		// TODO: Compose Json <-- Segmentation date, franchise grade, commnet, etc..
		var json_Event = me.composeSegEventJson( eventDate, subStatusCode, ouId, lastEvent );

		// Need to change to RESTUtil....
		RESTUtil.submitData_Async( 'POST', me._queyrUrl_event, json_Event, function() {
			returnFunc( true );				
		}, function(msg) {				
			console.log( '<br>FAILED to create event on Segmentation.' );
			console.log( msg );
			returnFunc( false );				
		});			
	};
	

	me.composeSegEventJson = function( eventDate, subStatusCode, ouId, lastEvent )
	{
		var json_Event = Util.composeEventJson( M_UID.PROGRAM_ID_SEG, M_UID.STAGE_ID_SEG, ouId, eventDate );

		var statusCode = EventDataUtil.getStatusCodeFromSubStatus( subStatusCode );

		Util.dataValuesPush( json_Event.dataValues, M_UID.EVENT_DE_SEGMENTATION_SUB, subStatusCode );
		Util.dataValuesPush( json_Event.dataValues, M_UID.EVENT_DE_SEGMENTATION, statusCode );
		Util.dataValuesPush( json_Event.dataValues, M_UID.EVENT_DE_NOTE, "event automatically inserted by form 1.1 status changed to 'Defranchised'." );

		if ( lastEvent )
		{ 
			var prevStatus = Util.getDataValueByDeId( lastEvent.dataValues, M_UID.EVENT_DE_SEGMENTATION );
			var prevSubStatus = Util.getDataValueByDeId( lastEvent.dataValues, M_UID.EVENT_DE_SEGMENTATION_SUB );
			
			//var prevEventData = eventList[i-1];
			var elapsDate = Util.getDateDiffStr_FromStr( eventDate, lastEvent.eventDate );

			Util.dataValuesPush( json_Event.dataValues, M_UID.EVENT_DE_SEGMENTATION_PREVIOUS, prevStatus );
			Util.dataValuesPush( json_Event.dataValues, M_UID.EVENT_DE_SEGMENTATION_SUB_PREVIOUS, prevSubStatus );
			Util.dataValuesPush( json_Event.dataValues, M_UID.EVENT_DE_DAYS_IN_PREV, elapsDate );
		}

		return json_Event;
	}

	//
	// ------------------------------------------------------------------------------

	me.checkRollBackCase = function( type, latestEvent, eventDateStr )
	{
		var rollBackCase = false; 

		// Type is 'UPDATE' case and date has changed
		// and changed date is future months (not past and current)
		if ( type === "UPDATE" && me.latestEvent )
		{				
			var previousDateStr = me.latestEvent.eventDate.substring(0, 10);
			var newDateStr = me.eventDateTag.val();
		
			if ( previousDateStr != newDateStr 
				&& Util.monthsDiff( newDateStr, previousDateStr ) >= 1 )
			{
				console.log( "RollBack TRUE Case, Months Diff: " + Util.monthsDiff( newDateStr, previousDateStr ) + ", previousDateStr: " + previousDateStr + ", newDateStr: " + newDateStr );

				rollBackCase = true;
			}
		}

		return rollBackCase;
	};


	me.saveDataValuesAndUpdateOuGroups_Inner = function( eventDate, subStatusCode, ouId )
	{
		if ( subStatusCode )
		{
			var aggDeSegSubId = me.getAggSegSubDeId_FromStatusCode( subStatusCode );
			var statusCode = EventDataUtil.getStatusCodeFromSubStatus( subStatusCode );		
			var aggDeSegId = me.getAggSegDeId_FromStatusCode( statusCode );

			var ougId = me.getOugId_FromStatusCode( statusCode );
			var ougSubId = me.getOugId_FromSubStatusCode( subStatusCode );			

			// Main Seg Status Save (SubSeg and Seg)
			me.saveSegStatusData( eventDate, ouId, aggDeSegSubId, aggDeSegId, ougId, ougSubId );


			var eventDate1 = eventDate.substring( 0, 19 ) ;			

			// Save "Sticky Status - Segmentation - last change"
			AggrDataUtil.saveStatusDataValue( eventDate1, M_UID.AGG_DE_SEGMENTATION_DATE_LAST_CHANGE, ouId, eventDate1, me._queryURL_api );
			
			// Save "Sticky Status - Segmentation - updated this month", 
			//      "Sticky Status - Segmentation - Months since last update"
			me.saveMonthInfoData( eventDate1, ouId );
		}
	}

	me.getAggSegSubDeId_FromStatusCode = function( subStatusCode )
	{
		var deId = '';

		if( subStatusCode == M_UID.SEGMENTATION_CODE_A1 ) deId = M_UID.AGG_DE_SEGMENTATION_A1;
		else if( subStatusCode == M_UID.SEGMENTATION_CODE_B1 ) deId = M_UID.AGG_DE_SEGMENTATION_B1;
		else if( subStatusCode == M_UID.SEGMENTATION_CODE_B2 ) deId = M_UID.AGG_DE_SEGMENTATION_B2;
		else if( subStatusCode == M_UID.SEGMENTATION_CODE_C1 ) deId = M_UID.AGG_DE_SEGMENTATION_C1;
		else if( subStatusCode == M_UID.SEGMENTATION_CODE_C2 ) deId = M_UID.AGG_DE_SEGMENTATION_C2;
		else if( subStatusCode == M_UID.SEGMENTATION_CODE_D1 ) deId = M_UID.AGG_DE_SEGMENTATION_D1;
		else if( subStatusCode == M_UID.SEGMENTATION_CODE_D2 ) deId = M_UID.AGG_DE_SEGMENTATION_D2;
		else if( subStatusCode == M_UID.SEGMENTATION_CODE_D3 ) deId = M_UID.AGG_DE_SEGMENTATION_D3;
		else if( subStatusCode == M_UID.SEGMENTATION_CODE_D4 ) deId = M_UID.AGG_DE_SEGMENTATION_D4;
		else if( subStatusCode == M_UID.SEGMENTATION_CODE_UNKNOWN ) deId = M_UID.AGG_DE_SEGMENTATION_UNKNOWN;
		else if( subStatusCode == M_UID.SEGMENTATION_CODE_DISENFRANCHISE ) deId = M_UID.AGG_DE_SEGMENTATION_DISENFRANCHISE;		
		
		return deId;
	};

	me.getAggSegDeId_FromStatusCode = function( statusCode )
	{
		var deId = '';

		if( statusCode == M_UID.SEGMENTATION_CODE_A ) deId = M_UID.AGG_DE_SEGMENTATION_A;
		else if( statusCode == M_UID.SEGMENTATION_CODE_B ) deId = M_UID.AGG_DE_SEGMENTATION_B;
		else if( statusCode == M_UID.SEGMENTATION_CODE_C ) deId = M_UID.AGG_DE_SEGMENTATION_C;
		else if( statusCode == M_UID.SEGMENTATION_CODE_D ) deId = M_UID.AGG_DE_SEGMENTATION_D;
		else if( statusCode == M_UID.SEGMENTATION_CODE_UNKNOWN ) deId = M_UID.AGG_DE_SEGMENTATION_UNKNOWN;
		else if( statusCode == M_UID.SEGMENTATION_CODE_DISENFRANCHISE ) deId = M_UID.AGG_DE_SEGMENTATION_DISENFRANCHISE;		
		
		return deId;
	};

	me.getOugId_FromStatusCode = function( statusCode )
	{
		var ougId = '';

		if( statusCode == M_UID.SEGMENTATION_CODE_A ) ougId = M_UID.OUG_UID_SEGMENTATION_A;
		else if( statusCode == M_UID.SEGMENTATION_CODE_B ) ougId = M_UID.OUG_UID_SEGMENTATION_B;
		else if( statusCode == M_UID.SEGMENTATION_CODE_C ) ougId = M_UID.OUG_UID_SEGMENTATION_C;
		else if( statusCode == M_UID.SEGMENTATION_CODE_D ) ougId = M_UID.OUG_UID_SEGMENTATION_D;
		else if( statusCode == M_UID.SEGMENTATION_CODE_UNKNOWN ) ougId = M_UID.OUG_UID_SEGMENTATION_UNKNOWN;
		else if( statusCode == M_UID.SEGMENTATION_CODE_DISENFRANCHISE ) ougId = M_UID.OUG_UID_SEGMENTATION_DISENFRANCHISE;		

		return ougId;
	};
	
	me.getOugId_FromSubStatusCode = function( subStatusCode )
	{
		var ougId = '';

		if( subStatusCode == M_UID.SEGMENTATION_CODE_A1 ) ougId = M_UID.OUG_UID_SEGMENTATION_A1;
		else if( subStatusCode == M_UID.SEGMENTATION_CODE_B1 ) ougId = M_UID.OUG_UID_SEGMENTATION_B1;
		else if( subStatusCode == M_UID.SEGMENTATION_CODE_B2 ) ougId = M_UID.OUG_UID_SEGMENTATION_B2;
		else if( subStatusCode == M_UID.SEGMENTATION_CODE_C1 ) ougId = M_UID.OUG_UID_SEGMENTATION_C1;
		else if( subStatusCode == M_UID.SEGMENTATION_CODE_C2 ) ougId = M_UID.OUG_UID_SEGMENTATION_C2;
		else if( subStatusCode == M_UID.SEGMENTATION_CODE_D1 ) ougId = M_UID.OUG_UID_SEGMENTATION_D1;
		else if( subStatusCode == M_UID.SEGMENTATION_CODE_D2 ) ougId = M_UID.OUG_UID_SEGMENTATION_D2;
		else if( subStatusCode == M_UID.SEGMENTATION_CODE_D3 ) ougId = M_UID.OUG_UID_SEGMENTATION_D3;
		else if( subStatusCode == M_UID.SEGMENTATION_CODE_D4 ) ougId = M_UID.OUG_UID_SEGMENTATION_D4;
		
		//else if( subStatusCode == M_UID.SEGMENTATION_CODE_UNKNOWN ) ougId = M_UID.OUG_UID_SEGMENTATION_UNKNOWN;
		//else if( subStatusCode == M_UID.SEGMENTATION_CODE_DISENFRANCHISE ) ougId = M_UID.OUG_UID_SEGMENTATION_DISENFRANCHISE;		

		return ougId;
	};

	// Save data values, includes :
	//		Sticky Status - Segmentation - updated this month
	//		Sticky Status - Segmentation - Months since last update 
	me.saveMonthInfoData = function( eventDate, ouId )
	{

		var json_structuredList = [];
		var curPeriod = Util.generateEventPeriod( eventDate );

		for ( i = 0; i < G_VAR.numMonthsCopy; i++ )
		{
			// Generate period
			var peId = Util.getAddedMonthStr( curPeriod, i );
			
			
			// ----------------------------------------------------------------
			// Save the "Network update this month" value
			
			//Generate value
			var value = "0";
			if( Util.checkIfEventDateInCurPeriod( eventDate, peId ) )
			{
				value = "1";
			}
							
			var dataValue1 = Util.composeDataValueJson( M_UID.AGG_DE_SEGMENTATION_UPDATE_THIS_MONTH, peId, ouId, value );
			json_structuredList.push( dataValue1 );
			
			
			// ----------------------------------------------------------------
			// STEP 2. Save the "Months since last update" value
			
			value = Util.generateMonthSinceDate( eventDate, peId );
			var dataValue2 = Util.composeDataValueJson( M_UID.AGG_DE_SEGMENTATION_MONTHS_SINCE_LAST_UPDATE, peId, ouId, value );
			json_structuredList.push( dataValue2 );
		}		
		
		var jsonList = { "dataValues" : json_structuredList };
		AggrDataUtil.submitDataValueSet_Async( jsonList, me._queryURL_api );
	};

	me.saveSegStatusData = function( eventDate, ouId, aggSubSegDeId, aggSegDeId, ougSegId, ougSubSegId )
	{		
		AggrDataUtil.matchAndSave_DataValue( eventDate, ouId, M_UID.AGG_DE_SEGMENTATION_A1, aggSubSegDeId, me._queryURL_api );
		AggrDataUtil.matchAndSave_DataValue( eventDate, ouId, M_UID.AGG_DE_SEGMENTATION_B1, aggSubSegDeId, me._queryURL_api );
		AggrDataUtil.matchAndSave_DataValue( eventDate, ouId, M_UID.AGG_DE_SEGMENTATION_B2, aggSubSegDeId, me._queryURL_api );
		AggrDataUtil.matchAndSave_DataValue( eventDate, ouId, M_UID.AGG_DE_SEGMENTATION_C1, aggSubSegDeId, me._queryURL_api );
		AggrDataUtil.matchAndSave_DataValue( eventDate, ouId, M_UID.AGG_DE_SEGMENTATION_C2, aggSubSegDeId, me._queryURL_api );
		AggrDataUtil.matchAndSave_DataValue( eventDate, ouId, M_UID.AGG_DE_SEGMENTATION_D1, aggSubSegDeId, me._queryURL_api );
		AggrDataUtil.matchAndSave_DataValue( eventDate, ouId, M_UID.AGG_DE_SEGMENTATION_D2, aggSubSegDeId, me._queryURL_api );
		AggrDataUtil.matchAndSave_DataValue( eventDate, ouId, M_UID.AGG_DE_SEGMENTATION_D3, aggSubSegDeId, me._queryURL_api );
		AggrDataUtil.matchAndSave_DataValue( eventDate, ouId, M_UID.AGG_DE_SEGMENTATION_D4, aggSubSegDeId, me._queryURL_api );

		AggrDataUtil.matchAndSave_DataValue( eventDate, ouId, M_UID.AGG_DE_SEGMENTATION_A, aggSegDeId, me._queryURL_api );
		AggrDataUtil.matchAndSave_DataValue( eventDate, ouId, M_UID.AGG_DE_SEGMENTATION_B, aggSegDeId, me._queryURL_api );
		AggrDataUtil.matchAndSave_DataValue( eventDate, ouId, M_UID.AGG_DE_SEGMENTATION_C, aggSegDeId, me._queryURL_api );
		AggrDataUtil.matchAndSave_DataValue( eventDate, ouId, M_UID.AGG_DE_SEGMENTATION_D, aggSegDeId, me._queryURL_api );
		// NOTE: Unknown or Disenfranchise can be used for either aggSubSeg or AggSeg
		AggrDataUtil.matchAndSave_DataValue( eventDate, ouId, M_UID.AGG_DE_SEGMENTATION_UNKNOWN, aggSegDeId, me._queryURL_api );
		AggrDataUtil.matchAndSave_DataValue( eventDate, ouId, M_UID.AGG_DE_SEGMENTATION_DISENFRANCHISE, aggSegDeId, me._queryURL_api );

		// 2. FOR A1 ~ D4 ones, need to set 2 orgUnit Groups - 
		// 1. Need a method to return the matching OUG SUB-SEG to SEG
		// But, we need to change it so that multiple orgUnitGroup case, it does not delete everything..
		// It is a bit complicated...

		OUGroupUtil.matchAndJoin_OuGroup( ouId, M_UID.OUG_UID_SEGMENTATION_A1, ougSubSegId, me._queryURL_api );
		OUGroupUtil.matchAndJoin_OuGroup( ouId, M_UID.OUG_UID_SEGMENTATION_B1, ougSubSegId, me._queryURL_api );
		OUGroupUtil.matchAndJoin_OuGroup( ouId, M_UID.OUG_UID_SEGMENTATION_B2, ougSubSegId, me._queryURL_api );
		OUGroupUtil.matchAndJoin_OuGroup( ouId, M_UID.OUG_UID_SEGMENTATION_C1, ougSubSegId, me._queryURL_api );
		OUGroupUtil.matchAndJoin_OuGroup( ouId, M_UID.OUG_UID_SEGMENTATION_C2, ougSubSegId, me._queryURL_api );
		OUGroupUtil.matchAndJoin_OuGroup( ouId, M_UID.OUG_UID_SEGMENTATION_D1, ougSubSegId, me._queryURL_api );
		OUGroupUtil.matchAndJoin_OuGroup( ouId, M_UID.OUG_UID_SEGMENTATION_D2, ougSubSegId, me._queryURL_api );
		OUGroupUtil.matchAndJoin_OuGroup( ouId, M_UID.OUG_UID_SEGMENTATION_D3, ougSubSegId, me._queryURL_api );
		OUGroupUtil.matchAndJoin_OuGroup( ouId, M_UID.OUG_UID_SEGMENTATION_D4, ougSubSegId, me._queryURL_api );

		OUGroupUtil.matchAndJoin_OuGroup( ouId, M_UID.OUG_UID_SEGMENTATION_A, ougSegId, me._queryURL_api );
		OUGroupUtil.matchAndJoin_OuGroup( ouId, M_UID.OUG_UID_SEGMENTATION_B, ougSegId, me._queryURL_api );
		OUGroupUtil.matchAndJoin_OuGroup( ouId, M_UID.OUG_UID_SEGMENTATION_C, ougSegId, me._queryURL_api );
		OUGroupUtil.matchAndJoin_OuGroup( ouId, M_UID.OUG_UID_SEGMENTATION_D, ougSegId, me._queryURL_api );

		OUGroupUtil.matchAndJoin_OuGroup( ouId, M_UID.OUG_UID_SEGMENTATION_UNKNOWN, ougSegId, me._queryURL_api );
		OUGroupUtil.matchAndJoin_OuGroup( ouId, M_UID.OUG_UID_SEGMENTATION_DISENFRANCHISE, ougSegId, me._queryURL_api );
	};
	
}
