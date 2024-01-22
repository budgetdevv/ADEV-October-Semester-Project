-- MySQL Script generated by MySQL Workbench
-- Fri Oct 27 22:02:05 2023
-- Model: New Model    Version: 1.0
-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

DROP DATABASE IF EXISTS `restaurant_review`;

CREATE DATABASE IF NOT EXISTS `restaurant_review`
DEFAULT CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
-- -----------------------------------------------------
-- Schema restaurant_review
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema restaurant_review
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `restaurant_review` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci ;
USE `restaurant_review` ;

-- -----------------------------------------------------
-- Table `restaurant_review`.`RESTAURANT`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `restaurant_review`.`RESTAURANT` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `address` VARCHAR(1000) NOT NULL,
  `description` VARCHAR(1000) NOT NULL,
  `rating` FLOAT(3,2) NULL DEFAULT NULL,
  `cuisine_type` VARCHAR(40) NULL DEFAULT NULL,
  `opening_date` DATE NULL DEFAULT NULL,
  `image_url` VARCHAR(1000) NULL DEFAULT NULL, -- This is the new column for image URLs
  PRIMARY KEY (`id`))
ENGINE = InnoDB
AUTO_INCREMENT = 1
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table `restaurant_review`.`review`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `restaurant_review`.`review` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `restaurant_id` INT NOT NULL,
  `content` VARCHAR(255) NOT NULL,
  `date` DATE NOT NULL,
  `reviewer_name` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `review_restuarant_id_idx` (`restaurant_id` ASC) VISIBLE,
  CONSTRAINT `review_restuarant_id`
    FOREIGN KEY (`restaurant_id`)
    REFERENCES `restaurant_review`.`RESTAURANT` (`id`)
    ON DELETE CASCADE)
ENGINE = InnoDB
AUTO_INCREMENT = 1
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

-- INSERT INTO `restaurant_review`.`RESTAURANT`
-- (`name`, `address`, `description`, `rating`, `cuisine_type`, `opening_date`, `image_url`) VALUES
-- ('Tasty Foods', '123 Flavor Street, Foodsville, FS', 'A delightful place for traditional dishes', 4.2, 'Traditional', '2010-06-15', 'images/tasty_food.png'),
-- ('Pasta Paradise', '456 Noodle Road, Pastatown, PT', 'Authentic Italian pasta and gourmet experiences', 4.7, 'Italian', '2012-09-20', 'images/pasta_paradise.png'),
-- ('Sushi Central', '789 Fish Lane, Sushiville, SV', 'Fresh sushi and Japanese cuisine', 4.9, 'Japanese', '2018-03-11', 'images/sushi_central.png');

INSERT INTO `restaurant_review`.`RESTAURANT`
(`name`, `address`, `description`, `rating`, `cuisine_type`, `opening_date`, `image_url`) VALUES
('McDonalds', '51 Ang Mo Kio Avenue 3 #01-04, 569922', 'McDonald’s® Singapore offers a variety of fast food options, including the Sweet ‘N Sour Burger, and breakfast items.', 4.5, 'Fast Food', '1980-01-01', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/McDonald%27s_logo.svg/1280px-McDonald%27s_logo.svg.png'),
('KFC', '23 Serangoon Central #B1-15 NEX, 556083', 'KFC Singapore offers a variety of meals including their signature Chickenjoys, Yumburgers, Champ hamburgers, and Jollibee Spaghetti meals.', 4.2, 'Fast Food', '1985-01-01', 'https://upload.wikimedia.org/wikipedia/sco/b/bf/KFC_logo.svg'),
('Jollibee', '10 Sinaran Drive #01-07/12 Square 2, 307506', 'Jollibee Singapore offers a variety of meals including Chickenjoy, Yumburgers, and Jollibee Spaghetti.', 4.0, 'Fast Food', '2014-01-01', 'https://i.pinimg.com/originals/87/d1/66/87d166c686ccca056ebcafba8ceae13f.jpg');

INSERT INTO `restaurant_review`.`review` 
(`restaurant_id`, `content`, `date`, `reviewer_name`) VALUES
(1, 'The food was absolutely wonderful, from preparation to presentation, very pleasing.', '2023-09-01', 'John Doe'),
(2, 'Dining at Pasta Paradise is a delight! The chefs are very creative and have a great season menu.', '2023-09-02', 'Jane Smith'),
(3, 'Sushi Central lives up to the hype! Fresh ingredients, tasty rolls, and a great atmosphere.', '2023-09-03', 'Chris Lee');
