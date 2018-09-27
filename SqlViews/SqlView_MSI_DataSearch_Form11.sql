select distinct p.startdate, p.enddate
from datavalue as dv
  inner join organisationunit as ou
    on dv.sourceid = ou.organisationunitid
  inner join dataelement as de
    on dv.dataelementid = de.dataelementid
  inner join period as p
    on dv.periodid = p.periodid
where ou.path LIKE '%/${ouid}%'
and de.uid in ( 'K7wCU6apTwc', 'DS6lHr4eEnw', 'In8fazkWqO5', 'otjftbeXFW2', 'By1ehX6g7Iv', 'o0i2ESQppT5', 'R3JYgPw22T2', 'CSQts1sZhE9', 'uSpx4DHdae6', 'RpslYBBLJ2Q', 'n1gp668Y4Hq', 'ap3kA4OU2UO', 'gtRZqUPY4r0' )
and deleted = false
and ( '${startDate}' = 'ALL' OR p.enddate >= to_date( '${startDate}', 'YYYY-MM-DD' ) ) 
and ( '${endDate}' = 'ALL' OR p.startdate <= to_date( '${endDate}', 'YYYY-MM-DD' ) ) 
order by p.startdate;