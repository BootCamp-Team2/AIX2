import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';

const ModifyMatchInfo = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [matchInfo, setMatchInfo] = useState({
    userUID: '',
    myGender: '',
    myMBTI: '',
    myHeight: '',
    favoriteHeight: '',
    myAppearance: [],
    favoriteAppearance: [],
  });

  useEffect(() => {
    if (route.params) {
      const { matchInfo } = route.params;
      setMatchInfo({
        userUID: matchInfo.userUID,
        myGender: matchInfo.myGender,
        myMBTI: matchInfo.myMBTI,
        myHeight: matchInfo.myHeight ?? '',
        favoriteHeight: matchInfo.favoriteHeight ?? '',
        myAppearance: matchInfo.myAppearance ?? [],
        favoriteAppearance: matchInfo.favoriteAppearance ?? [],
      });
    }
  }, [route.params]);

  const handleHeightChange = (value, type) => {
    if (type === 'myHeight') {
      setMatchInfo({ ...matchInfo, myHeight: value });
    } else if (type === 'favoriteHeight') {
      setMatchInfo({ ...matchInfo, favoriteHeight: value });
    }
  };

  const handleAppearanceChange = (value, type) => {
    const updated = type === 'my' ? [...matchInfo.myAppearance] : [...matchInfo.favoriteAppearance];
    if (updated.includes(value)) {
      updated.splice(updated.indexOf(value), 1);
    } else if (updated.length < 3) {
      updated.push(value);
    }

    if (type === 'my') {
      setMatchInfo({ ...matchInfo, myAppearance: updated });
    } else {
      setMatchInfo({ ...matchInfo, favoriteAppearance: updated });
    }
  };

  const handleSubmit = async () => {
    const response = await axios.post("http://192.168.1.10:2000/settings/ideal", matchInfo, {
        headers: {"Content-Type": "application/json"}
    });

    if(response.data) {
        Alert.alert("성공적으로 정보가 변경되었습니다.");
        navigation.goBack(); navigation.goBack();
    } else {
        Alert.alert("오류가 발생했습니다. 다시 시도해주세요.")
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>내 정보 수정</Text>
      </View>

      {/* MBTI Selection */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>MBTI</Text>
        <View style={styles.buttonContainer}>
          {['INFP', 'INTJ', 'ENFP', 'ENTJ', 'ISFP', 'ISTJ', 'ESFP', 'ESTJ', 'INFJ', 'INTP', 'ENFJ', 'ENTP', 'ISFJ', 'ISTP', 'ESFJ', 'ESTP'].map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.button,
                matchInfo.myMBTI === item && styles.selectedButton,
              ]}
              onPress={() => setMatchInfo({ ...matchInfo, myMBTI: item })}
            >
              <Text style={styles.buttonText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Height Selection */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>나의 키</Text>
        <View style={styles.radioContainer}>
          {['작음', '평균', '큼'].map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.radioButton,
                matchInfo.myHeight === item && styles.selectedRadioButton,
              ]}
              onPress={() => handleHeightChange(item, 'myHeight')}
            >
              <Text style={styles.radioText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>내가 원하는 키</Text>
        <View style={styles.radioContainer}>
          {['작음', '평균', '큼'].map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.radioButton,
                matchInfo.favoriteHeight === item && styles.selectedRadioButton,
              ]}
              onPress={() => handleHeightChange(item, 'favoriteHeight')}
            >
              <Text style={styles.radioText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Appearance Selection */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>나의 외모</Text>
        <View style={styles.checkboxContainer}>
          {['귀여움', '매력적', '활기참', '미소', '단아함', '청순함', '중성미', '카리스마', '스포티', '패션감각'].map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.checkbox,
                matchInfo.myAppearance.includes(item) && styles.selectedCheckbox,
              ]}
              onPress={() => handleAppearanceChange(item, 'my')}
            >
              <Text style={styles.checkboxText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>내가 원하는 외모</Text>
        <View style={styles.checkboxContainer}>
          {['귀여움', '매력적', '활기참', '미소', '단아함', '청순함', '중성미', '카리스마', '스포티', '패션감각'].map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.checkbox,
                matchInfo.favoriteAppearance.includes(item) && styles.selectedCheckbox,
              ]}
              onPress={() => handleAppearanceChange(item, 'favorite')}
            >
              <Text style={styles.checkboxText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Summary */}
      <View style={styles.summary}>
        <Text style={styles.summaryText}>선택된 MBTI: {matchInfo.myMBTI}</Text>
        <Text style={styles.summaryText}>나의 키: {matchInfo.myHeight}</Text>
        <Text style={styles.summaryText}>내가 원하는 키: {matchInfo.favoriteHeight}</Text>
        <Text style={styles.summaryText}>나의 외모: {matchInfo.myAppearance.join(', ')}</Text>
        <Text style={styles.summaryText}>내가 원하는 외모: {matchInfo.favoriteAppearance.join(', ')}</Text>
      </View>

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>수정완료!</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8e3f1', // Light pink background
    padding: 20,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff66b2', // Pink color for title
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    color: '#ff66b2', // Pink color for label text
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  button: {
    backgroundColor: '#fff',
    padding: 10,
    margin: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ff66b2',
  },
  selectedButton: {
    backgroundColor: '#ff66b2', // Selected button background
  },
  buttonText: {
    color: '#333',
    fontSize: 14,
  },
  radioContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  radioButton: {
    padding: 10,
    margin: 5,
    backgroundColor: '#fff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ff66b2',
  },
  selectedRadioButton: {
    backgroundColor: '#ff66b2', // Selected radio button background
  },
  radioText: {
    fontSize: 16,
    color: '#333',
  },
  checkboxContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  checkbox: {
    padding: 10,
    margin: 5,
    backgroundColor: '#fff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ff66b2',
  },
  selectedCheckbox: {
    backgroundColor: '#ff66b2', // Selected checkbox background
  },
  checkboxText: {
    fontSize: 16,
    color: '#333',
  },
  summary: {
    marginTop: 30,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ff66b2',
  },
  summaryText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  submitButton: {
    backgroundColor: '#ff66b2',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ModifyMatchInfo;
