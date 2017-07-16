
// -------------------------------------------
// -- Utility Class/Methods

function Util() {}

Util.disableTag = function( tag, isDisable )
{
	tag.prop('disabled', isDisable);
	
	for( var i=0; i<tag.length; i++ )
	{
		var element = $(tag[i]);
		if( element.prop("tagName") == 'SELECT' || element.prop("tagName") == 'INPUT' )
		{
			if( isDisable )
			{
				element.css( 'background-color', '#F2F2F2' ).css( 'cursor', 'auto' );
			}
			else
			{
				element.css( 'background-color', 'white' ).css( 'cursor', '' );
			}
		}
	}
};

Util.clearList = function( listTag )
{
	listTag.find("option").remove();
};


// ----------------------------------
// Check Variable Related


Util.checkDefined = function( input ) {

	if( input !== undefined && input != null ) return true;
	else return false;
};

Util.checkValue = function( input ) {

	if ( Util.checkDefined( input ) && input.length > 0 ) return true;
	else return false;
};

// Check Variable Related
// ----------------------------------



// ----------------------------------
// Date


var monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
	'July', 'August', 'September', 'October', 'November', 'December'];

Util.datePickerInRange = function( startDateTag, endDateTag )
{
	var startdateFieldId = startDateTag.attr("id");
	var endDateFieldId = endDateTag.attr("id");

	var dates = $( '#' + startdateFieldId + ', #' + endDateFieldId ).datepicker(
		{
			dateFormat: 'yy-mm-dd',
			defaultDate: "+1w",
			changeMonth: true,
			changeYear: true,
			numberOfMonths: 1,
			monthNamesShort: monthNames,
			createButton: false,
			constrainInput: true,
			yearRange: '-100:+100',
			onSelect: function(selectedDate)
			{
				var option = this.id == startdateFieldId ? "minDate" : "maxDate";
				var instance = $(this).data("datepicker");
				var date = $.datepicker.parseDate(instance.settings.dateFormat || $.datepicker._defaults.dateFormat, selectedDate, instance.settings);
				dates.not(this).datepicker("option", option, date);
			}
		});


	jQuery( ".ui-datepicker-trigger").hide();

	$("#ui-datepicker-div").hide();
}

// Date
// ----------------------------------




