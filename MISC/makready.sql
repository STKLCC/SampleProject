
select distinct a.name, b.Name, c.MakeReadyStageTypeSysEnumId, c.MakeReadyStageStatusTypeSysEnumId from dbo.MakeReadyStage c 
join dbo.MakeReadyStageConfig a on c.MakeReadyStageConfigId = a.Id
join dbo.MakeReadyStageConfigTemplate b on a.MakeReadyStageConfigTemplateId = b.Id


select * from MakeReadyStage where MakeReadyStageStatusTypeSysEnumId = 6

select * from MakeReadyProject where Id = 1830471494946541568