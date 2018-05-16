select psi.uid
 , ou.uid
 , to_char( psi.executiondate,'YYYYMM')
 , psi.executiondate  --- ?? eventdate?
 , stsdata.value
 , expdate.value
 , psi.programstageid
 , ( select count(*) 
    from programstageinstance as t_psi 
    where t_psi.executiondate > psi.executiondate 
      and t_psi.organisationunitid = psi.organisationunitid
      and t_psi.programstageid = psi.programstageid ) AS "laterEvents"

from programstageinstance as psi
  inner join organisationunit ou
    on ou.organisationunitid = psi.organisationunitid

  inner join programstage as ps
    on psi.programstageid = ps.programstageid

  inner join program as prg
    on ps.programid = prg.programid
      and prg.uid = '${prgid}'
--      and prg.uid = 'qaT1muhnoR2'
      
  left outer join trackedentitydatavalue as stsdata
    on psi.programstageinstanceid = stsdata.programstageinstanceid
      and stsdata.dataelementid = (select dataelementid from dataelement where uid = 'Ilc4iUWAoGo' limit 1 ) --  244952
      
  left outer join trackedentitydatavalue as expdate
    on psi.programstageinstanceid = expdate.programstageinstanceid
      and expdate.dataelementid = (select dataelementid from dataelement where uid = 'aKFgqbuX0gi' limit 1 ) --  244953


where ( '${startDate}' = 'ALL' OR psi.executiondate >= to_timestamp( '${startDate}', 'YYYY-MM-DD' ) ) 
 and ( '${endDate}' = 'ALL' OR psi.executiondate <= to_timestamp( '${endDate}', 'YYYY-MM-DD' ) ) 
 and ( '${mode}' <> '3Days' OR ( current_timestamp - interval '3 days' ) <= psi.lastupdated )
 and ( '${ouid}' = 'ALL' OR ou.path like '%/${ouid}/%' )
--  and ( ou.uid = 'tyogguMf4CI' )

order by ou.uid, psi.executiondate;