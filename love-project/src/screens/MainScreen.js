import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const MainScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>메인화면</Text>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("MatchingScreen")}>
        <Text style={styles.buttonText}>매칭 화면</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("ConversationScreen")}>
        <Text style={styles.buttonText}>대화 시뮬레이션 화면</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("CoordinationScreen")}>
        <Text style={styles.buttonText}>코디 화면</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("ProfileScreen")}>
        <Text style={styles.buttonText}>프로필 화면</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("SettingScreen")}>
        <Text style={styles.buttonText}>설정 화면</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  button: {
    backgroundColor: '#009688',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});

export default MainScreen;
