// AssistantSelect.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from '@react-native-async-storage/async-storage';

const serverURL = "http://192.168.1.32:5000";

const AssistantSelect = ({ navigation, route }) => {
  const { userUID, gender, idealPhoto: initialIdealPhoto } = route.params;
  const [selectedAssistant, setSelectedAssistant] = useState("");
  const [availableAssistants, setAvailableAssistants] = useState([]);
  const [idealPhoto, setIdealPhoto] = useState(initialIdealPhoto || null);
  const [threadExists, setThreadExists] = useState(false);

  useEffect(() => {
    // AsyncStorage에서 이전에 저장된 이상형 이미지 불러오기
    const loadIdealPhoto = async () => {
      try {
        const storedPhoto = await AsyncStorage.getItem("idealPhoto");
        if (storedPhoto !== null) {
          setIdealPhoto(storedPhoto);
        } else if (initialIdealPhoto) {
          setIdealPhoto(initialIdealPhoto);
        }
      } catch (e) {
        console.error("AsyncStorage에서 이상형 이미지 로드 중 에러:", e);
      }
    };

    loadIdealPhoto();

    // 스레드 존재 여부 확인
    const checkThread = async () => {
      try {
        const response = await fetch(`${serverURL}/get-thread`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userUID }),
        });
        if (response.ok) {
          const data = await response.json();
          setThreadExists(!!data.thread_key);
        }
      } catch (error) {
        console.error("Error checking thread existence:", error);
        setThreadExists(false);
      }
    };

    checkThread();

    // 성별에 따라 어시스턴트 설정
    if (gender === "male") {
      setAvailableAssistants([{ label: "Hwarang", value: "HWARANG" }]);
    } else if (gender === "female") {
      setAvailableAssistants([{ label: "Hana", value: "HANA" }]);
    } else {
      Alert.alert("Error", "유효하지 않은 성별입니다.");
    }
  }, [gender, userUID, initialIdealPhoto]);

  const handleStartConversation = async () => {
    try {
      const selectedPhoto = idealPhoto || "love-project/assets/default-profile-male.png";
  
      if (!selectedAssistant) {
        Alert.alert("Error", "어시스턴트를 선택해주세요.");
        return;
      }
  
      const response = await fetch(`${serverURL}/start-conversation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userUID, 
          partner_id: selectedAssistant, 
          idealPhoto: selectedPhoto 
        }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
  
      navigation.navigate("AIchat", {
        threadKey: data.thread_key,
        assistantId: data.assistant_key,
        userUID,
        idealPhoto: selectedPhoto,
      });
    } catch (error) {
      console.error("Error starting conversation:", error);
      Alert.alert("Error", "대화를 시작할 수 없습니다.");
    }
  };
  
  const handleContinueConversation = async () => {
    try {
      const response = await fetch(`${serverURL}/get-thread`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userUID }),
      });
      if (response.ok) {
        const data = await response.json();
        navigation.navigate("AIchat", {
          threadKey: data.thread_key,
          assistantId: data.assistant_key,
          userUID,
          idealPhoto,
        });
      } else {
        Alert.alert("Error", "대화를 이어갈 수 없습니다.");
      }
    } catch (error) {
      console.error("Error continuing conversation:", error);
      Alert.alert("Error", "대화를 이어갈 수 없습니다.");
    }
  };

  const handleImagePicker = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Image,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
  
      if (!result.canceled) {
        const newUri = result.assets[0].uri;
        console.log("Selected Photo URI:", newUri);
        setIdealPhoto(newUri);
        // 선택한 이미지 URI를 AsyncStorage에 저장
        await AsyncStorage.setItem("idealPhoto", newUri);
      } else {
        console.log("Image picker canceled.");
      }
    } catch (error) {
      console.error("Error picking or uploading photo:", error);
      Alert.alert("Error", "사진을 업로드하는 동안 문제가 발생했습니다.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>어시스턴트를 선택하세요</Text>
      <TouchableOpacity onPress={handleImagePicker} style={styles.imageContainer}>
        {idealPhoto ? (
          <Image source={{ uri: idealPhoto }} style={styles.image} />
        ) : (
          <Text>이상형 사진 업로드 창</Text>
        )}
      </TouchableOpacity>
      <Picker
        selectedValue={selectedAssistant}
        onValueChange={setSelectedAssistant}
        style={styles.picker}
      >
        <Picker.Item label="선택하세요" value="" />
        {availableAssistants.map((assistant, index) => (
          <Picker.Item
            key={index}
            label={assistant.label}
            value={assistant.value}
          />
        ))}
      </Picker>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartConversation}
        >
          <Text style={styles.buttonText}>대화 시작</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={threadExists ? styles.continueButton : styles.disabledButton}
          onPress={handleContinueConversation}
          disabled={!threadExists}
        >
          <Text style={styles.buttonText}>대화 이어하기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#FF9AAB",
  },
  imageContainer: {
    alignSelf: "center",
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: "#FF9AAB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  image: { width: 150, height: 150, borderRadius: 75 },
  picker: { marginBottom: 20, backgroundColor: "#f5f5f5" },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  startButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 10,
    width: "40%",
    alignItems: "center",
  },
  continueButton: {
    backgroundColor: "#FF9AAB",
    padding: 10,
    borderRadius: 10,
    width: "40%",
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#ccc",
    padding: 10,
    borderRadius: 10,
    width: "40%",
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16 },
});

export default AssistantSelect;
