package com.rainbowforest.productcatalogservice.repository;

import com.rainbowforest.productcatalogservice.entity.BlogCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BlogCategoryRepository extends JpaRepository<BlogCategory, Long> {
    BlogCategory findByName(String name);
    BlogCategory findBySlug(String slug);
}
