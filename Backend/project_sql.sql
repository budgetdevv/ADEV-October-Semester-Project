-- MySQL Script generated by MySQL Workbench
-- Mon Jan 15 21:21:12 2024
-- Model: New Model    Version: 1.0
-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

DROP SCHEMA IF EXISTS `e-commerce`;

-- -----------------------------------------------------
-- Schema e-commerce
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema e-commerce
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `e-commerce` DEFAULT CHARACTER SET utf8 ;
USE `e-commerce` ;

-- -----------------------------------------------------
-- Table `e-commerce`.`category`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `e-commerce`.`category` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;

INSERT INTO `e-commerce`.`category` (name) VALUES ("None");
INSERT INTO `e-commerce`.`category` (name) VALUES ("Food");
INSERT INTO `e-commerce`.`category` (name) VALUES ("Tech");

-- -----------------------------------------------------
-- Table `e-commerce`.`product`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `e-commerce`.`product` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(200) NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `category_id` INT NOT NULL,
  `picture` VARCHAR(200) NULL,
  PRIMARY KEY (`id`),
  INDEX `category_id_idx` (`category_id` ASC) VISIBLE,
  CONSTRAINT `product_category_id`
    FOREIGN KEY (`category_id`)
    REFERENCES `e-commerce`.`category` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

INSERT INTO `e-commerce`.`product`
(name, description, price, category_id, picture)
VALUES
("Chicken Rice", "Delicious chicken rice from flavors food canteen!", 6.00, 2, "/Frontend/Assets/ChickenRice.jpg"),
("Samsung S24 Ultra", "Very sexy phone that rips a hole in your wallet...", 1928.00, 3, "https://images.samsung.com/sg/smartphones/galaxy-s24-ultra/images/galaxy-s24-ultra-highlights-color-titanium-yellow-back-mo.jpg"),
("Failing in Temasek Poly ( Free )", "Who knew that failing is free?", 0.00, 1, "https://dramscotland.co.uk/wp-content/uploads/2021/08/Gordon-Ramsay-.jpg");

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
