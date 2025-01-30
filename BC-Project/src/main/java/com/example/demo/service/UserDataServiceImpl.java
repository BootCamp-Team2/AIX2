package com.example.demo.service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.User; // User 클래스를 사용
import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.LoginResponse;
import com.example.demo.dto.MfaRequest;
import com.example.demo.dto.MfaResponse;
import com.example.demo.dto.MyDataResponse;
import com.example.demo.dto.Password;
import com.example.demo.dto.Response;
import com.example.demo.dto.SignUpRequest;
import com.example.demo.dto.UpdateBirthDate;
import com.example.demo.dto.UpdateCharacterPicture;
import com.example.demo.dto.UpdateNickname;
import com.example.demo.dto.UpdateProfileInfo;
import com.example.demo.dto.UpdateResponse;
import com.example.demo.dto.UpdateMedia;
import com.example.demo.repository.UserRepository;
import com.example.demo.utils.JwtUtil;

import org.checkerframework.checker.units.qual.m;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


@SuppressWarnings("unused")
@Service
public class UserDataServiceImpl implements UserDataService {
	private static final Logger logger = LoggerFactory.getLogger(UserDataServiceImpl.class);

    @Autowired
    private UserRepository userDataRepository;

    @Autowired
    private JwtUtil jwtUtil;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // 아이디 조회
    public boolean duplicateCheckUser(String email) {
        boolean exists = userDataRepository.existsByEmail(email);
        logger.info("Checking existence for email: {}, exists: {}", email, exists);
        return exists;
    }


    // 회원가입
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean registerUser(SignUpRequest request) {
        // 중복된 ID 확인
        if (duplicateCheckUser(request.getEmail())) { // getUserId()는 이메일
            return false; // 중복된 ID
        }

        // 비밀번호 해시 처리
        String hashedPassword = passwordEncoder.encode(request.getPassword()); // getPw() 사용

        // User 객체 생성
        User user = new User();
        user.setEmail(request.getEmail()); // 사용자 ID (이메일)
        user.setPassword(hashedPassword); // 해시된 비밀번호
        user.setUsername(request.getUsername()); // 사용자 이름
        user.setBirthDate(request.getBirthDate()); // 생년월일

        // 데이터베이스에 저장
        userDataRepository.save(user);
        return true; // 회원가입 성공
    }

    // 로그인
    @Override
    public LoginResponse loginUser(LoginRequest loginRequest) {
        String email = loginRequest.getId();
        String pw = loginRequest.getPw();
        logger.info("Attempting to log in with email: {}", email);

        Optional<User> userOptional = userDataRepository.findByEmail(email);

        if (userOptional.isEmpty() || !passwordEncoder.matches(pw, userOptional.get().getPassword())) {
            logger.warn("Login failed for email: {}", email);
            return new LoginResponse(null, 0, "ID나 비밀번호가 잘못되었습니다", null);
        }

        User user = userOptional.get();
        String jwtToken = jwtUtil.generateToken(user.getEmail());
        logger.info("Login successful for email: {}", email);
        return new LoginResponse(jwtToken, 2, "로그인 성공", user);
    }


    // 유저 필터 추가
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Optional<User> userOptional = userDataRepository.findByEmail(email);

        User user = userOptional
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다 : " + email));

        // 권한 리스트 생성 및 추가
        List<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_USER")); // 기본 권한 추가

