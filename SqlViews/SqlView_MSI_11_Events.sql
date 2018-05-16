select psi.uid
 , ou.uid
 , to_char( psi.executiondate,'YYYYMM')
 , psi.executiondate  --- ?? eventdate?
 , psi.programstageid

 , prevSts.value as "prevSts"
 , newSts.value as "newSts"
 , elapsDate.value as "elapsDate"
 , noteData.value as "noteData"

from programstageinstance as psi
  inner join organisationunit ou
    on ou.organisationunitid = psi.organisationunitid

  inner join programstage as ps
    on psi.programstageid = ps.programstageid

  inner join program as prg
    on ps.programid = prg.programid
      and prg.uid = '${prgid}'
      
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

where ( '${ouid}' = 'ALL' OR ou.path like '%/${ouid}/%' )

order by ou.uid, psi.executiondate;
