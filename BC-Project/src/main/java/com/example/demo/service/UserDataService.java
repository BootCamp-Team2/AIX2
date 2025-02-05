package com.example.demo.service;

import org.springframework.security.core.userdetails.UserDetails;

import com.example.demo.User;
import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.LoginResponse;
import com.example.demo.dto.MfaRequest;
import com.example.demo.dto.MfaResponse;
import com.example.demo.dto.MyDataResponse;
import com.example.demo.dto.Password;
import com.example.demo.dto.Response;
import com.example.demo.dto.SignUpRequest;
import com.example.demo.dto.UpdateAppeal;
import com.example.demo.dto.UpdateBirthDate;
import com.example.demo.dto.UpdateCharacterPicture;
import com.example.demo.dto.UpdateMedia;
import com.example.demo.dto.UpdateNickname;
import com.example.demo.dto.UpdateProfile;
import com.example.demo.dto.UpdateResponse;

public interface UserDataService {
	public boolean duplicateCheckUser(String id);
	public boolean registerUser(SignUpRequest signUpRequest);
	public LoginResponse loginUser(LoginRequest LoginRequest);
	public MfaResponse verifyGoogleMFA(MfaRequest mfaRequest);
	public UserDetails loadUserByUsername(String username);
	public MyDataResponse getMyDataByToken(String jwtToken);
	public Response deleteUser(String jwtToken);	
	public UpdateResponse modifyNickname(String jwtToken, UpdateNickname modifyNickname);
	public UpdateResponse modifyBirthDate(String jwtToken, UpdateBirthDate updateBirthDate);
	public Response verifyPassword(String jwtToken, Password password);
	public Response modifyPassword(String jwtToken, Password password);
	public Response disableMfa(String jwtToken);
	public User getUserByToken(String jwtToken);
	public UpdateResponse modifyProfileInfo(String jwtToken, UpdateProfile modifyProfile);
	public UpdateResponse modifyCharacterPicture(String jwtToken, UpdateCharacterPicture characterPicture);
	public UpdateResponse modifyProfileImg(String jwtToken, String profileImg);
	public UpdateResponse modifyMedia(String jwtToken, UpdateMedia mediaString);
	public UpdateResponse modifyAppeal(String jwtToken, UpdateAppeal appealString);
	public MyDataResponse getMyDataByUID(String uid);
}