-- DataIntegrationHub.Email definition

CREATE TABLE `EmailProfile` (
  `Id` int unsigned NOT NULL AUTO_INCREMENT,
  `Username` varchar(255) NOT NULL,
  `Password` varchar(255) NOT NULL,
  `FromUser` varchar(255) NOT NULL,
  `ToUser` varchar(255) NOT NULL,
  `CcUser` varchar(255) DEFAULT NULL,
  `Active` tinyint NOT NULL DEFAULT 1,
  `CreationTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `CreatorId` varchar(36) DEFAULT NULL,
  `LastModificationTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `LastModifierId` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`Id`)
) 
COMMENT = 'Data Integration Hub;Stores sync history email profile';

ALTER TBALE 