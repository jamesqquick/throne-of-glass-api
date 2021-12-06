CREATE TABLE `Characters` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `species` varchar(255) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
)