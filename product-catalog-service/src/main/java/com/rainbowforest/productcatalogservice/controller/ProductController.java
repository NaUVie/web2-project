package com.rainbowforest.productcatalogservice.controller;

import com.rainbowforest.productcatalogservice.entity.Product;
import com.rainbowforest.productcatalogservice.entity.ProductVariant;
import com.rainbowforest.productcatalogservice.http.header.HeaderGenerator;
import com.rainbowforest.productcatalogservice.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
public class ProductController {

    @Autowired
    private ProductService productService;
    
    @Autowired
    private HeaderGenerator headerGenerator;

    @GetMapping (value = "/products")
    public ResponseEntity<List<Product>> getProducts(
            @RequestParam(value = "category", required = false) java.util.List<String> categories,
            @RequestParam(value = "name", required = false) String name) {
        
        System.out.println("[DEBUG CONTROLLER] categories: " + categories + ", name: " + name);
        List<Product> products;
        if ((categories != null && !categories.isEmpty()) || (name != null && !name.trim().isEmpty())) {
            products = productService.searchProducts(categories, name);
        } else {
            products = productService.getAllProduct();
        }

        if(products != null && !products.isEmpty()) {
        	return new ResponseEntity<List<Product>>(
        			products,
        			headerGenerator.getHeadersForSuccessGetMethod(),
        			HttpStatus.OK);
        }
        return new ResponseEntity<List<Product>>(
        		headerGenerator.getHeadersForError(),
        		HttpStatus.NOT_FOUND);       
    }

    @GetMapping (value = "/products/{id}")
    public ResponseEntity<Product> getOneProductById(@PathVariable ("id") long id){
        Product product =  productService.getProductById(id);
        if(product != null) {
        	return new ResponseEntity<Product>(
        			product,
        			headerGenerator.getHeadersForSuccessGetMethod(),
        			HttpStatus.OK);
        }
        return new ResponseEntity<Product>(
        		headerGenerator.getHeadersForError(),
        		HttpStatus.NOT_FOUND);
    }

    @PostMapping(value = "/products")
    public ResponseEntity<Product> addProduct(@RequestBody Product product) {
        try {
            if (product.getVariants() != null) {
                for (ProductVariant v : product.getVariants()) {
                    v.setProduct(product);
                }
            }
            Product savedProduct = productService.addProduct(product);
            return new ResponseEntity<>(savedProduct, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping(value = "/products/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable("id") Long id, @RequestBody Product product) {
        Product existingProduct = productService.getProductById(id);
        if (existingProduct == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        existingProduct.setProductName(product.getProductName());
        existingProduct.setPrice(product.getPrice());
        existingProduct.setDiscription(product.getDiscription());
        existingProduct.setCategory(product.getCategory());
        existingProduct.setAvailability(product.getAvailability());
        existingProduct.setImageUrl(product.getImageUrl());
        existingProduct.setPromoPrice(product.getPromoPrice());
        
        if (product.getVariants() != null) {
            // Map incoming variants by ID
            java.util.Map<Long, ProductVariant> incomingMap = new java.util.HashMap<>();
            for (ProductVariant v : product.getVariants()) {
                if (v.getId() != null) {
                    incomingMap.put(v.getId(), v);
                }
            }

            // Remove existing variants not present in incoming payload
            existingProduct.getVariants().removeIf(ev -> ev.getId() != null && !incomingMap.containsKey(ev.getId()));

            // Update existing variants or add new ones
            for (ProductVariant v : product.getVariants()) {
                if (v.getId() != null) {
                    for (ProductVariant ev : existingProduct.getVariants()) {
                        if (ev.getId().equals(v.getId())) {
                            ev.setColor(v.getColor());
                            ev.setSize(v.getSize());
                            ev.setPrice(v.getPrice());
                            ev.setAvailability(v.getAvailability());
                            ev.setImageUrl(v.getImageUrl());
                            break;
                        }
                    }
                } else {
                    v.setProduct(existingProduct);
                    existingProduct.getVariants().add(v);
                }
            }
        } else {
            existingProduct.getVariants().clear();
        }
        
        Product savedProduct = productService.addProduct(existingProduct);
        return new ResponseEntity<>(savedProduct, HttpStatus.OK);
    }

    @DeleteMapping(value = "/products/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable("id") Long id) {
        Product existingProduct = productService.getProductById(id);
        if (existingProduct == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        productService.deleteProduct(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
