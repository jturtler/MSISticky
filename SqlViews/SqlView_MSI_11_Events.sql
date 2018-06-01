select psi.uid
 , ou.uid
 , coalesce(to_char( psi.executiondate,'YYYYMM'),'201701')
 , coalesce(psi.executiondate,'2017-01-01 00:00:00.0')  -- eventdate
 , psi.programstageid

 , prevSts.value as "prevSts"
 , coalesce(newSts.value, '') as "newSts"
 , elapsDate.value as "elapsDate"
 , noteData.value as "noteData"

from organisationunit ou

  inner join program_organisationunits as prgorg
    on prgorg.organisationunitid = ou.organisationunitid
    and prgorg.programid = (select programid from program where uid = '${prgid}')

  inner join program p 
    on p.programid = prgorg.programid 

  inner join programstage as ps
    on p.programid = ps.programid
  
  left outer join programstageinstance as psi
    on psi.organisationunitid = ou.organisationunitid 
      and psi.programstageid = ps.programstageid  

  left outer join trackedentitydatavalue as prevSts
    on psi.programstageinstanceid = prevSts.programstageinstanceid
      and prevSts.dataelementid = (select dataelementid from dataelement where uid = 'k95lcIlS4bv' limit 1 ) --786150
      
  left outer join trackedentitydatavalue as newSts
    on psi.programstageinstanceid = newSts.programstageinstanceid
      and newSts.dataelementid = (select dataelementid from dataelement where uid = 'XhFcLwoD1Dr' limit 1 ) -- 244950

  left outer join trackedentitydatavalue as elapsDate
    on psi.programstageinstanceid = elapsDate.programstageinstanceid
      and elapsDate.dataelementid = (select dataelementid from dataelement where uid = 'UrD7yr6JLEf' limit 1 ) --  786151

  left outer join trackedentitydatavalue as noteData
    on psi.programstageinstanceid = noteData.programstageinstanceid
      and noteData.dataelementid = (select dataelementid from dataelement where uid = 'Yww3Z8MYo1e' limit 1 ) --  244949

WHERE ( '${ouid}' = 'ALL' OR ou.path like '%/${ouid}%' )
  AND ou.hierarchylevel = 6 

order by ou.uid, psi.executiondate;
