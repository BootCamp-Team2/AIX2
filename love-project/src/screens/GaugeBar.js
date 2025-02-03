// GaugeBar.js
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';

const GaugeBar = ({ progress }) => {
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // progress 값에 따라 애니메이션 실행
    Animated.timing(animatedWidth, {
      toValue: progress, // 목표 값 (0 ~ 100)
      duration: 1000, // 애니메이션 지속 시간 (1초)
      easing: Easing.linear, // 선형 애니메이션
      useNativeDriver: false, // 네이티브 드라이버 사용 안 함
    }).start();
  }, [progress]);

  // progress에 따라 색상을 점점 더 진하게 만듦
  const colorInterpolation = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['#FF7C7E', '#FF6062'], //게이지바 핑크 색상이 점점 더 진해지게
  });

  return (
    <View style={styles.container}>
      <View style={styles.gaugeBackground}>
        <Animated.View
          style={[
            styles.gaugeFill,
            {
              width: animatedWidth.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'], // 0% ~ 100%로 변환
              }),
              backgroundColor: colorInterpolation, // 동적 색상 적용
            },
          ]}
        />
      </View>      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  gaugeBackground: {
    width: '93%',
    height: 35,
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  gaugeFill: {
    height: '100%',
    backgroundColor: '#FF6062', // 게이지 바 색상
    borderRadius: 10,
  },
  progressText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default GaugeBar;