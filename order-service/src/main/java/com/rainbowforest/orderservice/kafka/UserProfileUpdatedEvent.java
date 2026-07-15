package com.rainbowforest.orderservice.kafka;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileUpdatedEvent implements Serializable {
    private Long userId;
    private String newPhoneNumber;
    private String newStreet;
    private String newStreetNumber;
    private String newZipCode;
    private String newLocality;
    private String newCountry;
}