        // UserDetails 객체 반환
        return new org.springframework.security.core.userdetails.User(user.getEmail(), user.getPassword(), authorities);
    }

    // 닉네임 변경
    @Override
    public UpdateResponse modifyNickname(String jwtToken, UpdateNickname updateNickname) {
        String email = jwtUtil.extractUsername(jwtToken);
        String newNickname = updateNickname.getNickname();
        Optional<User> userOptional = userDataRepository.findByEmail(email);

        // 사용자가 존재하지 않을 경우 처리
        if (userOptional.isEmpty()) {
            return new UpdateResponse(false, "ID가 존재하지 않습니다 : " + email, null);
        }

        User user = userOptional.get();
        user.setUsername(newNickname);
        userDataRepository.save(user);
        return new UpdateResponse(true, "닉네임이 변경 되었습니다", newNickname);
    }

    // 생년월일 변경
    @Override
    public UpdateResponse modifyBirthDate(String jwtToken, UpdateBirthDate updateBirthDate) {
        String email = jwtUtil.extractEmail(jwtToken);
        LocalDate newBirthDate = updateBirthDate.getBirthDate();
        Optional<User> userOptional = userDataRepository.findByEmail(email);

        // 사용자가 존재하지 않을 경우 처리
        if (userOptional.isEmpty()) {
            return new UpdateResponse(false, "ID가 존재하지 않습니다 : " + email, null);
        }

        User user = userOptional.get();
        user.setBirthDate(newBirthDate);
        userDataRepository.save(user);
        String changeBirthDate = newBirthDate.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        return new UpdateResponse(true, "생년월일이 변경 되었습니다", changeBirthDate);
    }

    // 비밀번호 인증
    @Override
    public Response verifyPassword(String jwtToken, Password passwordRequest) {
        String userId = jwtUtil.extractUsername(jwtToken);
        String inputPassword = passwordRequest.getPw();
        logger.info("Verifying password for user ID: {}", userId);

        Optional<User> userOptional = userDataRepository.findByEmail(userId);

        if (userOptional.isEmpty()) {
            logger.warn("User ID not found: {}", userId);
            return new Response(false, "ID가 존재하지 않습니다 : " + userId);
        }

        User user = userOptional.get();
        if (!passwordEncoder.matches(inputPassword, user.getPassword())) {
            logger.warn("Password mismatch for user ID: {}", userId);
            return new Response(false, "비밀번호가 일치하지 않습니다");
        }

        logger.info("Password verified successfully for user ID: {}", userId);
        return new Response(true, "비밀번호가 일치합니다");
    }

    // 비밀번호 변경
    @Override
    public Response modifyPassword(String jwtToken, Password password) {
        String userId = jwtUtil.extractUsername(jwtToken);
        String newPassword = password.getPw();
        Optional<User> userOptional = userDataRepository.findByEmail(userId);

        // 사용자가 존재하지 않을 경우 처리
        if (userOptional.isEmpty()) {
            return new Response(false, "ID가 존재하지 않습니다 : " + userId);
        }

        User user = userOptional.get();
        String newHashedPassword = passwordEncoder.encode(newPassword);
        user.setPassword(newHashedPassword);
        userDataRepository.save(user);
        return new Response(true, "비밀번호가 변경 되었습니다");
    }

    // 마이페이지 데이터 확인
    @Override
    public MyDataResponse getMyDataByToken(String jwtToken) {
        String userId = jwtUtil.extractEmail(jwtToken);
        Optional<User> userOptional = userDataRepository.findByEmail(userId);
        User user = userOptional.orElseThrow(() -> new RuntimeException("ID가 존재하지 않습니다 : " + userId));
        MyDataResponse data = new MyDataResponse(user);

        return data;
    }

    // 회원 탈퇴
    @Override
    @Transactional(rollbackFor = Exception.class)
    public Response deleteUser(String jwtToken, Password passwordRequest) {
        String userId = jwtUtil.extractEmail(jwtToken);
        String inputPassword = passwordRequest.getPw();
        Optional<User> userOptional = userDataRepository.findByEmail(userId);

        // 사용자가 존재하지 않을 경우 처리
        if (userOptional.isEmpty()) {
            return new Response(false, "ID가 존재하지 않습니다 : " + userId);
        }

        User user = userOptional.get();

        // 비밀번호가 일치하지 않을 경우
        if (!passwordEncoder.matches(inputPassword, user.getPassword())) {
            return new Response(false, "비밀번호가 일치하지 않습니다");
        }

        // 사용자 삭제
        userDataRepository.delete(user);
        return new Response(true, "회원 탈퇴 되었습니다");
    }

    // 회원정보 변경
    @Override
    public UpdateResponse modifyProfileInfo(String jwtToken, UpdateProfileInfo modifyProfile) {
        String email = jwtUtil.extractEmail(jwtToken);
        String newUsername = modifyProfile.getUsername();
        String newProfilePicture = modifyProfile.getProfile_picture();
        String newMBTI = modifyProfile.getMbti();
        String newAge = modifyProfile.getAge();
        String newRegion = modifyProfile.getRegion();
        String newJob = modifyProfile.getJob();
        String newIntroduce = modifyProfile.getIntroduce();
        List<String> newAppeal = modifyProfile.getAppeal();

        Optional<User> userOptional = userDataRepository.findByEmail(email);

        // 사용자가 존재하지 않을 경우 처리
        if (userOptional.isEmpty()) {
            return new UpdateResponse(false, "ID가 존재하지 않습니다 : " + email, null);
        }

        User user = userOptional.get();
        user.setUsername(newUsername);
        user.setProfilePicture(newProfilePicture);
        user.setMbti(newMBTI);
        user.setAge(newAge);
        user.setRegion(newRegion);
        user.setJob(newJob);
        user.setIntroduce(newIntroduce);

        userDataRepository.save(user);
        return new UpdateResponse(true, "회원정보가 변경되었습니다.", null);
    }

    // 회원 AI아바타 변경
    @Override
    public UpdateResponse modifyCharacterPicture(String jwtToken, UpdateCharacterPicture characterPicture) {
        String email = jwtUtil.extractEmail(jwtToken);
        String newCharacterPicture = characterPicture.getCharacter_picture();

        Optional<User> userOptional = userDataRepository.findByEmail(email);

        // 사용자가 존재하지 않을 경우 처리
        if (userOptional.isEmpty()) {
            return new UpdateResponse(false, "ID가 존재하지 않습니다 : " + email, null);
        }

        User user = userOptional.get();
        user.setCharacterPicture(newCharacterPicture);

        userDataRepository.save(user);
        return new UpdateResponse(true, "프로필이 적용되었습니다.", newCharacterPicture);
    }

    // 회원 미디어 추가 및 변경
    @Override
    public UpdateResponse modifyMedia(String jwtToken, UpdateMedia media) {
        String email = jwtUtil.extractEmail(jwtToken);
        String newMedia = media.getMedia();

        Optional<User> userOptional = userDataRepository.findByEmail(email);

        // 사용자가 존재하지 않을 경우 처리
        if (userOptional.isEmpty()) {
            return new UpdateResponse(false, "ID가 존재하지 않습니다 : " + email, null);
        }

        User user = userOptional.get();
        user.setMedia(newMedia);

        userDataRepository.save(user);
        return new UpdateResponse(true, "미디어가 변경되었습니다.", newMedia);
    }

    public UserRepository getUserDataRepository() {
        return userDataRepository;
    }

    public void setUserDataRepository(UserRepository userDataRepository) {
        this.userDataRepository = userDataRepository;
    }

    public JwtUtil getJwtUtil() {
        return jwtUtil;
    }

    public void setJwtUtil(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    public BCryptPasswordEncoder getPasswordEncoder() {
        return passwordEncoder;
    }

	@Override
	public MfaResponse verifyGoogleMFA(MfaRequest mfaRequest) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public Response disableMfa(String jwtToken) {
		// TODO Auto-generated method stub
		return null;
	}

	public static Logger getLogger() {
		return logger;
	}


	@Override
	public User getUserByToken(String jwtToken) {
		// TODO Auto-generated method stub
		return null;
	}

}
