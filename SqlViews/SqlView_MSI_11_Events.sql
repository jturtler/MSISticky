SELECT * FROM (
-- Part 1 : retrieve all events for org units the status program is assigned to
    SELECT
       psi.uid AS programuid
     , ou.uid AS ouuid
     , coalesce(to_char( psi.executiondate,'YYYYMM'),'201701') AS period
     , coalesce(psi.executiondate,'2017-01-01 00:00:00.0') AS eventdate
     , psi.programstageid AS programstageid
     , prevSts.value AS "prevSts"
     , coalesce(newSts.value, '') AS "newSts"
     , elapsDate.value AS "elapsDate"
     , noteData.value AS "noteData"
    
    FROM organisationunit ou
    
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
    
      INNER JOIN trackedentitydatavalue AS newSts
        ON psi.programstageinstanceid = newSts.programstageinstanceid
          AND newSts.dataelementid = (select dataelementid from dataelement where uid = 'XhFcLwoD1Dr' limit 1 ) -- 244950
    
      left outer join trackedentitydatavalue AS prevSts
        ON psi.programstageinstanceid = prevSts.programstageinstanceid
          AND prevSts.dataelementid = (select dataelementid from dataelement where uid = 'k95lcIlS4bv' limit 1 ) --786150
          
      left outer join trackedentitydatavalue AS elapsDate
        ON psi.programstageinstanceid = elapsDate.programstageinstanceid
          AND elapsDate.dataelementid = (select dataelementid from dataelement where uid = 'UrD7yr6JLEf' limit 1 ) --  786151
    
      left outer join trackedentitydatavalue AS noteData
        ON psi.programstageinstanceid = noteData.programstageinstanceid
          AND noteData.dataelementid = (select dataelementid from dataelement where uid = 'Yww3Z8MYo1e' limit 1 ) --  244949
    
    WHERE ( '${ouid}' = 'ALL' OR ou.path LIKE '%/${ouid}%' )
      AND ou.hierarchylevel = 6 

UNION
-- Part 2 : if data exists before the eventdate, assume under contract for that period onwards
-- This isn't clever enough yet to deal with gaps in data entry, but ensures are performance
-- indicators are conservative
    SELECT
       psi.uid AS programuid
     , ou.uid AS ouuid
     , coalesce(to_char(firstdataperiod.earliestdate,'YYYYMM'),'201701') AS period
     , coalesce(firstdataperiod.earliestdate,'2017-01-01 00:00:00.0') AS eventdate
     , psi.programstageid AS programstageid
     , '' AS "prevSts"
     , 'UNC' AS "newSts"
     , null AS "elapsDate"
     , null AS "noteData"
    
    FROM organisationunit ou
    
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
    
      INNER JOIN trackedentitydatavalue AS newSts
        ON psi.programstageinstanceid = newSts.programstageinstanceid
          AND newSts.dataelementid = (select dataelementid from dataelement where uid = 'XhFcLwoD1Dr' limit 1 ) -- 244950
    
      -- add an event for the first period a data value exists, if data exists 
      -- before any of the events in the system 
      INNER JOIN (   
            SELECT  ou.parentid AS ouid, MIN(p.startdate) AS earliestdate
              FROM  datavalue dv
                    INNER JOIN period p 
                      ON p.periodid = dv.periodid
                    INNER JOIN organisationunit ou
                      ON ou.organisationunitid = dv.sourceid
                    INNER JOIN datasetelement dse
                      ON dse.dataelementid = dv.dataelementid
                    INNER JOIN dataset ds  -- only look for non sticky data
                      ON ds.datasetid = dse.datasetid
                      AND ds.uid != 'ZAP8TO9fRZu' -- Status and segmentation dataset
             WHERE  dv.deleted = FALSE
          GROUP BY  ou.parentid
      ) firstdataperiod
        ON firstdataperiod.ouid = ou.organisationunitid
        AND firstdataperiod.earliestdate < date_trunc('month', psi.executiondate)

    WHERE ( '${ouid}' = 'ALL' OR ou.path LIKE '%/${ouid}%' )
      AND ou.hierarchylevel = 6 

UNION
-- Part 3 : same as part 2 but for unknown ou's (e.g. where we don't find events
-- for an ou, see null filter in where clause)
    SELECT
       psi.uid AS programuid
     , ou.uid AS ouuid
     , coalesce(to_char(firstdataperiod.earliestdate, 'YYYYMM'),'201701') AS period
     , coalesce(firstdataperiod.earliestdate, '2017-01-01 00:00:00.0') AS eventdate
     , psi.programstageid AS programstageid
     , '' AS "prevSts"
     , CASE 
       WHEN firstdataperiod.earliestdate IS NULL 
       THEN '' -- js_StickyUtil.js treats blank as unknown status
       ELSE 'UNC' 
       END 
       AS "newSts" 
     , null AS "elapsDate"
     , null AS "noteData"
    
    FROM organisationunit ou
    
      INNER JOIN program_organisationunits AS prgorg
        ON prgorg.organisationunitid = ou.organisationunitid
        AND prgorg.programid = (select programid from program where uid = '${prgid}')
    
      INNER JOIN program p 
        ON p.programid = prgorg.programid 
    
      INNER JOIN programstage AS ps
        ON p.programid = ps.programid
      
      LEFT JOIN programstageinstance AS psi
        ON psi.organisationunitid = ou.organisationunitid 
          AND psi.programstageid = ps.programstageid  
    
      LEFT JOIN trackedentitydatavalue AS newSts
        ON psi.programstageinstanceid = newSts.programstageinstanceid
          AND newSts.dataelementid = (select dataelementid from dataelement where uid = 'XhFcLwoD1Dr' limit 1 ) -- 244950
    
      -- add an event for the first period a data value exists, if data exists 
      -- before any of the events in the system 
      LEFT JOIN (   
            SELECT  ou.parentid AS ouid, MIN(p.startdate) AS earliestdate
              FROM  datavalue dv
                    INNER JOIN period p 
                      ON p.periodid = dv.periodid
                    INNER JOIN organisationunit ou
                      ON ou.organisationunitid = dv.sourceid
                    INNER JOIN datasetelement dse
                      ON dse.dataelementid = dv.dataelementid
                    INNER JOIN dataset ds  -- only look for non sticky data
                      ON ds.datasetid = dse.datasetid
                      AND ds.uid != 'ZAP8TO9fRZu' -- Status and segmentation dataset
             WHERE  dv.deleted = FALSE
          GROUP BY  ou.parentid
      ) firstdataperiod
        ON firstdataperiod.ouid = ou.organisationunitid

    WHERE ( '${ouid}' = 'ALL' OR ou.path LIKE '%/${ouid}%' )
      AND ou.hierarchylevel = 6 
      AND newSts IS null

) all_events
ORDER BY ouuid, eventdate;
