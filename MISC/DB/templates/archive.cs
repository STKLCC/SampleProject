//var stageIds = result.Where(s => s.StatusId != 0).Select(s => s.Id).ToList();
//var combistr = string.Join(",", stageIds);
//dynamic dynamicSvc = _makeReadyTaskAppService;
//var tasks1 = await dynamicSvc.GetByStageIdsAsync(combistr);
//var taskGroups = tasks.GroupBy(t => t.MakeReadyStageId).ToDictionary(g => g.Key, g => g.ToList().Count());
//public async Task<object> GetStageList(string projectId)
//{
//    try
//    {
//        _logger.LogInformation("Retrieving make stage projects for ProjectId: {ProjectId}", projectId);
//        var result = await _makeReadyStageAppService.GetListAsync(new MakeReadyStageListQueryModel { ProjectIds = new string[] { projectId } });
//        return result;
//    }
//    catch (Exception ex)
//    {
//        _logger.LogError(ex, "Failed to retrieve make ready stage for ProjectId: {ProjectId}", projectId);
//        throw new DomainServiceException(
//            $"Failed to retrieve make ready stage: {ex.Message}",
//            "MakeReadyService",
//            "GetListAsync",
//            "MAKEREADY_SERVICE_ERROR");
//    }
//}