using DataIntegrationHub.Shared.Common.Dto;
using DataIntegrationHub.Shared.Common.Entities;
using DataIntegrationHub.Shared.Common.Enums;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System;
using System.Collections;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Reflection.Metadata.Ecma335;
using System.Text;
using System.Threading.Tasks;
using static GraphQL.Validation.Rules.OverlappingFieldsCanBeMerged;

namespace DataIntegrationHub.Shared.Common.Services.MicroServices.Email.Dtos
{
    #region Enum

    public enum SyncActionType
    {
        [Description("N/A")]
        Others = 999,
        [Description("Create")]
        Create = 1,
        [Description("Update")]
        Update = 2
    }

    public enum ReportEntityType
    {
        [Description("N/A")]
        Others = 999,
        [Description("Property")]
        Property = 1,
        [Description("Unit")]
        Unit = 2,
        [Description("Lease")]
        Lease = 3,
        [Description("Resident")]
        Resident = 4,
        [Description("Location")]
        Location = 5
    }

    #endregion

    #region Email Report
    public class EmailReportDto
    {
        //0 - retry count, 1 - max retry, 2 - Platform, 3 - Endpoint, 4 - Status Code, 5 - Message
        public const string ApiCallErrorMessage = "Retry Attempt(s): {0}/{1}\nAPI ({2}): {3}, Status Code: {4}\nError Message: [{2}][{3}] {5}";

        // 0 - Platform, 1 Common Property Code, 2 - Message
        public const string ErrorMessage = "Error Message: [{0}][{1}] {2}";

        // 0 - Common Property Code, 1 - Message
        public const string DefaultMessage = "[{0}]\n{1}";

        //
        public bool SuccessfullySent { get; set; } = false;

        #region Email Content
        public string? SyncClientName { get; set; } = "EQR";
        public string? MajorEntityType { get; set; } = "location";
        public string? TraceId { get; set; } = Guid.NewGuid().ToString();
        public DateTime StartDateTime { get; set; } = DateTime.UtcNow;
        public DateTime EndDateTime { get; set; } = DateTime.UtcNow;
        public List<RelatedApi> ApiContentList { get; set; } = new List<RelatedApi>();
        public List<ReportByEntityType> EmailReportListByEntityType { get; set; } = new List<ReportByEntityType>();
        public List<ReportEvent> TableContentList { get; set; } = new List<ReportEvent>();

        #endregion

        //
        public List<SyncSumaryResultDtoWithType> SummaryList { get; set; } = new ();
        public bool TriggerSendEmail { get; set; } = false;

        public EmailReportDto() { }        
        
        public void AddEntityContent(
            List<SyncSummaryResultDto> summary,
            List<ReportEvent> eventList)
        {
            if (summary?.Count > 0)
            {
                this.SummaryList.AddRange(summary.Select(x => new SyncSumaryResultDtoWithType(x)));
            }            
            if(eventList?.Count > 0)
            {
                this.TableContentList.AddRange(eventList);
                this.TriggerSendEmail = true;
            }
        }

        public void AddEntityContent(
            SyncSummaryResultDto summary,
            ReportEvent reportEvent)
        {
            this.SummaryList.Add(new SyncSumaryResultDtoWithType(summary));
            this.TableContentList.Add(reportEvent);
            this.TriggerSendEmail = true;
        }

        public void AddTableContent(ReportEvent eventList)
        {
            this.TableContentList.Add(eventList);
        }

        //public void Render

        public void AddTableContentList(List<ReportEvent> eventList)
        {
            this.TableContentList.AddRange(eventList);
        }

        public void SetReportListByEntityType()
        {

            var entityList = this.SummaryList.Select(x=>x.EntityType).Distinct().ToList();
            foreach(var entity in entityList)
            {
                this.EmailReportListByEntityType.Add(new ReportByEntityType(this.SummaryList.Where(x => x.EntityType == entity).ToList(), entity));
            }
        }
    }

    #endregion

    #region Report Content

    public class RelatedApi
    {
        public string? Platform { get; set; } 
        public string? CalledApiList { get; set; }
    }

    public class ReportEvent
    {
        public string? EventNameWithPropertyCode { get; set; }
        public string? ReferenceCodeList { get; set; }
        public string? ErrorMessageDetail { get; set; }

        public ReportEvent() { }
    }

    public class ReportByEntityType
    {
        public string? EntityType { get; set; }
        public int CreateSuccessCount { get; set; }
        public int UpdateSuccessCount { get; set; }
        public int CreateFailedCount { get; set; }
        public int UpdateFailedCount { get; set; }

