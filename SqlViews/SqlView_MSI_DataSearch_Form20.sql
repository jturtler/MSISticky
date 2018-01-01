select distinct p.startdate, p.enddate
from datavalue as dv
  inner join organisationunit as ou
    on dv.sourceid = ou.organisationunitid
  inner join dataelement as de
    on dv.dataelementid = de.dataelementid
  inner join period as p
    on dv.periodid = p.periodid
where ou.uid = '${ouid}'
and de.uid in ( select av.value
    from program as p
    inner join programattributevalues as pav
    on pav.programid = p.programid
    inner join attributevalue as av
    on av.attributevalueid = pav.attributevalueid
    where uid = '${prgid}' )
and deleted = false
and ( '${startDate}' = 'ALL' OR p.enddate >= to_date( '${startDate}', 'YYYY-MM-DD' ) ) 
and ( '${endDate}' = 'ALL' OR p.startdate <= to_date( '${endDate}', 'YYYY-MM-DD' ) ) 
order by p.startdate;