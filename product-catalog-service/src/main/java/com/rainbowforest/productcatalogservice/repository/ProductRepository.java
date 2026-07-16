package com.rainbowforest.productcatalogservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.rainbowforest.productcatalogservice.entity.Product;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    public List<Product> findAllByCategory(String category);
    public List<Product> findAllByProductName(String name);

    @Query("SELECT p FROM Product p WHERE " +
           "(:hasCategories = false OR LOWER(p.category) IN (:categories)) AND " +
           "(:name IS NULL OR :name = '' OR LOWER(p.productName) LIKE LOWER(CONCAT('%', :name, '%')) OR LOWER(p.discription) LIKE LOWER(CONCAT('%', :name, '%')))")
    List<Product> searchProducts(
        @Param("categories") List<String> categories, 
        @Param("hasCategories") boolean hasCategories, 
        @Param("name") String name
    );
}
