import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Animated, Easing } from 'react-native';

const SplashScreenComponent = ({ navigation }) => {
  const translateX = useRef(new Animated.Value(-250)).current; 
  const scale = useRef(new Animated.Value(1)).current; // 크기 애니메이션 값

  useEffect(() => {
    const animateHeartBeat = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.1, // 확대
            duration: 500,
            easing: Easing.out(Easing.exp),
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1, // 원래 크기로 돌아오기
            duration: 500,
            easing: Easing.in(Easing.exp),
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animateHeartBeat();

    const timer = setTimeout(() => {
      navigation.replace('MainScreen'); // 스플래시가 끝난 후 메인 화면으로 이동
    }, 3000); // 시간 늘림

    return () => clearTimeout(timer);
  }, [translateX]);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('../../assets/LP.png')}
        style={[styles.logo, { transform: [{ scale }, { translateX }] }]} // 크기 애니메이션과 이동 애니메이션 적용
      />
      <Text style={styles.text}>Love Practice</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  logo: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
    position: 'absolute',
    top: '35%',
    left: '80%',transform: [{ translateX: -150 }, { translateY: -150 }],
  },
  text: {
    marginTop: 700,
    fontSize: 24,
    color: '#ffffff',
  },
});

export default SplashScreenComponent;