        public ReportByEntityType() { }
        public ReportByEntityType(List<SyncSumaryResultDtoWithType> summaryList, ReportEntityType entityType)
        {
            this.CreateSuccessCount = summaryList.Where(x => x.ActionType == SyncActionType.Create).Select(x => x.Summary.SuccessCount).FirstOrDefault();
            this.UpdateSuccessCount = summaryList.Where(x => x.ActionType == SyncActionType.Create).Select(x => x.Summary.SuccessCount).FirstOrDefault();
            this.CreateFailedCount = summaryList.Where(x => x.ActionType == SyncActionType.Update).Select(x => x.Summary.FailedCount).FirstOrDefault();
            this.UpdateFailedCount = summaryList.Where(x => x.ActionType == SyncActionType.Update).Select(x => x.Summary.FailedCount).FirstOrDefault();
            this.EntityType = entityType.ToString();
        }
    }

    public class SyncSumaryResultDtoWithType
    {
        public SyncActionType ActionType { get; set; }
        public ReportEntityType EntityType { get; set; }
        public SyncSummaryResultDto Summary { get; set; }

        public SyncSumaryResultDtoWithType(SyncSummaryResultDto summary)
        {
            this.EntityType = summary.Type switch
            {
                var s when s.Contains("Property") => ReportEntityType.Property,
                var s when s.Contains("Locations") => ReportEntityType.Unit,
                var s when s.Contains("Leases") => ReportEntityType.Lease,
                var s when s.Contains("Residents") => ReportEntityType.Resident,
                _ => ReportEntityType.Others,
            };

            this.ActionType = summary.Type switch
            {
                var s when s.Contains("Create") => SyncActionType.Create,
                var s when s.Contains("Update") => SyncActionType.Update,
                _ => SyncActionType.Others,
            };
            this.Summary = summary;
        }
    }
    #endregion


    //public class SyncSummaryReport
    //{
    //    public List<SyncSumaryResultDtoWithType> SummaryList { get; set; } = new ();
    //    public SyncSummaryReport() { }
    //    public SyncSummaryReport(List<SyncSummaryResultDto> summary)
    //    {
    //        if (summary?.Count > 0)
    //        {
    //            this.SummaryList.AddRange(summary.Select(x => new SyncSumaryResultDtoWithType(x)));
    //        }            
    //    }

    //    public ReportListByEntityType GetReportListByEntityType(ReportEntityType entityType)
    //    {
    //        return new ReportListByEntityType(this.SummaryList.Where(x => x.EntityType == entityType).ToList(), entityType);
    //    }
    //}
}
//var reportEventList = syncHistoryUnitList.Where(x => x.Status == SyncStatusEnum.Failed).Select(y => new ReportEvent
//{
//    EventNameWithPropertyCode = commonProperty.Code, 
//    ReferenceCodeList = y.CommonUnitId.ToString(), 
//    ErrorMessageDetail = y.Remark
//}).ToList();

//async unit =>
//{
//    var getProperty = _commonPropertyRepository.GetAsync(z => z.Id == unit.CommonPropertyId);
//    var getUnit = _commonUnitRepository.GetAsync(z => z.Id == unit.CommonUnitId);
//    await Task.WhenAll(getProperty, getUnit);

//    var propertyInfo = getProperty.Result;
//    var unittInfo = getUnit.Result;

//    return new ReportEvent
//    {
//        EventNameWithPropertyCode = propertyInfo?.Code ?? "Unknown Property",
//        ReferenceCodeList = unittInfo?.UnitNumber ?? "Unknown Unit",
//        ErrorMessageDetail = unit.Remark
//    };
//}

//async property =>
//{
//    var getProperty = _commonPropertyRepository.GetAsync(z => z.Id == property.CommonPropertyId);
//    await Task.WhenAll(getProperty);

//    var propertyInfo = getProperty.Result;

//    return new ReportEvent
//    {
//        EventNameWithPropertyCode = propertyInfo?.Code ?? "Unknown Property",
//        ReferenceCodeList = "",
//        ErrorMessageDetail = property.Remark
//    };
//}

//var propertyReportEvents = await GetReportEventsAsync(
//    () => _syncHistoryPropertyRepository.GetListAsync(x =>
//        x.SyncHistoryId == _scopeService.SyncHistory.Id
//        && x.Remark != null && x.Status == SyncStatusEnum.Failed
//        ),
//    async (db, property) =>
//    {
//        var propertyInfo = await db.CommonProperty.FirstOrDefaultAsync(z => z.Id == property.CommonPropertyId);

