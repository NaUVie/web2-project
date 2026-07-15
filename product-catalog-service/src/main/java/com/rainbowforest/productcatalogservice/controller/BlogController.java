package com.rainbowforest.productcatalogservice.controller;

import com.rainbowforest.productcatalogservice.entity.BlogCategory;
import com.rainbowforest.productcatalogservice.entity.BlogPost;
import com.rainbowforest.productcatalogservice.repository.BlogCategoryRepository;
import com.rainbowforest.productcatalogservice.repository.BlogPostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
public class BlogController {

    @Autowired
    private BlogCategoryRepository blogCategoryRepository;

    @Autowired
    private BlogPostRepository blogPostRepository;

    // Blog Categories
    @GetMapping("/blog-categories")
    public ResponseEntity<List<BlogCategory>> getAllBlogCategories() {
        return new ResponseEntity<>(blogCategoryRepository.findAll(), HttpStatus.OK);
    }

    @PostMapping("/blog-categories")
    public ResponseEntity<BlogCategory> createBlogCategory(@RequestBody BlogCategory category) {
        if (category.getSlug() == null || category.getSlug().isEmpty()) {
            category.setSlug(category.getName().toLowerCase().replaceAll("[^a-z0-9]", "-"));
        }
        return new ResponseEntity<>(blogCategoryRepository.save(category), HttpStatus.CREATED);
    }

    @PutMapping("/blog-categories/{id}")
    public ResponseEntity<BlogCategory> updateBlogCategory(@PathVariable Long id, @RequestBody BlogCategory categoryDetails) {
        return blogCategoryRepository.findById(id)
                .map(category -> {
                    category.setName(categoryDetails.getName());
                    if (categoryDetails.getSlug() != null && !categoryDetails.getSlug().isEmpty()) {
                        category.setSlug(categoryDetails.getSlug());
                    } else {
                        category.setSlug(categoryDetails.getName().toLowerCase().replaceAll("[^a-z0-9]", "-"));
                    }
                    return new ResponseEntity<>(blogCategoryRepository.save(category), HttpStatus.OK);
                })
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @DeleteMapping("/blog-categories/{id}")
    public ResponseEntity<Void> deleteBlogCategory(@PathVariable Long id) {
        return blogCategoryRepository.findById(id)
                .map(category -> {
                    blogCategoryRepository.delete(category);
                    return new ResponseEntity<Void>(HttpStatus.OK);
                })
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // Blog Posts
    @GetMapping("/blogs")
    public ResponseEntity<List<BlogPost>> getAllBlogs(@RequestParam(value = "category", required = false) String category) {
        if (category != null && !category.isEmpty()) {
            return new ResponseEntity<>(blogPostRepository.findByCategoryName(category), HttpStatus.OK);
        }
        return new ResponseEntity<>(blogPostRepository.findAll(), HttpStatus.OK);
    }

    @GetMapping("/blogs/{id}")
    public ResponseEntity<BlogPost> getBlogById(@PathVariable Long id) {
        return blogPostRepository.findById(id)
                .map(post -> new ResponseEntity<>(post, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping("/blogs")
    public ResponseEntity<BlogPost> createBlogPost(@RequestBody BlogPost post) {
        return new ResponseEntity<>(blogPostRepository.save(post), HttpStatus.CREATED);
    }

    @PutMapping("/blogs/{id}")
    public ResponseEntity<BlogPost> updateBlogPost(@PathVariable Long id, @RequestBody BlogPost postDetails) {
        return blogPostRepository.findById(id)
                .map(post -> {
                    post.setTitle(postDetails.getTitle());
                    post.setContent(postDetails.getContent());
                    post.setCoverImageUrl(postDetails.getCoverImageUrl());
                    post.setCategoryName(postDetails.getCategoryName());
                    return new ResponseEntity<>(blogPostRepository.save(post), HttpStatus.OK);
                })
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @DeleteMapping("/blogs/{id}")
    public ResponseEntity<Void> deleteBlogPost(@PathVariable Long id) {
        return blogPostRepository.findById(id)
                .map(post -> {
                    blogPostRepository.delete(post);
                    return new ResponseEntity<Void>(HttpStatus.OK);
                })
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
}
