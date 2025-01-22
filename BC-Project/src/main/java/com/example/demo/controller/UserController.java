package com.example.demo.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.*;
import com.example.demo.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.UserDataService;
import com.example.demo.utils.JwtUtil;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserDataService userDataService;

    @Autowired
    private JwtUtil jwtUtil;

    // 사용자 목록 조회
    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // 특정 사용자 조회
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        Optional<User> user = userRepository.findById(id);
        return user.map(ResponseEntity::ok)
                   .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // 사용자 생성 (회원가입)
    @PostMapping("/signup")
    public ResponseEntity<User> createUser(@Valid @RequestBody SignUpRequest signUpRequest) {
    	System.out.println("Received SignUpRequest: " + signUpRequest);
        User user = new User();
        
        // DTO로부터 값 설정
        user.setEmail(signUpRequest.getUserId()); // 이메일
        user.setPassword(signUpRequest.getPw()); // 비밀번호
        user.setUsername(signUpRequest.getNickname()); // 닉네임
        user.setBirthDate(signUpRequest.getBirthDate()); // 생년월일
        user.setRegion(signUpRequest.getRegion()); // 지역
        user.setHobby(signUpRequest.getHobby()); // 취미
        user.setMbti(signUpRequest.getMbti()); // MBTI
        
        // 추가적인 설정
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        user.encodePassword(); // 비밀번호 해시화

        // User 객체 저장
        User createdUser = userRepository.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }


    // 로그인 처리
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        LoginResponse response = userDataService.loginUser(loginRequest);

        switch (response.getLoginStatus()) {
            case 0:
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            case 1:
                return ResponseEntity.status(HttpStatus.OK).body(response);
            case 2:
                return ResponseEntity.ok(response);
            default:
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(new LoginResponse(null, 0, "서버 오류가 발생했습니다"));
        }
    }

    // ID 중복 확인                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           
    @GetMapping("/check")
    public ResponseEntity<Boolean> idDuplicateCheck(@RequestParam("id") String id) {
        boolean isDuplicate = userDataService.duplicateCheckUser(id);
        return ResponseEntity.ok(isDuplicate);
    }


    // 내 정보 확인
    @GetMapping("/myData")
    public ResponseEntity<MyDataResponse> getMyData(@RequestHeader("Authorization") String token) {
        String jwtToken = token.substring(7);
        MyDataResponse data = userDataService.getMyDataByToken(jwtToken);
        return ResponseEntity.ok(data);
    }

    // 닉네임 변경
    @PatchMapping("/modifyNickname")
    public ResponseEntity<UpdateResponse> modifyNickName(@RequestHeader("Authorization") String token, @RequestBody UpdateNickname modifyNickname) {
        String jwtToken = token.substring(7);
        UpdateResponse response = userDataService.modifyNickname(jwtToken, modifyNickname);        
        return ResponseEntity.ok(response);
    }

    // 생년월일 변경
    @PatchMapping("/modifyBirthDate")
    public ResponseEntity<UpdateResponse> modifyBirthDate(@RequestHeader("Authorization") String token, @RequestBody UpdateBirthDate modifyBirthDate) {
        String jwtToken = token.substring(7);
        UpdateResponse response = userDataService.modifyBirthDate(jwtToken, modifyBirthDate);        
        return ResponseEntity.ok(response);
    }

    // 비밀번호 인증
    @PostMapping("/verifyPassword")
    public ResponseEntity<Response> verifyPassword(@RequestHeader("Authorization") String token, @Valid @RequestBody Password password) {
        String jwtToken = token.substring(7);
        Response response = userDataService.verifyPassword(jwtToken, password);

        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else if ("ID가 존재하지 않습니다".equals(response.getMessage())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response); 
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }

    // 비밀번호 변경
    @PatchMapping("/modifyPassword")
    public ResponseEntity<Response> modifyPassword(@RequestHeader("Authorization") String token, @Valid @RequestBody Password password) {
        String jwtToken = token.substring(7);
        Response response = userDataService.modifyPassword(jwtToken, password);        
        return ResponseEntity.ok(response);
    }

    // 회원 탈퇴
    @DeleteMapping("/deleteUser")
    public ResponseEntity<Response> deleteUser(@RequestHeader("Authorization") String token, @Valid @RequestBody Password password) {
        String jwtToken = token.substring(7);
        Response response = userDataService.deleteUser(jwtToken, password);

        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else if ("ID가 존재하지 않습니다.".equals(response.getMessage())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response); 
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }

    // JWT 토큰 유효성 검사
    @GetMapping("/validate")
    public ResponseEntity<TokenValidation> validateToken(@RequestHeader("Authorization") String token) {
        String jwtToken = token.substring(7);
        boolean isValid = jwtUtil.validateToken(jwtToken);

        String message = isValid ? "토큰이 유효합니다" : "토큰이 유효하지 않습니다";
        return ResponseEntity.ok(new TokenValidation(isValid, message));
    }

    // 2차 인증 비활성화
    @PostMapping("/disableMfa")
    public ResponseEntity<Response> disableOtp(@RequestHeader("Authorization") String token) {
        String jwtToken = token.substring(7);
        Response response = userDataService.disableMfa(jwtToken);
        return ResponseEntity.ok(response);
    }
    
 // 사용자 프로필 정보 조회
    @GetMapping("/profile")
    public ResponseEntity<User> getProfile(@RequestHeader("Authorization") String token) {
        String jwtToken = token.substring(7); // JWT 토큰에서 'Bearer ' 부분 제거
        User user = userDataService.getUserByToken(jwtToken); // 토큰을 통해 사용자 정보 조회

        if (user != null) {
            return ResponseEntity.ok(user);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build(); // 사용자 정보가 없으면 404 반환
        }
    }


	public UserRepository getUserRepository() {
		return userRepository;
	}

	public void setUserRepository(UserRepository userRepository) {
		this.userRepository = userRepository;
	}

	public UserDataService getUserDataService() {
		return userDataService;
	}

	public void setUserDataService(UserDataService userDataService) {
		this.userDataService = userDataService;
	}

	public JwtUtil getJwtUtil() {
		return jwtUtil;
	}

	public void setJwtUtil(JwtUtil jwtUtil) {
		this.jwtUtil = jwtUtil;
	}
}
