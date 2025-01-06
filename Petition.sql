-- MySQL dump 10.13  Distrib 8.0.34, for macos13 (x86_64)
--
-- Host: localhost    Database: cw2_2024_new
-- ------------------------------------------------------
-- Server version	8.2.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `bioid`
--

DROP TABLE IF EXISTS `bioid`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bioid` (
  `code` varchar(20) NOT NULL,
  `used` int DEFAULT NULL,
  PRIMARY KEY (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bioid`
--

LOCK TABLES `bioid` WRITE;
/*!40000 ALTER TABLE `bioid` DISABLE KEYS */;
INSERT INTO `bioid` VALUES ('1K3JTWHA05',0),('1PUQV970LA',0),('2BIB99Z54V',0),('2WYIM3QCK9',0),('30MY51J1CJ',0),('340B1EOCMG',0),('49YFTUA96K',0),('4HTOAI9YKO',0),('6EBQ28A62V',0),('6X6I6TSUFG',0),('7DMPYAZAP2',0),('88V3GKIVSF',0),('8OLYIE2FRC',0),('9JSXWO4LGH',0),('ABQYUQCQS2',0),('AT66BX2FXM',0),('BPX8O0YB5L',0),('BZW5WWDMUY',0),('C7IFP4VWIL',0),('CCU1D7QXDT',0),('CET8NUAE09',0),('CG1I9SABLL',0),('D05HPPQNJ4',0),('DHKFIYHMAZ',0),('E7D6YUPQ6J',0),('F3ATSRR5DQ',0),('FH6260T08H',0),('FINNMWJY0G',0),('FPALKDEL5T',0),('GOYWJVDA8A',0),('H5C98XCENC',0),('JHDCXB62SA',0),('K1YL8VA2HG',0),('LZK7P0X0LQ',0),('O0V55ENOT0',0),('O3WJFGR5WE',0),('PD6XPNB80J',0),('PGPVG5RF42',0),('QJXQOUPTH9',0),('QTLCWUS8NB',0),('RYU8VSS4N5',0),('S22A588D75',0),('SEIQTS1H16',0),('TLFDFY7RDG',0),('TTK74SYYAN',0),('V2JX0IC633',0),('V30EPKZQI2',0),('VQKBGSE3EA',0),('X16V7LFHR2',0),('Y4FC3F9ZGS',0);
/*!40000 ALTER TABLE `bioid` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `petitioners`
--

DROP TABLE IF EXISTS `petitioners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `petitioners` (
  `petitioner_email` varchar(100) NOT NULL,
  `fullname` varchar(100) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `password_hash` text,
  `bioid` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`petitioner_email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `petitioners`
--

LOCK TABLES `petitioners` WRITE;
/*!40000 ALTER TABLE `petitioners` DISABLE KEYS */;
/*!40000 ALTER TABLE `petitioners` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `petitions`
--

DROP TABLE IF EXISTS `petitions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `petitions` (
  `petition_id` int NOT NULL AUTO_INCREMENT,
  `petitioner_email` varchar(100) DEFAULT NULL,
  `title` varchar(100) DEFAULT NULL,
  `content` longtext,
  `status` varchar(45) DEFAULT 'open',
  `response` longtext,
  `signature_count` int DEFAULT NULL,
  PRIMARY KEY (`petition_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `petitions`
--

LOCK TABLES `petitions` WRITE;
/*!40000 ALTER TABLE `petitions` DISABLE KEYS */;
/*!40000 ALTER TABLE `petitions` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-11-08 16:14:55
