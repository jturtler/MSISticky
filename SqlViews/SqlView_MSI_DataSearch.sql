select p.startdate, p.enddate
from datavalue as dv
  inner join organisationunit as ou
    on dv.sourceid = ou.organisationunitid
  inner join dataelement as de
    on dv.dataelementid = de.dataelementid
  inner join period as p
    on dv.periodid = p.periodid
where ou.uid = '${ouid}'
and de.uid = '${deid}'
and deleted = false
and ( '${startDate}' = 'ALL' OR p.enddate >= to_date( '${startDate}', 'YYYY-MM-DD' ) ) 
and ( '${endDate}' = 'ALL' OR p.startdate <= to_date( '${endDate}', 'YYYY-MM-DD' ) ) 
order by p.startdate;