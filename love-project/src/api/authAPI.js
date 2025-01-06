// 인증 관련 API 파일 (회원가입, 로그인 요청 통신 등)
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { API_URL } from "@env"; // 환경 변수 제거
// console.log("env 테스트/API_URL: ", API_URL); // 환경 변수 관련 로그 제거

// 공통 URL 설정
const apiClient = axios.create({
  baseURL: 'https://your-api-url.com', // 서버 기본 URL을 직접 입력하세요
  headers: {
    "Content-Type": "application/json", // JSON 형식의 데이터를 보내기 위해 Content-Type을 application/json로 설정
  }
});

/**
 * 로그인 요청 API
 * 
 * @param {string} id - 사용자 이메일 주소
 * @param {string} pw - 사용자 비밀번호
 * @returns {Object} 서버 응답 데이터(객체)
 * @returns {String} returns.token - JWT 토큰
 * @returns {int} return.loginStatus- 로그인 상태(성공여부)
 * @returns {String} returns.message - 메시지
 * 
 * 로그인 성공 후 JWT 토큰을 받아 로컬 스토리지에 저장한다.
 */
export const loginUser = async (email, password) => {
  const data = {
    id: email,
    pw: password
  };

  console.log("로그인 데이터:", data);

  try {
    const response = await apiClient.post("/user/login", data);
    console.log('로그인 데이터 전송 성공:', response.data);
    
    // 로그인 성공 시 JWT 토큰 저장
    const token = response.data.token;
    
    // 토큰이 존재할 경우만 저장
    if (token) {
      await AsyncStorage.setItem('token', token);
      console.log("로컬 저장 토큰:", token);
    } else {
      console.log("토큰이 없으므로 저장하지 않습니다.");
    }

    return response.data; // 서버 반환 성공 여부
  } catch (error) {
    if (error.response) {
      const errorData = error.response.data;

      if (errorData && typeof errorData.message === 'string') {
        console.error('로그인 실패 이유:', errorData.message);
      } else {
        console.error('로그인 실패 이유:', errorData); // errorData 문자열 아닌 다른 형식일 때 오류가 발생 방지
      }
    } else {
      console.error('로그인 데이터 전송 오류:', error);
    }
    throw error; 
  }
};

/**
 * JWT 토큰 유효성 검사 API
 * 
 * @returns {Object} 서버 응답 데이터(객체)
 * @returns {boolean} returns.isValid - 토큰 유효성 검증 결과 (valid: true/false)
 * @returns {String} returns.message - 토큰 만료 여부 메시지
 * 
 * 요청 파라미터가 없고, 헤더에 token 포함하여 요청해야 한다.
 * 서버에 JWT 토큰의 유효성을 확인하고, 유효한지 응답 받는다.
 */
export const checkTokenValidity = async (token) => {
  try {
    const response = await apiClient.get("/user/validate", {
      headers: {
        'Authorization': `Bearer ${token}` // 헤더에 토큰 추가
      }
    });

    return response.data; // 응답 데이터 반환
  } catch (error) {
    if (error.response) {
      console.log('서버에서 반환된 오류 메시지:', error.response); // 오류 메시지 출력
    } else {
      console.error('JWT 유효성 검사 오류:', error);
    }
    return { valid: false }; // 오류 발생 시 false 반환
  }
};

/**
 * ID 중복 확인 API
 * 
 * @param {string} id - 확인할 ID(이메일) 주소
 * @returns {boolean} returns.isDuplicate - ID 중복 여부 (중복:true, 중복X:false)
 * 
 * 사용자가 입력한 이메일이 이미 가입된 이메일인지 확인한다.
 */
export const checkID = async (email) => {
  try {
    const response = await apiClient.get("/user/check", { params: { id: email }});
    console.log("ID중복 여부: ", response.data);
    return response.data; // 서버에서 boolean(?)값 반환
  } catch (error) {
    console.error('ID 중복 확인 오류:', error);
    throw error;
  }
};

/**
 * 회원가입 API
 * 
 * @param {string} id - 사용자 이메일 주소
 * @param {string} pw - 사용자 비밀번호
 * @param {string} nickname - 닉네임
 * @param {string} birthDate - 생년월일 (YYYY-MM-DD 형식)
 * @param {string} carId - 차량 번호 (띄어쓰기 없이 전송)
 * @returns {object} - 회원가입 응답 데이터 (객체)
 * @returns {boolean} returns.success - 회원 가입 성공 여부 (성공:true, 실패:false) 
 * @returns {String} returns.message - 회원 가입 여부 및 오류 발생 시 메시지 반환
 * 
 */
export const SignUpUser = async (email, password, nickname, birthDate, carNumber) => {
  const data = {
    id: email,
    pw: password,
    nickname: nickname,
    birthDate: birthDate,
    carId: carNumber,
  }

  try {
    const response = await apiClient.post("/user/signUp", data);
    console.log("회원가입 반환 데이터: ", response);
    console.log('회원가입 데이터 전송 성공:', response.data.success);
    console.log('회원가입 실패 이유: ', response.data.message);

    return response.data; // 서버 반환 성공 여부
  } catch (error) {
      console.error('회원가입 데이터 전송 오류:', error);
      throw error;
  }
};

/**
 * OTP 생성 API
 * 
 * @returns {object} - 서버 반환 데이터(객체)
 * @returns {boolean} returns.success - 2차 인증 생성 성공 여부 (성공:true, 실패:false)
 * @returns {String} returns.otpKey - 앱 등록 가능 otp 키 (실패: null)
 * @returns {String} returns.QRUrl - OR 이미지 URL (실패: null)
 * 
 * 사용자가 2차 인증을 활성화하기 위해 서버에 요청을 보내고, QR 코드 URL과 OTP 키를 반환받는다.
 */
export const enableTwoFactorAuth = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    console.log(token);
    
    const response = await apiClient.post("/user/otp", null, {
      headers: {
        Authorization: `Bearer ${token}`, // JWT 토큰을 Authorization 헤더에 추가
      },
    });
    
    console.log("2차인증 반환 데이터: ", response.data);
    const qrUrl = response.data.qrurl; // 응답에서 OR 코드 URL 추출
    const otpKey = response.data.otpKey;
    console.log("OTP QR_URL: ", qrUrl);
    console.log("OTP Key: ", otpKey);
    
    return { qrUrl, otpKey };
  } catch (error) {
    console.error("2차 인증 활성화 오류:", error);
    throw error;
  }
};

/**
 * 2차 인증 비활성화 요청 API
 * 
 * @returns {object} - 서버 반환 데이터(객체)
 * @returns {boolean} returns.success - 비활성 성공 여부
 * @returns {String} returns.message - 메시지
 * 
 */
export const disableTwoFactorAuth = async () => {
  try {
    console.log("2차인증 비활성 함수 들어옴");
    const token = await AsyncStorage.getItem('token');

    const response = await apiClient.post("/user/disableMfa", {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log("2차인증 비활성화 반환 데이터: ", response.data);
    
    return response.data; // 성공 여부와 메시지 반환
  } catch (error) {
    console.error("2차 인증 비활성화 오류(API 함수):", error.response ? error.response.data : error.message);
    throw error;
  }
};
