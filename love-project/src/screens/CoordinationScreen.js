import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const CoordinationScreen = () => {
  const [image, setImage] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationImages, setRecommendationImages] = useState([]);
  const [loading, setLoading] = useState(false); // 서버 요청 중 로딩 상태
  const [showButton, setShowButton] = useState(true); // 추천 받기 버튼 표시 여부

   // 이미지 선택
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 5],
      quality: 1,
    });
  
    // result.assets가 존재하고, 길이가 1 이상일 때만 처리
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
      setShowButton(true); // 새로운 이미지 선택 시 추천 받기 버튼 다시 표시
      setAnalysis(null); // 이전 분석 결과 초기화
      setRecommendations([]);
    } else {
      alert('이미지가 선택되지 않았습니다.');
      console.log('이미지가 선택되지 않았습니다.');
    }
  };

  // 서버에 이미지 업로드 및 분석 요청
  const analyzeImage = async () => {
    if (!image) return;
    setLoading(true); // 로딩 시작
    setShowButton(false); // 버튼 숨기기

    let formData = new FormData();
    formData.append('img', {
      uri: image,
      name: 'upload.jpg',
      type: 'img/jpeg',
    });

    try {
      const response = await fetch('http://192.168.1.27:3000/uploads/clothes-recommend', {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const data = await response.json();

      //console.log("🔍 서버 응답 데이터:", data);

      // result_msg에서 분석 결과 및 추천 코디 데이터를 파싱
      const resultMsg = JSON.parse(data.result_msg); // JSON 문자열을 객체로 변환

      // 분석 결과 저장
      setAnalysis({
        gender: resultMsg["성별"],
        faceShape: resultMsg["얼굴형"],
        facialFeatures: resultMsg["이목구비"],
        skinTone: resultMsg["피부색"],
        bodyType: resultMsg["체형"]
      });

      // 추천 코디 저장
      const recs = resultMsg["코디"].map((rec) => ({
        items: rec["아이템"],
        reason: rec["이유"]
      }));
      setRecommendations(recs);

      // result_search에서 추천 이미지 URL을 추출 (undefined 방지)
      const resultSearch = JSON.parse(data.result_search);

      //console.log("🔍 result_search 데이터:", resultSearch);


      if (Array.isArray(resultSearch)) {
        // const imageUrls = resultSearch
        //   .flat()  // 2차원 배열을 평탄화하여 1차원 배열로 변환
        //   .map((imgObj) => imgObj.img) // 각 객체에서 uri 추출
        //   .filter(Boolean); // undefined 방지

        // 각 그룹별로 이미지를 추출해서 저장할 배열을 준비
        const group1Images = resultSearch[0].map((imgObj) => imgObj.img).filter(Boolean);
        const group2Images = resultSearch[1].map((imgObj) => imgObj.img).filter(Boolean);
        const group3Images = resultSearch[2].map((imgObj) => imgObj.img).filter(Boolean);

        const imageUrls = [group1Images, group2Images, group3Images];


        //console.log(imageUrls);
        setRecommendationImages(imageUrls); // 이미지 URL 상태 업데이트
      } else {
        console.error("result_search가 예상된 형식이 아닙니다.", resultSearch);
        console.error("result_search가 예상된 형식이 아닙니다.", error);
      }

    } catch (error) {
      console.error('Error analyzing image:', error);
    } finally {
      setLoading(false); // 로딩 종료
    }
  };
  

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.image} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image }} style={styles.selectImage} />
        ) : (
          <Text style={styles.uploadText}>얼굴 사진을 업로드 하세요</Text>
      )}</TouchableOpacity> 

      <View style={styles.subontainer}>
        <Text style={styles.horizontalLine} />         
      </View>

      {showButton && !image && (
        <View style={styles.suggestionPhrase}>
          <Text style={styles.suggestionPhraseText}>얼굴 분석을 통해{'\n'}나만의 스타일을 찾아드려요!</Text>
        </View>
      )}

      {showButton && image && (
        <TouchableOpacity style={styles.suggestionBtn} onPress={analyzeImage}>
          <Text style={styles.suggestionText}>추천 받기</Text>
        </TouchableOpacity>
      )}

      {loading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#81C999" style={styles.loader} />
          <Text style={styles.loaderText}>생성 중...</Text>
        </View>
      )}

      {analysis && (
        <View style={styles.resultContainer}>
          <Text style={styles.sectionTitle}>📊 분석 결과</Text>
          <Text style={styles.resultText}>🔹 성별: {analysis.gender}</Text>
          <Text style={styles.resultText}>🔹 얼굴형: {analysis.faceShape}</Text>
          <Text style={styles.resultText}>🔹 이목구비: {analysis.facialFeatures}</Text>
          <Text style={styles.resultText}>🔹 피부색: {analysis.skinTone}</Text>
          <Text style={styles.resultText}>🔹 체형: {analysis.bodyType}</Text>
        </View>
      )}

      {recommendations.length > 0 && (
        <View style={styles.recommendationsContainer}>
          <Text style={styles.sectionTitle}>👕 추천 코디</Text>
          {recommendations.map((rec, index) => (
            <View key={index} style={styles.recommendationCard}>
              <Text style={styles.recommendationTitle}>추천 {index + 1}</Text>
              <ScrollView horizontal style={styles.scrollView}>
              <View style={styles.recommendationContainer}>
              {/* 추천 아이템 텍스트 */}
              <View style={styles.recommendationTextContainer}>
                {rec.items.map((item, idx) => (
                  <Text key={idx} style={styles.recommendationText}>{item}</Text>
                ))}
              </View>
              <View>
                {/* 추천 이미지들: recommendationImages에서 index에 맞는 이미지를 가져오기 */}
                <View style={styles.recommendationImages}>
                  {recommendationImages[index]?.map((imgUri, imgIdx) => (
                    <Image key={imgIdx} source={{ uri: imgUri }} style={styles.clothingImage} />
                  ))}
                </View>
              </View>
              </View>
              </ScrollView>

              {/* 추천 이유 텍스트 */}
              <Text style={styles.recommendationReason}>💡 {rec.reason}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    alignItems: 'center',  
    padding: 20, 
    backgroundColor: '#f5f5f5' 
  },
  subontainer: {  
    justifyContent: 'center',
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 20, 
    color: '#333' 
  },
  image: { 
    marginTop: 30,
    width: 250, 
    height: 290, 
    borderRadius: 10, 
    borderWidth: 2, 
    borderColor: '#81C999', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectImage: {
    width: 250, 
    height: 290, 
    borderRadius: 10, 
    borderWidth: 2, 
    borderColor: '#81C999' 
  },
  uploadText: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
  },
  suggestionPhrase: {
    width: 250, 
    height: 55, 
    borderRadius: 10, 
    marginTop: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionPhraseText: {
    fontSize: 20,
    textAlign: 'center',
    color: '#6eba87',
    fontWeight: 'bold',   
    height: 55, 
  },
  suggestionBtn: {
    width: 250, 
    height: 55, 
    borderRadius: 10, 
    marginTop: 70,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#81C999'
  },
  suggestionText: {
    fontSize: 20,
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold',     
  },
  resultContainer: { 
    padding: 15, 
    backgroundColor: '#fff', 
    borderRadius: 10, 
    width: 250, 
    shadowColor: '#000', 
    shadowOpacity: 0.1, 
    shadowRadius: 5, 
    elevation: 3 
  },
  sectionTitle: { 
    fontWeight: 'bold', 
    fontSize: 20, 
    marginBottom: 10, 
    color: '#81C999' 
  },
  resultText: { 
    fontSize: 16, 
    marginBottom: 5, 
    color: '#555' 

  },
  recommendation: 
  { marginTop: 10, 
    padding: 10, 
    backgroundColor: '#eee', 
    borderRadius: 8,
    width: '100%' 

  },
  // recommendationTitle: 
  // { fontSize: 18, 
  //   fontWeight: 'bold', 
  //   color: '#333' 

  // },
  recommendationsContainer: { 
    marginTop: 20, 
    width: '100%' 
  },
  recommendationCard: { 
    backgroundColor: '#e4ede7', 
    padding: 10, 
    borderRadius: 8, 
    marginBottom: 15, 
    alignItems: 'center' 
  },
  recommendationTitle: {
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 10 ,
    color: '#2f5e3e'
  },
  recommendationContainer:{
    backgroundColor: '#c8e0d0',
    borderRadius: 8,
    padding: 7,
    marginBottom: 10,
  },
  recommendationTextContainer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    gap: 10,
  },
  recommendationImages: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    gap: 10,
  },
  recommendationText: 
  { 
    fontSize: 16, 
    color: '#444',
    width: 100,
    height: 25,
    textAlign: 'center', // 텍스트 중앙 정렬
  },
  recommendationReason: 
  { fontSize: 14, 
    fontStyle: 'italic', 
    color: '#666', 
    marginTop: 5 
  },
  horizontalLine: {
    marginTop: 30,
    marginBottom: 30,
    width: 350, 
    height: 1,  
    backgroundColor: 'silver',
    marginVertical: 10, // Space above and below the line
  },
  recommendationImagesContainer: {
    marginTop: 20,
    width: '100%',
  },
  imagesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  recommendationImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#81C999',
  },
  clothingImage: {
    width: 100, // 각 이미지의 가로 크기
    height: 100, // 각 이미지의 세로 크기
    borderRadius: 8, // 이미지의 모서리 둥글게 만들기
    borderWidth: 2, // 테두리 추가
    borderColor: '#e4ede7', // 테두리 색상 설정
  },
  loaderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    //flexDirection: 'row',  // 아이콘과 텍스트가 가로로 배치되도록
    padding: 20,
    marginTop: 60,
  },
  loader: {
    marginBottom: 5, // 텍스트와의 간격을 위해
  },
  loaderText: {
    fontSize: 16,
    color: '#81C999',
    fontWeight: 'bold',
  },
});

export default CoordinationScreen;
