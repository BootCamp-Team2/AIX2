import React, { useState } from 'react';
import { View, Button, Image, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

const AvatarScreen = () => {
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

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
    }
  };

  // 이미지 업로드
  const uploadImage = async () => {
    if (!imageUri) {
      setUploadStatus('No image selected');
      return;
    }

    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg', // 서버에서 요구하는 MIME 타입을 설정
      name: 'photo.jpg', // 업로드할 파일 이름
    });

    try {
      setLoading(true);
      const response = await axios.post('http://127.0.0.1:8000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setUploadStatus('Upload successful');
    } catch (error) {
      console.log(error);
      setUploadStatus('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Take Photo" onPress={takePhoto} />
      <Button title="Choose Image" onPress={chooseImage} style={{ marginTop: 10 }} />
      {imageUri && (
        <View style={{ marginTop: 20 }}>
          <Image
            source={{ uri: imageUri }}
            style={{ width: 200, height: 200 }}
            resizeMode="contain"
          />
        </View>
      )}
      <Button
        title={loading ? 'Uploading...' : 'Upload Image'}
        onPress={uploadImage}
        disabled={loading}
      />
      {uploadStatus && <Text>{uploadStatus}</Text>}
    </View>
  );
};

export default AvatarScreen;
