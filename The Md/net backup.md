
### UNIT TRANSFER ONE OUTBOUND

```c#

#region recycle
//var transfers = await transferQ.Where(t => gorupedTransfer.Keys.Contains(t.FromCommonLeaseId))
//    .ToDictionaryAsync(t => t.FromCommonLeaseId);

// for the lease, get resident move out date
//var leases = await leaseQ.Where(l => gorupedTransfer.Keys.Contains(l.Id)).ToDictionaryAsync(l => l.Id);

//var resident = await residentQ
//    .Where(l => groupedResident.Keys.Contains(l.CommonLeaseId))
//    .ToDictionaryAsync(l => l.Id);

//var unitIds = result.Select(l => l.UnitId).ToHashSet();
//var units = await unitQ.Where(u => unitIds.Contains(u.Id)).ToDictionaryAsync(u => u.Id);


//await _commonUnitTransferRepository.UpdateManyAsync(transfers, autoSave: true);
//transfers.ForEach(t =>
//{
//    var residentNum = residentList.First(r => r.TransferId == t.Id).ResidentNum;
//    var failed = result.ValidationMessages.Any(m => !string.IsNullOrWhiteSpace(m.Message) && m.Message.Contains(residentNum));
//    t.Status = failed ? UnitTransferOutboundStatusEnum.Failed : UnitTransferOutboundStatusEnum.Success;
//    await _commonUnitTransferRepository.UpdateAsync(t, autoSave: true);
//});


//transfer.Status = response.ValidationMessages.Any(m => !string.IsNullOrWhiteSpace(m.Message) && deactivateList.Any(r => m.Message.Contains(r.ResidentNum)))
//   ? UnitTransferOutboundStatusEnum.Failed
//   : UnitTransferOutboundStatusEnum.Success;

//await Task.WhenAll(
//    residentList.GroupBy(r => r.LocationNumber).Select(g => _lessenOneService.DeactivateResidents( 
//        lessenOneHttpProfile, 
//        g.Key, 
//        [.. g.Select(r => new LessenOneDeactivateResidentDto { ResidentNum = r.ResidentNum, MoveOutDate = r.MoveOutDate })]
//        ))
//    );
//var groupedResident = residentList.GroupBy(r => r.LocationNumber).ToDictionary(g => g.Key, g => g.ToList());


//if (!transfers.TryGetValue(leaseId, out var transfer) || !leases.TryGetValue(leaseId, out var lease) || !units.TryGetValue(lease.CommonUnitId, out var unit))
//    continue;

//transfer!.Status = UnitTransferOutboundStatusEnum.InProgress;
//var property = commonProperties.FirstOrDefault(x => x.Id == unit!.CommonPropertyId);
//var locationNumber = LocationHelper.GetLocationNumber(property?.Code, unit?.UnitNumber, PropertyTypeEnum.MFR);
//var deactivateResidentList = ObjectMapper.Map<List<CommonResident>, List<LessenOneDeactivateResidentDto>>(residentList);
#endregion


```