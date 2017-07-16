/**
 * Created by Tran on 8/5/2015.
 */


function OrgUnit()
{
    var me = this;
		
	me.selected = [];	
		
    me.initialSetup = function()
	{
		me.buildTree();
    };

    me.buildTree = function()
    {
		selectionTreeSelection.setMultipleSelectionAllowed( false );
		selectionTree.clearSelectedOrganisationUnits();
		selectionTree.buildSelectionTree();
		selectionTreeSelection.setListenerFunction( me.listenerFunction );	
    };

    me.listenerFunction = function( orgUnits, orgUnitNames )
    { 
        me.selected = [];
		for( var i=0; i< orgUnits.length; i++ ) 
		{
			me.selected.push({ "id": orgUnits[i], "name": orgUnitNames[i] });			
        }
    };
	
	me.getSelected = function()
	{
		return me.selected;
	}
	

	// Run Initial Setup
	
	me.initialSetup();
}

