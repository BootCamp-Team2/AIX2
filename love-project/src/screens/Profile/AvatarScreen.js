import React, { useState, useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { View, Button, Image, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AvatarScreen = () => {
  const route = useRoute();
  // const { userUID } = route.params  || { userUID: null }; // 기본값 설정
  const { userUID } = route.params;

  const navigation = useNavigation();
  const [imageUri, setImageUri] = useState(null);
  const [avatarUri, setAvatarUri] = useState(null); // 생성된 아바타 URI
  const [profilePhotoUri, setProfilePhotoUri] = useState(null); // 프로필 사진 URI
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [gender, setGender] = useState(null); // 성별 상태 추가
  const [token, setToken] = useState("");

  useEffect(() => {
    const loadAsyncToken = async () => {
      const userToken = await AsyncStorage.getItem('token');
      setToken(userToken);
    };

    loadAsyncToken();
  }, []);

  // 카메라로 이미지 찍기
  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      alert('Camera access is required to take a photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setAvatarUri(null); // 새로운 이미지를 선택하면 기존 아바타를 초기화
    }
  };

  // 이미지 라이브러리에서 선택
  const chooseImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      alert('Media library access is required to choose an image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setAvatarUri(null); // 새로운 이미지를 선택하면 기존 아바타를 초기화
    }
  };

  // 이미지 업로드 및 아바타 생성
  const uploadImage = async () => {
    if (!imageUri) {
      setUploadStatus('No image selected');
      return;
    }

    if (!gender) {
      alert('Please select a gender before uploading.');
      return;
    }

    const formData = new FormData();
    formData.append('img', {
      uri: imageUri,
      type: 'img/jpeg', // 서버에서 요구하는 MIME 타입을 설정
      name: 'photo.jpg', // 업로드할 파일 이름
    });
    formData.append('gender', gender); // 성별 정보 추가
    formData.append('userUID', userUID);

    console.log(`Preparing to upload. Selected gender: ${gender}`);

    try {
      setLoading(true);
      setUploadStatus('');

      const sel_formData = new FormData();
      sel_formData.append("type", "avatar");
      const select_r = await axios.post("http://컴퓨터.주소:1000/select-server", sel_formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (select_r.data)
        if (select_r.data.server_ip == "") {
          Alert.alert("서버가 혼잡합니다. 잠시 후에 다시 시도해주세요.")
          setLoading(false);
          return;
        }
      
      console.log("사용가능한 서버: ", select_r.data.server_ip)
      const response = await axios.post(`${select_r.data.server_ip}/avatar/uploads`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && response.data.avatarUrl) {
        console.log(response.data.avatarUrl)
        setAvatarUri(response.data.avatarUrl); // 서버에서 반환된 아바타 URL 저장
        setUploadStatus('Avatar generated successfully');

      } else {
        setUploadStatus('Failed to generate avatar');
      }
    } catch (error) {
      console.error('Upload failed:', error.message);
      setUploadStatus('Upload failed');
    }

    setLoading(false);
  };

  // 아바타 저장 기능
  const saveAvatar = async () => {
    if (!avatarUri) {
      Alert.alert('No avatar to save', 'Please generate an avatar before saving.');
      return;
    }
  
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Gallery access is required to save the avatar.');
        return;
      }
  
      const localUri = FileSystem.documentDirectory + 'avatar.jpg';
      await FileSystem.downloadAsync(avatarUri, localUri);
  
      const asset = await MediaLibrary.createAssetAsync(localUri);
      await MediaLibrary.createAlbumAsync('Avatar Gallery', asset, false);
  
      Alert.alert('Success', 'Avatar saved to your gallery!');
    } catch (error) {
      console.error('Error saving avatar:', error);
      Alert.alert('Error', `Failed to save avatar. Details: ${error.message}`);
    }
  };

  const applyAvatarToProfile = () => {
    if (!avatarUri) {
      Alert.alert('No avatar to apply', 'Please generate an avatar before applying.');
      return;
    }
    navigation.navigate('ProfileScreen', { avatarUri });
    Alert.alert('Success', 'Avatar applied to profile!');
  };

  // "Apply to Profile" 버튼 핸들러
  const handleApplyToProfile = async () => {
    if (avatarUri) {
      console.log(avatarUri);
      console.log(userUID);
      const formData = new FormData();
      formData.append("img_src", avatarUri);
      formData.append("uid", userUID);
      const avatarResponse = await axios.post("http://컴퓨터.주소:1000/applyAvatar", formData,
        {headers: {"Content-Type": "multipart/form-data"}}
      );

      console.log("Path!: ", avatarResponse.data.avatarPath);

      const response = await axios.post("http://스프링.주소:8080/users/updateCharacterPicture", {character_picture: avatarResponse.data.avatarPath}, 
        {headers: {"Content-Type": "application/json", "Authorization": `Bearer ${token}`,}}
      );
      
      if(response) {
        const newUserData = await axios.get("http://스프링.주소:8080/users/myData",
          {headers: {"Authorization": `Bearer ${token}`}}
        );

        await AsyncStorage.setItem('userData', JSON.stringify(newUserData.data.user));

        Alert.alert("성공적으로 프로필이 적용되었습니다.");
        navigation.replace('TabBar');
      }
    }
  };

  return (
    <ScrollView>
    <View style={styles.container}>
      <Text style={styles.title}>Upload Your Avatar</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={takePhoto}>
          <Ionicons name="camera" size={24} color="white" />
          <Text style={styles.buttonText}>Take Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={chooseImage}>
          <Ionicons name="image" size={24} color="white" />
          <Text style={styles.buttonText}>Choose Image</Text>
        </TouchableOpacity>
      </View>

      {imageUri && (
        <View style={styles.imageCard}>
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
      )}

      <View style={styles.genderContainer}>
        <TouchableOpacity
          style={[styles.genderButton, gender === 'male' && styles.genderButtonSelected]}
          onPress={() => setGender('male')}
        >
          <Text style={styles.genderButtonText}>Male</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.genderButton, gender === 'female' && styles.genderButtonSelected]}
          onPress={() => setGender('female')}
        >
          <Text style={styles.genderButtonText}>Female</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.uploadButton, loading && styles.uploadButtonLoading]}
        onPress={uploadImage}
        disabled={loading}
      >
        <Text style={styles.uploadButtonText}>
          {loading ? 'Uploading...' : 'Upload Image'}
        </Text>
      </TouchableOpacity>

      

      {uploadStatus && <Text style={styles.uploadStatus}>{uploadStatus}</Text>}

      {avatarUri && (
        <View style={styles.avatarCard}>
          <Text style={styles.avatarTitle}>Your Avatar</Text>
          <Image
            source={{ uri: avatarUri }}
            style={styles.avatarImage}
            resizeMode="cover"
          />
          <TouchableOpacity style={styles.button} onPress={saveAvatar}>
            <Ionicons name="save" size={24} color="white" />
            <Text style={styles.buttonText}>Save Avatar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleApplyToProfile}>
            <Ionicons name="checkmark-circle" size={24} color="white" />
            <Text style={styles.buttonText}>Apply to Profile</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F4FF',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#9AAEFF',
    marginBottom: 30,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#9AAEFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    marginTop: 20
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  imageCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    marginBottom: 30,
  },
  image: {
    width: 250,
    height: 250,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  uploadButton: {
    backgroundColor: '#9AAEFF',
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 12,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  uploadButtonLoading: {
    backgroundColor: '#BFCFFF',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  uploadStatus: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    marginTop: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCard: {
    marginTop: 30,
    alignItems: 'center',
  },
  avatarTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 15,
  },
  avatarImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#fff',
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  genderButton: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 10,
  },
  genderButtonSelected: {
    backgroundColor: '#9AAEFF',
  },
  genderButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default AvatarScreen;
