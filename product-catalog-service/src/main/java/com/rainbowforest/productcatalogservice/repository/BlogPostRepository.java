package com.rainbowforest.productcatalogservice.repository;

import com.rainbowforest.productcatalogservice.entity.BlogPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BlogPostRepository extends JpaRepository<BlogPost, Long> {
    List<BlogPost> findByCategoryName(String categoryName);
}
