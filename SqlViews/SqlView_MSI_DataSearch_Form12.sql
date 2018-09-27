select distinct p.startdate, p.enddate
from datavalue as dv
  inner join organisationunit as ou
    on dv.sourceid = ou.organisationunitid
  inner join dataelement as de
    on dv.dataelementid = de.dataelementid
  inner join period as p
    on dv.periodid = p.periodid
where ou.path LIKE '%/${ouid}%'
and de.uid in ( 'IXd6OFCZAfl', 'lwhzwU6nrJh', 'RDAsWi4QOmo', 'Mo76PCg8nZf', 'WlwUwXL7zjg', 'GZYmBByQIpc', 'pPusa1XgLvR', 'gzItNuOawEm', 'TvP8vLtLokJ', 'cpcwuFL4P63', 'n6ebQdtTEg0', 'mB0Z390lvLE', 'DmGOQFmcuqf', 'h0RirtCDuE6', 'jLevV7SYpaY', 'DRvlWf9T4tg', 'hXLyGfE2sFi', 'k0Ws0xA2vDj' )
and deleted = false
and ( '${startDate}' = 'ALL' OR p.enddate >= to_date( '${startDate}', 'YYYY-MM-DD' ) ) 
and ( '${endDate}' = 'ALL' OR p.startdate <= to_date( '${endDate}', 'YYYY-MM-DD' ) ) 
order by p.startdate;