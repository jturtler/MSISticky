
// ------------------------------------
// *** DHIS AppStore Deploy Version ***
// -- App Manifest Json (Get this via Synch, so that it is defined ahead)
var _appManifest = $.parseJSON( RESTUtil.getSynchData( 'manifest.webapp' ) );
var _appURL = _appManifest.activities.dhis.href.replace( '/dhis-web-maintenance-appmanager', '' ) + '/';
// ------------------------------------

var _queryURL_api = _appURL + 'api/';

function UpdateStickyDataValue()
{
	var me = this;
	
	me.orgUnit;
	
	// [ URL ]
	me.attrId_isAccreditation = "v1g9V0kHrUm";

	me._queryURL_ProgramList_20 = _queryURL_api + "programs.json?fields=name,id,attributeValues[value,attribute[id]]&paging=false" 
	+ "&filter=attributeValues.attribute.id:eq:" + me.attrId_isAccreditation;
	// &filter=shortName:^like:MSI-20-";
	
	me.KEY_MSI_NODEJS_FILE_PATH = "misnodejsfilepath";
	
	me.startDateTag = $("#startDate");
	me.endDateTag = $("#endDate");
	me.dateRangeTags = $(".dateRange");
	
	me.programsTag = $("#programs");	
	me.programActionTypeTag = $('#programActionType');
	me.divActionTypeTags = $( '.divActionType' );

	me.trDateRangeTag = $( '.trDateRange' );
	me.divStartDateTags = $( '.divStartDate' );
	me.divEndDateTags = $( '.divEndDate' );

	me.runBtnTag = $("#runBtn");
	
	me.dataValueResultDivTag = $("#dataValueResultDiv");
	
	me.settingsDivTag = $("#settingsDiv");
	me.settingsBtnTag = $("#settingsBtn");
	me.servletLocationTag = $("#servletLocation");
	me.settingsMsgTag = $("#settingsMsg");
	
	me.KEY_SERVLET_LOCALTION = "servletLocation";
	
	me.loadedUserInfo = false;
	me.loadedSettingsData = false;
	me.loadedProgramList = false;

	me.nodeJSFileMap = {
		"1.1": {
			"Unknown": "MSI11_Unknown.js",
			"SetData": "MSI11_AggUpdate.js"
		}
		,"1.2": {
			"Unknown": "MSI12_Unknown.js",
			"SetData": "MSI12_AggUpdate.js"
		}
		,"2.0": {
			"Unknown": "MSI20_Unknown.js",
			"SetData": "MSI20_AggUpdate.js"
		}
	}

	me.init = function()
	{
		me.loadMetaData();
		me.setUp_Events();
		me.showHideBelowProgram( 'hide' );
	};
	
		
	// ------------------------------------------------------------------------------------
	// Load meta data
	
	
	me.loadMetaData = function()
	{
		me.loadUserInfo();
		me.orgUnit = new OrgUnit();
		me.getSettings();
		me.loadProgramList();
	};
	
	me.loadUserInfo = function()
	{
		var url =  _queryURL_api + "me.json?fields=userCredentials[username]";
		
		$.ajax({
			type: "GET"
			,url: url
			,success: function( jsonData ) 
			{
				var username = jsonData.userCredentials.username;
				if( username == 'david.palmer@mariestopes.org' || username == 'vilde.aagenaes' || username == 'rmelia' || username == 'jamesc'  || username == 'tranc' )
				{
					me.settingsBtnTag.show();
				}
				else{
					me.settingsBtnTag.hide();
				}
			}
			,error: function( msg ) 
			{
				console.log( 'error' + msg);
			}
		})
		.always( function( data ) {
			me.loadedUserInfo = true;
		});
	};
	
	me.metaDataLoaded = function()
	{
		if( me.loadedSettingsData && me.loadedProgramList && me.loadedUserInfo )
		{
			MsgManager.appUnblock();
			
			if( me.servletLocationTag.val() == "" )
			{
				me.optionSettingsForm();
				alert("Please do Settings for the app before using");
				Util.disableTag( me.runBtnTag, true );
			}
		}
	};
	
	
	me.getSettings = function()
	{
		var url =  _queryURL_api + "systemSettings/" + me.KEY_MSI_NODEJS_FILE_PATH;
		
		$.ajax({
			type: "GET"
			,dataType: "text"
			,url: url
			,success: function( msg ) 
			{
				var jsonData = JSON.parse( msg );				
				me.servletLocationTag.val( jsonData[me.KEY_SERVLET_LOCALTION] );
			}
			,error: function( msg ) 
			{
				console.log( 'error' + msg);
			}
		})
		.always( function( data ) {
			me.loadedSettingsData = true;				
			me.metaDataLoaded();
		});
	
	};
	
	
	me.loadProgramList = function()
	{	
		$.ajax(
			{
				type: "GET"
				,url: me._queryURL_ProgramList_20
				,beforeSend: function()
				{
					MsgManager.appBlock("Initizeling");
				}
				,success: function( response ) 
				{
					Util.clearList( me.programsTag );
					
					
					var optionTag_Default = $("<option value='' programType='' Selected>Select Program</option>");
					me.programsTag.append(optionTag_Default);

					// Program "Status Log 1.1"
					var optionTag1 = $("<option value='i8IL2nSOkKX' programType='1.1' scriptUnknown='MSI11_Unknown.js' scriptSetData='MSI11_AggUpdate.js'>Log Status (1.1)</option>");
					me.programsTag.append(optionTag1);
					
				
					// Program "Status Log 1.2"
					var optionTag2 = $("<option value='nPVbI9R3Avm' programType='1.2' scriptUnknown='MSI12_Unknown.js' scriptSetData='MSI12_AggUpdate.js'>Log Segmentation (1.2)</option>");
					me.programsTag.append(optionTag2);
				
					// Program "Status Log 2.0"
					for( var i in response.programs )
					{
						var program = response.programs[i];
						if( program.attributeValues !== undefined && me.getAttributeVal( program.attributeValues, me.attrId_isAccreditation ) === "true" )
						{
							var optionTag = $("<option value='" + program.id +"' programType='2.0' scriptUnknown='MSI20_Unknown.js' scriptSetData='MSI20_AggUpdate.js'>" + program.name + "</option>");
							me.programsTag.append( optionTag );
						}
					}	
				}
			}).always(function(){
				me.loadedProgramList = true;
				me.metaDataLoaded();
			});
		
	};


	me.getAttributeVal = function( list, attrId )
	{
		var val = "";

		for ( var i = 0; i < list.length; i++ )
		{
			var item = list[i];

			if ( item.attribute.id === attrId )
			{
				val = item.value;				
				break;
			}
		}

		return val;
	}
	
	// Load meta data
	// ------------------------------------------------------------------------------------
	
	me.showHideBelowProgram = function( visibleType )
	{
		var trTags = $( '.mainParamTable tr.belowProgram');

		if ( visibleType === 'hide' ) trTags.hide( "600" );
		else if ( visibleType === 'show' ) 
		{
			trTags.not( '.trDateRange' ).show( "600" );
		}

		// Need to clear it as well?	
		selectionTree.clearSelectedOrganisationUnits();
	}

	// ------------------------------------------------------------------------------------
	// Setup Events
	
	me.setUp_Events = function()
	{
		Util.datePickerInRange( me.startDateTag, me.endDateTag );

		me.programsTag.change( me.programSelectedOnChange );

		me.programActionTypeTag.change( me.programActionTypeChange );

		me.runBtnTag.click( function()
		{			
			me.dataValueResultDivTag.show();
			me.dataValueResultDivTag.html("<h3>Processing</h3>");
				
			var option = me.programsTag.find("option:selected");;
			var programName = option.text();
			var programId = option.val();
			var programType = option.attr("programType");
			var programActionTypeVal = me.programActionTypeTag.val();

			// Select the proper file name
			if ( programActionTypeVal && programId )
			{									
				var fileName = "";

				if ( programActionTypeVal === "Unknown" ) fileName = option.attr( "scriptUnknown" );
				else if ( programActionTypeVal === "SetData" ) fileName = option.attr( "scriptSetData" );

				if ( fileName )
				{
					var params = me.getProgramParams( option );				
					me.runNodeJs( programName, programId, fileName, programActionTypeVal, params );					
				}
			}
			
		});
				
		me.settingsBtnTag.click( function(){
			me.optionSettingsForm();
		});
				
	};
	
	me.programSelectedOnChange = function()
	{
		me.programActionTypeTag.val( '' );
		me.showHideBelowProgram( 'hide' );
		
		( me.programsTag.val() ) ? me.divActionTypeTags.show() : me.divActionTypeTags.hide();
	};

	me.programActionTypeChange = function()
	{
		var programSelectedOptTag = me.programsTag.find('option:selected');
		var programActionTypeVal = me.programActionTypeTag.val();

		// Reset things below
		me.divStartDateTags.val( '' ).hide();
		me.divEndDateTags.val( '' ).hide();
		me.startDateTag.val( '' );
		me.endDateTag.val( '' );

		if( programActionTypeVal )
		{
			var attr = programSelectedOptTag.attr( 'programtype' );

			me.showHideBelowProgram( 'show' );		
			Util.disableTag( me.runBtnTag, false );

			// set date from/to
			if ( programActionTypeVal === 'Unknown' )
			{
				me.trDateRangeTag.show( '600' );
				me.divStartDateTags.show();
				me.divEndDateTags.hide();
			}
			else if ( programActionTypeVal === 'SetData' && programSelectedOptTag.attr( 'programtype' ) === "2.0" )
			{
				me.trDateRangeTag.show( '600' );
				me.divStartDateTags.show();
				me.divEndDateTags.show();
			}
		}
		else
		{			
			me.showHideBelowProgram( 'hide' );		
			Util.disableTag( me.runBtnTag, true );
		}		
	}
	
	/*
	me.setDateFields = fucntion()
	{
		//Util.disableTag( me.startDateTag, true );
		//Util.disableTag( me.endDateTag, true );		
	}
	*/

	/*
	me.checkIfDateRangRequired = function()
	{		
		var optionTag = me.programsTag.find("option:selected");
		var programType = optionTag.attr("programType");
		
		var nodeJSConfig = me.nodeJSFileMap[programType];
		var isParams = eval( nodeJSConfig.params );
		
		return isParams;
	};
	*/
	
	// Setup Events
	// ------------------------------------------------------------------------------------
	
	
	// ------------------------------------------------------------------------------------
	// Update data values
	// ------------------------------------------------------------------------------------
	
	me.runNodeJs = function( programName, programId, nodeJSFile, programCase, params )
	{
		var serverName = "https://sandbox.orion.mariestopes.org";
		// var serverName = "http://localhost:8080/dhis";
		var url = me.servletLocationTag.val() + "/NodeJSRunner?node=" + nodeJSFile + "&server=" + serverName + "&logLevel=1" + params;
		
		console.log( 'submit URL: ' + url );

		$.ajax(
			{
				type: "GET"
				,url: url
				,crossOrigin: true
				,beforeSend: function()
				{
					var programDetailsTag = $("<div class='resultMsg' programId='" + programId + "_" + nodeJSFile + "'></span>");
					programDetailsTag.append("<span style='font-weight: bold;'>Updating data values for program " + programName + programCase + " </span>");
					programDetailsTag.append("<img src='img/ajax-loader-bar.gif'> ");
					programDetailsTag.append("<a href='#' style='display:none;'>[+]</a>");
					me.dataValueResultDivTag.append( programDetailsTag );
					me.dataValueResultDivTag.append( "<br>" );
					
					programDetailsTag.find("a").click( function(){
						 me.detailsToggle(this);
					});
					 
				}
				,success: function( response )
				{
					var programMsgTag = me.dataValueResultDivTag.find("div[programId='" + programId + "_" + nodeJSFile + "']");
					
					// Remove loading image
					programMsgTag.find("img").remove();
					
					// Show the 'Show/Hide' link
					programMsgTag.find("a").show();
					
					// Add the result details
					var detailsMsgTag = $("<div class='detailsMsg' style='display:none;'>" + response + "</div>");
					programMsgTag.append( detailsMsgTag );
				}
				,error: function( a,b,c )
				{
					var programMsgTag = me.dataValueResultDivTag.find("div[programId='" + programId + "_" + nodeJSFile + "']");
					
					// Remove loading image
					programMsgTag.find("img").remove();
					
					programMsgTag.append( " ... SUCCESS !!!" );
				}
			});
	};
	
	me.getProgramParams = function( optionTag )
	{
		var params = "&sourceType=WebApp&bgProcess=Y";
		
		var programType = optionTag.attr("programType");			

		if ( me.startDateTag.is(':visible') && me.startDateTag.val() ) params += "&startDate=" + me.startDateTag.val();
		if ( me.endDateTag.is(':visible') && me.endDateTag.val() ) params += "&endDate=" + me.endDateTag.val();
		
		if( programType == '2.0' ) params += "&program=" + optionTag.val();
		
		if( me.orgUnit.getSelected().length > 0 ) params += "&ouid=" + me.orgUnit.getSelected()[0].id;		

		return params;
	};
	
	me.detailsToggle = function( link )
	{
		var linkTag = $( link );
		var resultMsgTag = linkTag.closest("div.resultMsg");
		var detailsMsgTag = resultMsgTag.find("div.detailsMsg");
		
		var curShowStatus = ( linkTag.html() == "[+]" ) ? false : true;
		if( curShowStatus )
		{
			detailsMsgTag.hide();
			linkTag.html("[+]");
		}
		else
		{
			detailsMsgTag.show();
			linkTag.html("[-]");
		}
		
	};
	
	// ------------------------------------------------------------------------------------
	// Settings
	// ------------------------------------------------------------------------------------
	
	me.optionSettingsForm = function()
	{
		me.settingsMsgTag.hide();
		me.settingsDivTag.dialog({
			title: 'Settings',
			maximize: true,
			closable: true,
			modal: true,
			width: 400,
			height: 140,
			buttons: {
				"Save": function () {
					me.saveSettings();
					$(this).dialog("close");
				},
				"Close": function () {
					$(this).dialog("close");
				}
			}
		}).show('fast' );
	};
	
	me.saveSettings = function()
	{
		var jsonData = {
			"servletLocation" : me.servletLocationTag.val()
		};
		
		$.ajax(
		{
			type: "POST"
			,url: _queryURL_api + "systemSettings/" + me.KEY_MSI_NODEJS_FILE_PATH
			,data: JSON.stringify( jsonData )
			,contentType: "text/plain; charset=utf-8"
			,beforeSend: function(){
				MsgManager.appBlock( "Saving ..." );
				me.settingsMsgTag.find("td").html("Saving ...");
				me.settingsMsgTag.show();
			}
			,success: function( msg ) 
			{
				MsgManager.appUnblock();
				me.settingsMsgTag.find("td").html("Settings is saved!");
			}
		});
		
	};
	
	
	// ------------------------------------------------------------------------------------
	// RUN Init
	// ------------------------------------------------------------------------------------
	
	me.init();
	
}