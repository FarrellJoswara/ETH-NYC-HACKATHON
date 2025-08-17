import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useRef } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import JailMonkey from 'jail-monkey'
// import DeviceInfo, { isEmulator } from 'react-native-device-info';

export default function App() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mediaLibraryPermission, requestMediaLibraryPermission] = MediaLibrary.usePermissions();
  const [saveMessage, setSaveMessage] = useState('');
  const [showSaveMessage, setShowSaveMessage] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  if (!cameraPermission || !mediaLibraryPermission) return <View />;
  if (!cameraPermission.granted)
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestCameraPermission} title="Grant Permission" />
      </View>
    );
  if (!mediaLibraryPermission.granted)
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to save photos</Text>
        <Button onPress={requestMediaLibraryPermission} title="Grant Permission" />
      </View>
    );

  // --- Fixed image upload ---
  const sendImageForVerification = async (imageUri: string) => {
    try {
      if (!imageUri) return;

      const filename = imageUri.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      const formData = new FormData();
      formData.append('photo', {
        uri: Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri,
        name: filename,
        type,
      } as any); // Use 'any' for React Native

      //formData.append('is_jailbroken', JSON.stringify(isJailBroken));
      //formData.append('is_emulated', JSON.stringify(isEmulated));
      const response = await fetch('http://10.1.8.13:5000/verify-image', {
        method: 'POST',
        body: formData, // ✅ DO NOT set Content-Type manually
      });

      const text = await response.text(); // Read raw response first
      console.log('Server raw response:', text);

      try {
        const data = JSON.parse(text); // Parse JSON if valid
        console.log('Verification result:', data);
      } catch {
        console.error('Server did not return valid JSON');
      }
    } catch (error) {
      console.error('Error sending image:', error);
    }
  };

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  async function takePicture() {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        if (photo) {
          await MediaLibrary.saveToLibraryAsync(photo.uri);
          setSaveMessage('Photo saved to camera roll!');
          setShowSaveMessage(true);
          setTimeout(() => setShowSaveMessage(false), 1000);
          //DeviceInfo.isEmulator().then((isEmulator) => {
          //});
          console.log('Photo saved:', photo.uri);
          await sendImageForVerification(photo.uri); // Auto-send to Flask
        }
      } catch (error) {
        console.log(error);
        setSaveMessage('Could not save photo');
        setShowSaveMessage(true);
        setTimeout(() => setShowSaveMessage(false), 1000);
      }
    }
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
            <MaterialCommunityIcons name="camera-flip" size={34} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.shutterButton} onPress={takePicture} />
        </View>
        {showSaveMessage && (
          <View style={styles.saveMessageContainer}>
            <Text style={styles.saveMessageText}>{saveMessage}</Text>
          </View>
        )}
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  message: { textAlign: 'center', paddingBottom: 10 },
  camera: { flex: 1 },
  buttonContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    paddingTop: 65,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  flipButton: { alignSelf: 'center', alignItems: 'center' },
  shutterButton: {
    alignSelf: 'center',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
    borderWidth: 4,
    borderColor: '#ccc',
    marginBottom: 70,
  },
  saveMessageContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 250,
    transform: [{ translateX: -125 }],
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveMessageText: { color: 'white', fontSize: 16 },
});
