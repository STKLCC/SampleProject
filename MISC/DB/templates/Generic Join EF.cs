using DataIntegrationHub.Shared.Common.Services.MicroServices.Auth;
using DataIntegrationHub.Shared.Common.Utils.MeshToken;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace DataIntegrationHub.Shared.Common.Utils.QueryHelper
{
    public static class QueryHelper
    {
        public static async Task<List<TResult>> SingleJoinedQuery<TRepoA, TRepoB, TKeyJoin, TResult>(
            Func<Task<IQueryable<TRepoA>>> repoA,
            Func<Task<IQueryable<TRepoB>>> repoB,
            Expression<Func<TRepoA, TKeyJoin>> joinKeyA,
            Expression<Func<TRepoB, TKeyJoin>> joinKeyB,
            Expression<Func<TRepoA, bool>>? filterA,
            Expression<Func<TRepoB, bool>>? filterB,
            Expression<Func<TRepoA, TRepoB, TResult>> mapper)
        {
            var queryableA = await repoA(); var queryableB = await repoB();

            if (filterA != null) queryableA = queryableA.Where(filterA);
            if (filterB != null) queryableB = queryableB.Where(filterB);

            var query = queryableA.Join(queryableB, joinKeyA, joinKeyB, mapper);

            return [.. query];
        }

        public static async Task<List<TResult>> DualJoinedQuery<TA, TB, TC, TKeyAB, TKeyAC, TResult>(
             Func<Task<IQueryable<TA>>> repoA,
             Func<Task<IQueryable<TB>>> repoB,
             Func<Task<IQueryable<TC>>> repoC,
             Expression<Func<TA, TKeyAB>> joinKeyA_B,
             Expression<Func<TB, TKeyAB>> joinKeyB_A,
             Expression<Func<TA, TKeyAC>> joinKeyA_C,
             Expression<Func<TC, TKeyAC>> joinKeyC_A,
             Expression<Func<TA, bool>>? filterA,
             Expression<Func<TB, bool>>? filterB,
             Expression<Func<TC, bool>>? filterC,
             Expression<Func<TA, TB, TC, TResult>> mapper)
        {
            var queryableA = await repoA();
            var queryableB = await repoB();
            var queryableC = await repoC();

            if (filterA != null) queryableA = queryableA.Where(filterA);
            if (filterB != null) queryableB = queryableB.Where(filterB);
            if (filterC != null) queryableC = queryableC.Where(filterC);

            var joinedAB = queryableA.Join(
                queryableB,
                joinKeyA_B,
                joinKeyB_A,
                (a, b) => new { a, b });

            var joinedABC = joinedAB.Join(
                queryableC,
                x => EF.Property<TKeyAC>(x.a!, ((MemberExpression)joinKeyA_C.Body).Member.Name),
                joinKeyC_A,
                (x, c) => new { x.a, x.b, c });

            var compiledMapper = mapper.Compile();
            var query = joinedABC.AsEnumerable().Select(x => compiledMapper(x.a, x.b, x.c));

            return [.. query];
        }
    }
}


//  var stopwatch3 = Stopwatch.StartNew();

//  var propertyReportEvents = await QueryHelper.SingleJoinedQuery(
//      repoA : () => _syncHistoryPropertyRepository.GetQueryableAsync(),
//      repoB : () => _commonPropertyRepository.GetQueryableAsync(),
//      joinKeyA : x => x.CommonPropertyId,
//      joinKeyB : y => y.Id,
//      filterA : x => x.SyncHistoryId == _scopeService.SyncHistory.Id ,//&& x.Remark != null && x.Status == SyncStatusEnum.Failed,
//      filterB : null,
//      mapper: (x, property) => new ReportEvent
//      {
//          EventNameWithPropertyCode = property.Code ?? "Unknown Property",
//          ReferenceCodeList = "",
//          ErrorMessageDetail = x.Remark
//      });

//  stopwatch3.Stop();
//  var duration3 = stopwatch3.ElapsedMilliseconds;
//  var stopwatch4 = Stopwatch.StartNew();
//   stopwatch4.Stop();
//  var duration4 = stopwatch4.ElapsedMilliseconds;

//  var stopwatch = Stopwatch.StartNew();

//  var unitReportEvents2 = await QueryHelper.DualJoinedQuery(
//      repoA: () => _syncHistoryUnitRepository.GetQueryableAsync(),
//      repoB: () => _commonPropertyRepository.GetQueryableAsync(),
//      repoC: () => _commonUnitRepository.GetQueryableAsync(),
//      joinKeyA_B: a => a.CommonPropertyId,
//      joinKeyB_A: b => b.Id,
//      joinKeyA_C: a => a.CommonUnitId,
//      joinKeyC_A: c => c.Id,
//      filterA: a => a.SyncHistoryId == _scopeService.SyncHistory.Id ,//&& a.Remark != null && a.Status == SyncStatusEnum.Failed,
//      filterB: null,
//      filterC: null,
//      mapper: (a, b, c) => new ReportEvent
//      {
//          EventNameWithPropertyCode = b.Code ?? "Unknown Property",
//          ReferenceCodeList = c.UnitNumber ?? "Unknown Unit",
//          ErrorMessageDetail = a.Remark
//      }
//  );

//  stopwatch.Stop();
//  var duration = stopwatch.ElapsedMilliseconds;

//  var stopwatch2 = Stopwatch.StartNew();

// stopwatch2.Stop();
// var duration2 = stopwatch2.ElapsedMilliseconds;