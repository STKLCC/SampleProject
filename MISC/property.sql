SELECT TOP 3 * FROM MriProperty order by CreationTime desc
-- name, city, state, zipcode, inactive, isdeleted

SELECT TOP 3 * FROM MriPropertyUnit order by CreationTime desc
-- unitid, unitstatus, propertyid, buildingid, number of rooms/bath, isdeleted

SELECT TOP 3 * FROM MriPropertyUnitLease order by CreationTime desc
SELECT TOP 3 * FROM MriPropertyUnitOccupancyUpdate order by CreationTime desc

--