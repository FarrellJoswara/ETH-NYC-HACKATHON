import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useRef, useEffect } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Alert, NativeModules } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';

export default function App() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [isDeviceSecure, setIsDeviceSecure] = useState(true);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mediaLibraryPermission, requestMediaLibraryPermission] = MediaLibrary.usePermissions();
  const [saveMessage, setSaveMessage] = useState('');
  const [showSaveMessage, setShowSaveMessage] = useState(false);
  const cameraRef = useRef<CameraView>(null);


  if (!cameraPermission || !mediaLibraryPermission) {
    // Permissions are still loading
    return <View />;
  }

  if (!cameraPermission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestCameraPermission} title="Grant Permission" />
      </View>
    );
  }

  if (!mediaLibraryPermission.granted) {
    // Media Library permissions are not granted yet
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to save photos</Text>
        <Button onPress={requestMediaLibraryPermission} title="Grant Permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  async function takePicture() {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        if (photo) {
          await MediaLibrary.saveToLibraryAsync(photo.uri);
          
          setSaveMessage("Photo saved to camera roll!");
          setShowSaveMessage(true);
          setTimeout(() => setShowSaveMessage(false), 1000);
        }
      } catch (error) {
        console.log(error);
        setSaveMessage("Could not save photo");
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
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
    },
    camera: {
        flex: 1,
    },
    buttonContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: 'transparent',
        paddingTop: 65,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    flipButton: {
        alignSelf: 'center',
        alignItems: 'center',
    },
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
    saveMessageText: {
      color: 'white',
      fontSize: 16,
    }
});
