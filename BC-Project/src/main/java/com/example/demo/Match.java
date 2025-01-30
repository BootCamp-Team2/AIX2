package com.example.demo;

import java.util.List;

import jakarta.persistence.Column;
// import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

// @Entity
@Table(name = "matches")
public class Match {
	@Id
	@Column(name = "userUID")
    private String userUID;
	@Column(name = "myGender")
    private String myGender;
	@Column(name = "recommendGender")
    private String recommendGender;
	@Column(name = "myMBTI")
    private String myMBTI;

	@Column(name = "recommendMBTI", columnDefinition = "json")
    private List<String> recommendMBTI;

	@Column(name = "myHeight")
	private String myHeight;
	@Column(name = "favoriteHeight")
	private String favoriteHeight;

	@Column(name = "myAppearance", columnDefinition = "json")
	private List<String> myAppearance;
	@Column(name = "favoriteAppearance", columnDefinition = "json")
	private List<String> favoriteAppearance;

	// Getter and Setter for userUID
    public String getUserUID() {
        return userUID;
    }

    public void setUserUID(String userUID) {
        this.userUID = userUID;
    }

    // Getter and Setter for myGender
    public String getMyGender() {
        return myGender;
    }

    public void setMyGender(String myGender) {
        this.myGender = myGender;
    }

    // Getter and Setter for recommendGender
    public String getRecommendGender() {
        return recommendGender;
    }

    public void setRecommendGender(String recommendGender) {
        this.recommendGender = recommendGender;
    }

    // Getter and Setter for myMBTI
    public String getMyMBTI() {
        return myMBTI;
    }

    public void setMyMBTI(String myMBTI) {
        this.myMBTI = myMBTI;
    }

    // Getter and Setter for recommendMBTI
    public List<String> getRecommendMBTI() {
        return recommendMBTI;
    }

    public void setRecommendMBTI(List<String> recommendMBTI) {
        this.recommendMBTI = recommendMBTI;
    }

    // Getter and Setter for myHeight
    public String getMyHeight() {
        return myHeight;
    }

    public void setMyHeight(String myHeight) {
        this.myHeight = myHeight;
    }

    // Getter and Setter for favoriteHeight
    public String getFavoriteHeight() {
        return favoriteHeight;
    }

    public void setFavoriteHeight(String favoriteHeight) {
        this.favoriteHeight = favoriteHeight;
    }

    // Getter and Setter for myAppearance
    public List<String> getMyAppearance() {
        return myAppearance;
    }

    public void setMyAppearance(List<String> myAppearance) {
        this.myAppearance = myAppearance;
    }

    // Getter and Setter for favoriteAppearance
    public List<String> getFavoriteAppearance() {
        return favoriteAppearance;
    }

    public void setFavoriteAppearance(List<String> favoriteAppearance) {
        this.favoriteAppearance = favoriteAppearance;
    }
}
