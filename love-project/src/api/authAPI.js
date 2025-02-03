import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 공통 URL 설정
const apiClient = axios.create({
  baseURL: 'http://192.168.1.29:8080', // 서버 기본 URL을 직접 입력하세요
  headers: {
    "Content-Type": "application/json", // JSON 형식의 데이터를 보내기 위해 Content-Type을 application/json으로 설정
  }
});

const matchClient = axios.create({
  baseURL: 'http://192.168.1.10:2000',
  headers: {
    "Content-Type": "application/json",
  }
});

// 전역 오류처리 미들웨어 설정
apiClient.interceptors.response.use(
  response => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      console.error('401 에러 발생!', error.response.data.message || error.response.data);
      // 추가적인 처리: 토큰 만료시 로그아웃 처리
      await AsyncStorage.removeItem('token'); // 저장된 토큰 삭제
      // 사용자에게 다시 로그인할 것을 알림
      alert('세션이 만료되었습니다. 다시 로그인 해주세요.');
    }
    return Promise.reject(error);
  }
);

/**
 * 로그인 요청 API
 */
export const loginUser = async (email, password) => {
  const data = {
    id: email,
    pw: password
  };

  console.log("로그인 데이터:", data);

  try {
    const response = await apiClient.post("/users/login", data); // 로그인 엔드포인트
    console.log('로그인 데이터 전송 성공:', response.data);
    
    const userData = response.data.userData;
    const token = response.data.token;

    if (userData) {
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      apiClient.defaults.headers['Authorization'] = `Bearer ${token}`; // 기본 설정의 Authorization 헤더에 추가
      console.log("로컬 저장 유저정보:", userData);
    } else {
      console.log("토큰이 없으므로 저장하지 않습니다.");
    }

    if (token) {
      await AsyncStorage.setItem('token', token);
      apiClient.defaults.headers['Authorization'] = `Bearer ${token}`; // 기본 설정의 Authorization 헤더에 추가
      console.log("로컬 저장 토큰:", token);
    } else {
      console.log("토큰이 없으므로 저장하지 않습니다.");
    }

    return response.data;
  } catch (error) {
    if (error.response) {
      const errorData = error.response.data;
      console.error('로그인 실패 이유:', errorData.message || errorData);
    } else {
      console.error('로그인 데이터 전송 오류:', error);
    }
    throw error; 
  }
};

/**
 * JWT 토큰 유효성 검사 API
 */
export const checkTokenValidity = async () => {
  const token = await AsyncStorage.getItem('token');
  if (!token) return { valid: false };

  try {
    const response = await apiClient.get("/users/validate", {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data;
  } catch (error) {
    console.log('서버에서 반환된 오류 메시지:', error.response);
    return { valid: false };
  }
};

/**
 * ID 중복 확인 API
 */
export const checkID = async (email) => {
  try {
    const response = await apiClient.get("/users/check", {
      params: { id: email },
    });
    console.log("ID중복 여부: ", response.data);
    return response.data;
  } catch (error) {
    console.error('ID 중복 확인 오류:', error);
    throw error;
  }
};

/**
 * 회원가입 API
 */
export const SignUpUser = async (email, password, nickname, gender, age, region, job, introduce, birthDate, mbti) => {
  const data = {
    email: email,
    password: password,
    username: nickname, // 수정된 변수 이름
    gender: gender,
    birthDate: birthDate,
    age: age,
    job: job,
    introduce: introduce,
    mbti:mbti,
    region,region,
    secretKey: "secretKey" //시크릿키 설정
  };


  try {
    // 스프링 유저관리
    const response = await apiClient.post("/users/signup", data); // 회원가입 엔드포인트
    console.log("회원가입 반환 데이터: ", response);

    // 파이썬 매칭관리
    if (response.data) {
      await matchClient.post("settings/ideal", {
        userUID: response.data.userUID,
        myGender: response.data.gender,
        myMBTI: response.data.mbti,
        myHeight: null,
        favoriteHeight: null,
        myAppearance: null,
        favoriteAppearance: null,
      });
    };

    return response.data;
  } catch (error) {
    console.error('회원가입 데이터 전송 오류:', error);
    throw error;
  }
};
