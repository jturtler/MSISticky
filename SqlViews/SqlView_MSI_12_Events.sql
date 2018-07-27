-- Part 1 : retrieve all sub segmentation events for org units the seg program is assigned to
SELECT * FROM (
    SELECT 
       psi.uid AS programuid
     , ou.uid AS ouuid
     , coalesce(to_char( psi.executiondate,'YYYYMM'),'201701') AS period
     , coalesce(psi.executiondate,'2017-01-01 00:00:00.0') AS eventdate
     , psi.programstageid AS programstageid
     , prevSts.value AS "prevSts"
     , coalesce(newSts.value, 'UNK') AS "newSts"
     , elapsDate.value AS "elapsDate"
     , noteData.value AS "noteData"
     , prevSubSts.value AS "prevSubSts"
     , coalesce(newSubSts.value, 'UNK') AS "newSubSts"
    
    from organisationunit ou
    
      INNER JOIN program_organisationunits AS prgorg
        ON prgorg.organisationunitid = ou.organisationunitid
        AND prgorg.programid = (select programid from program where uid = '${prgid}')
    
      INNER JOIN program p 
        ON p.programid = prgorg.programid 
    
      INNER JOIN programstage AS ps
        ON p.programid = ps.programid
      
      INNER JOIN programstageinstance AS psi
        ON psi.organisationunitid = ou.organisationunitid 
          AND psi.programstageid = ps.programstageid  
    
      INNER JOIN trackedentitydatavalue AS newSubSts
        ON psi.programstageinstanceid = newSubSts.programstageinstanceid
          AND newSubSts.dataelementid = (select dataelementid from dataelement where uid = 'DwXW311h36K' limit 1 ) --  2869119
    
      LEFT OUTER JOIN trackedentitydatavalue AS newSts
        ON psi.programstageinstanceid = newSts.programstageinstanceid
          AND newSts.dataelementid = (select dataelementid from dataelement where uid = 'wYoGZDnvu3n' limit 1 ) --  244951
    
      LEFT OUTER JOIN trackedentitydatavalue AS prevSts
        ON psi.programstageinstanceid = prevSts.programstageinstanceid
          AND prevSts.dataelementid = (select dataelementid from dataelement where uid = 'T2iHkAEidOd' limit 1 ) --  786154
    
      LEFT OUTER JOIN trackedentitydatavalue AS prevSubSts
        ON psi.programstageinstanceid = prevSubSts.programstageinstanceid
          AND prevSubSts.dataelementid = (select dataelementid from dataelement where uid = 'Lwugb7O0coU' limit 1 ) --  2869137
          
      LEFT OUTER JOIN trackedentitydatavalue AS elapsDate
        ON psi.programstageinstanceid = elapsDate.programstageinstanceid
          AND elapsDate.dataelementid = (select dataelementid from dataelement where uid = 'UrD7yr6JLEf' limit 1 ) --  786151
    
      LEFT OUTER JOIN trackedentitydatavalue AS noteData
        ON psi.programstageinstanceid = noteData.programstageinstanceid
          AND noteData.dataelementid = (select dataelementid from dataelement where uid = 'Yww3Z8MYo1e' limit 1 ) --  244949
    
    WHERE ( '${ouid}' = 'ALL' OR ou.path LIKE '%/${ouid}%' )
      AND ou.hierarchylevel = 6 
) all_events 
ORDER BY ouuid, eventdate;