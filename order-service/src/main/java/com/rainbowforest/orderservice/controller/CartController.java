package com.rainbowforest.orderservice.controller;

import com.rainbowforest.orderservice.http.header.HeaderGenerator;
import com.rainbowforest.orderservice.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import jakarta.servlet.http.HttpServletRequest;

@RestController
public class CartController {

    @Autowired
    CartService cartService;
    
    @Autowired
    private HeaderGenerator headerGenerator;

    @GetMapping (value = "/cart")
    public ResponseEntity<List<Object>> getCart(
            @RequestHeader(value = "Cookie", required = false) String cartId,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId) {
        
        String activeCartId = (headerUserId != null) ? headerUserId : cartId;
        if (activeCartId == null) {
            return new ResponseEntity<>(headerGenerator.getHeadersForError(), HttpStatus.BAD_REQUEST);
        }

        List<Object> cart = cartService.getCart(activeCartId);
        if(!cart.isEmpty()) {
        	return new ResponseEntity<List<Object>>(
        			cart,
        			headerGenerator.getHeadersForSuccessGetMethod(),
        			HttpStatus.OK);
        }
    	return new ResponseEntity<List<Object>>(
    			headerGenerator.getHeadersForError(),
    			HttpStatus.NOT_FOUND);  
    }

    @PostMapping(value = "/cart", params = {"productId", "quantity"})
    public ResponseEntity<List<Object>> addItemToCart(
            @RequestParam("productId") Long productId,
            @RequestParam("quantity") Integer quantity,
            @RequestHeader(value = "Cookie", required = false) String cartId,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            HttpServletRequest request) {
        
        String activeCartId = (headerUserId != null) ? headerUserId : cartId;
        if (activeCartId == null) {
            return new ResponseEntity<>(headerGenerator.getHeadersForError(), HttpStatus.BAD_REQUEST);
        }

        List<Object> cart = cartService.getCart(activeCartId);
        if(cart != null) {
        	if(cart.isEmpty()){
        		cartService.addItemToCart(activeCartId, productId, quantity);
        	}else{
        		if(cartService.checkIfItemIsExist(activeCartId, productId)){
        			cartService.changeItemQuantity(activeCartId, productId, quantity);
        		}else {
        			cartService.addItemToCart(activeCartId, productId, quantity);
        		}
        	}
        	return new ResponseEntity<List<Object>>(
        			cart,
        			headerGenerator.getHeadersForSuccessGetMethod(),
        			HttpStatus.CREATED);
        }
        return new ResponseEntity<List<Object>>(
        		headerGenerator.getHeadersForError(),
        		HttpStatus.BAD_REQUEST);
    }

    @DeleteMapping(value = "/cart", params = "productId")
    public ResponseEntity<Void> removeItemFromCart(
            @RequestParam("productId") Long productId,
            @RequestHeader(value = "Cookie", required = false) String cartId,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId) {
    	
        String activeCartId = (headerUserId != null) ? headerUserId : cartId;
        if (activeCartId == null) {
            return new ResponseEntity<>(headerGenerator.getHeadersForError(), HttpStatus.BAD_REQUEST);
        }

        List<Object> cart = cartService.getCart(activeCartId);
    	if(cart != null) {
    		cartService.deleteItemFromCart(activeCartId, productId);
            return new ResponseEntity<Void>(
            		headerGenerator.getHeadersForSuccessGetMethod(),
            		HttpStatus.OK);
    	}
        return new ResponseEntity<Void>(
        		headerGenerator.getHeadersForError(),
        		HttpStatus.NOT_FOUND);
    }
}
