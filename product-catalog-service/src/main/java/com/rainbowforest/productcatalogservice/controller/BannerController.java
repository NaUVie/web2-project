package com.rainbowforest.productcatalogservice.controller;

import com.rainbowforest.productcatalogservice.entity.Advertisement;
import com.rainbowforest.productcatalogservice.repository.AdvertisementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/banners")
public class BannerController {

    @Autowired
    private AdvertisementRepository advertisementRepository;

    @GetMapping
    public ResponseEntity<List<Advertisement>> getActiveBanners() {
        return new ResponseEntity<>(advertisementRepository.findByActive(true), HttpStatus.OK);
    }

    @GetMapping("/admin")
    public ResponseEntity<List<Advertisement>> getAllBanners() {
        return new ResponseEntity<>(advertisementRepository.findAll(), HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<Advertisement> createBanner(@RequestBody Advertisement banner) {
        return new ResponseEntity<>(advertisementRepository.save(banner), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Advertisement> updateBanner(@PathVariable Long id, @RequestBody Advertisement bannerDetails) {
        return advertisementRepository.findById(id)
                .map(banner -> {
                    banner.setImageUrl(bannerDetails.getImageUrl());
                    banner.setTargetUrl(bannerDetails.getTargetUrl());
                    banner.setTitle(bannerDetails.getTitle());
                    banner.setActive(bannerDetails.isActive());
                    return new ResponseEntity<>(advertisementRepository.save(banner), HttpStatus.OK);
                })
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBanner(@PathVariable Long id) {
        return advertisementRepository.findById(id)
                .map(banner -> {
                    advertisementRepository.delete(banner);
                    return new ResponseEntity<Void>(HttpStatus.OK);
                })
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
}