//        return new ReportEvent
//        {
//            EventNameWithPropertyCode = propertyInfo?.Code ?? "Unknown Property",
//            ReferenceCodeList = "",
//            ErrorMessageDetail = property.Remark
//        };
//    },
//    maxConcurrency: 5

//);

//var unitReportEvents = await GetReportEventsAsync(
//    () => _syncHistoryUnitRepository.GetListAsync(x =>
//        x.SyncHistoryId == _scopeService.SyncHistory.Id
//        //&& x.Remark != null && x.Status == SyncStatusEnum.Failed
//        ),
//    async (db, unit) =>
//    {
//        var propertyInfo = await db.CommonProperty.FirstOrDefaultAsync(z => z.Id == unit.CommonPropertyId);
//        var unitInfo = await db.CommonUnit.FirstOrDefaultAsync(z => z.Id == unit.CommonUnitId);

//        return new ReportEvent
//        {
//            EventNameWithPropertyCode = propertyInfo?.Code ?? "Unknown Property",
//            ReferenceCodeList = unitInfo?.UnitNumber ?? "Unknown Unit",
//            ErrorMessageDetail = unit.Remark
//        };
//    },
//    maxConcurrency: 5 
//);


    // private async Task<List<ReportEvent>> GetReportEventsAsync<T>(
    // Func<Task<List<T>>> getListFunc,
    // Func<EntityFrameworkCoreDbContext, T, Task<ReportEvent>> mapFunc,
    // int maxConcurrency = 10)
    // {
    //     var items = await getListFunc();
    //     var semaphore = new SemaphoreSlim(maxConcurrency);

    //     var tasks = items.Select(async item =>
    //     {
    //         await semaphore.WaitAsync();
    //         try
    //         {
    //             using var scope = _serviceProvider.CreateScope();
    //             var dbContext = scope.ServiceProvider.GetRequiredService<EntityFrameworkCoreDbContext>();

    //             return await mapFunc(dbContext, item);
    //         }
    //         finally
    //         {
    //             semaphore.Release();
    //         }
    //     });

    //     return (await Task.WhenAll(tasks)).ToList();
    // }

//      private async Task<List<ReportEvent>> GetReportEventsAsync<T>(
//  Func<Task<List<T>>> getListFunc,
//  Func<T, Task<ReportEvent>> mapFunc)
//  {
//      var items = await getListFunc();
//      var eventTasks = items.Select(mapFunc);
//      return (await Task.WhenAll(eventTasks)).ToList();
//  }

// var leaseReportEvents = await GetReportEventsAsync(
//     () => _syncHistoryLeaseRepository.GetListAsync(x =>
//         x.SyncHistoryId == _scopeService.SyncHistory.Id
//         && x.Remark != null
//         && x.Status == SyncStatusEnum.Failed),
//     async lease =>
//     {
//         var getProperty = _commonPropertyRepository.GetAsync(z => z.Id == lease.CommonPropertyId);
//         var getLease = _commonLeaseRepository.GetAsync(z => z.Id == lease.CommonLeaseId);
//         await Task.WhenAll(getProperty, getLease);

//         var propertyInfo = await getProperty;
//         var leaseInfo = await getLease;

//         return new ReportEvent
//         {
//             EventNameWithPropertyCode = propertyInfo?.Code ?? "Unknown Property",
//             ReferenceCodeList = leaseInfo?.RefNumber ?? "Unknown Lease",
//             ErrorMessageDetail = lease.Remark
//         };
//     }
// );

// var residentReportEvents = await GetReportEventsAsync(
//     () => _syncHistoryResidentRepository.GetListAsync(x =>
//         x.SyncHistoryId == _scopeService.SyncHistory.Id
//         && x.Remark != null
//         && x.Status == SyncStatusEnum.Failed),
//     async resident =>
//     {
//         var getProperty = _commonPropertyRepository.GetAsync(z => z.Id == resident.CommonPropertyId);
//         var getResident = _commonResidentRepository.GetAsync(z => z.Id == resident.CommonResidentId);
//         await Task.WhenAll(getProperty, getResident);

//         var propertyInfo = await getProperty;
//         var residentInfo = await getResident;

//         return new ReportEvent
//         {
//             EventNameWithPropertyCode = propertyInfo?.Code ?? "Unknown Property",
//             ReferenceCodeList = residentInfo?.RefNumber ?? "Unknown Resident",
//             ErrorMessageDetail = resident.Remark
//         };
//     }

// );