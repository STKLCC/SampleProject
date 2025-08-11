ALTER TABLE SyncProfile
ADD COLUMN EmailProfileId BIGINT UNSIGNED DEFAULT NULL AFTER TargetProfileId,
ADD CONSTRAINT FK_SyncProfile_EmailProfileId FOREIGN KEY (EmailProfileId) REFERENCES DataIntegrationHub.EmailProfile(Id);