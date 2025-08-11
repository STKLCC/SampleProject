ALTER TABLE SyncHistoryUnit
ADD COLUMN CommonPropertyId BIGINT UNSIGNED DEFAULT NULL BEFORE Operation,
ADD CONSTRAINT FK_SyncHistoryUnit_CommonPropertyId FOREIGN KEY (CommonPropertyId) REFERENCES DataIntegrationHub.CommonProperty(Id);

ALTER TABLE SyncHistoryResident
ADD COLUMN CommonPropertyId BIGINT UNSIGNED DEFAULT NULL BEFORE Operation,
ADD CONSTRAINT FK_SyncHistoryResident_CommonPropertyId FOREIGN KEY (CommonPropertyId) REFERENCES DataIntegrationHub.CommonProperty(Id);

ALTER TABLE SyncHistoryLease
ADD COLUMN CommonPropertyId BIGINT UNSIGNED DEFAULT NULL BEFORE Operation,
ADD CONSTRAINT FK_SyncHistoryLease_CommonPropertyId FOREIGN KEY (CommonPropertyId) REFERENCES DataIntegrationHub.CommonProperty(Id);

ALTER TABLE SyncHistory
ADD COLUMN TraceId NVARCHAR(255) DEFAULT NULL COMMENT 'Log Trace Id' BEFORE CreationTime,
ADD COLUMN RelatedAPI NVARCHAR(255) DEFAULT NULL COMMENT 'API Called' AFTER TraceId;


ALTER TABLE SyncProfile
ADD COLUMN EmailProfileId BIGINT UNSIGNED DEFAULT NULL AFTER TargetProfileId,
ADD CONSTRAINT FK_SyncProfile_EmailProfileId FOREIGN KEY (EmailProfileId) REFERENCES DataIntegrationHub.EmailProfile(Id);