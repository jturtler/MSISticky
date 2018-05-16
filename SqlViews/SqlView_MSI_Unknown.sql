select ou.uid, 'aggr' as "type", dv.value as "value", prgorg.programid as "prgrel"
from datavalue as dv
  inner join period as p
    on p.periodid = dv.periodid 
      and p.periodtypeid = 3 
  inner join organisationunit as ou
    on ou.organisationunitid = dv.sourceid

  inner join dataelement as de
    on dv.dataelementid = de.dataelementid

  left outer join program_organisationunits as prgorg
    on ou.organisationunitid = prgorg.organisationunitid
    and prgorg.programid = (select programid from program where uid = '${prgid}')
      
where de.uid = '${unknowndeid}'
 AND p.startdate = to_date( '${startDate}', 'YYYY-MM-DD' )
 AND ( '${ouid}' = 'ALL' OR ou.path like '%/${ouid}/%' )
 AND dv.deleted = false
-- ABOVE: Aggregate data - with 'unknown' status and 'program relationship' - values: 0, 1, ''

UNION ALL

-- Events Count on orgUnits in the program
select ou.uid, 'event' as "type", CAST( count(psi.programstageinstanceid) as text ) as "value", prgorg.programid as "prgrel"
from organisationunit as ou
  inner join program_organisationunits prgorg 
    on ou.organisationunitid = prgorg.organisationunitid

  inner join program as prg
    on prgorg.programid = prg.programid
      and prg.uid = '${prgid}'
	
  inner join programstage as ps
    on prgorg.programid = ps.programid

  left outer join programstageinstance as psi 
    on psi.programstageid = ps.programstageid
      and psi.organisationunitid = ou.organisationunitid

where ( '${ouid}' = 'ALL' ou.path like '%/${ouid}/%' )

group by ou.uid, prgorg.programid

order by type, value;