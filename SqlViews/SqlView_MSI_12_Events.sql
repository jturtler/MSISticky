select psi.uid
 , ou.uid
 , to_char( psi.executiondate,'YYYYMM')
 , psi.executiondate  --- ?? eventdate?
 , psi.programstageid

 , prevSts.value as "prevSts"
 , newSts.value as "newSts"
 , elapsDate.value as "elapsDate"
 , noteData.value as "noteData"

 , prevSubSts.value as "prevSubSts"
 , newSubSts.value as "newSubSts"

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
      and prevSts.dataelementid = 786154

  left outer join trackedentitydatavalue as prevSubSts
    on psi.programstageinstanceid = prevSubSts.programstageinstanceid
      and prevSubSts.dataelementid = 2869137
      
  left outer join trackedentitydatavalue as newSts
    on psi.programstageinstanceid = newSts.programstageinstanceid
      and newSts.dataelementid = 244951

  left outer join trackedentitydatavalue as newSubSts
    on psi.programstageinstanceid = newSubSts.programstageinstanceid
      and newSubSts.dataelementid = 2869119

  left outer join trackedentitydatavalue as elapsDate
    on psi.programstageinstanceid = elapsDate.programstageinstanceid
      and elapsDate.dataelementid = 786151

  left outer join trackedentitydatavalue as noteData
    on psi.programstageinstanceid = noteData.programstageinstanceid
      and noteData.dataelementid = 244949

where ( '${ouid}' = 'ALL' OR ou.uid = '${ouid}' )

order by ou.uid, psi.executiondate;