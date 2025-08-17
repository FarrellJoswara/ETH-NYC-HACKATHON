import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useRef } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Platform, StatusBar, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';

export default function App() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<'off' | 'on' | 'auto'>('off');
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
      } as any);

      const response = await fetch('http://10.1.11.235:5008/verify-image', {
        method: 'POST',
        body: formData,
      });

      const text = await response.text();
      console.log('Server raw response:', text);

      try {
        const data = JSON.parse(text);
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

  const toggleFlash = () => {
    setFlash(current => {
      switch (current) {
        case 'off': return 'on';
        case 'on': return 'auto';
        case 'auto': return 'off';
        default: return 'off';
      }
    });
  };

  const getFlashIcon = () => {
    switch (flash) {
      case 'on': return 'flash';
      case 'auto': return 'flash-outline';
      default: return 'flash-off';
    }
  };

  async function takePicture() {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        if (photo) {
          await MediaLibrary.saveToLibraryAsync(photo.uri);
          setSaveMessage('Photo saved to camera roll!');
          setShowSaveMessage(true);
          setTimeout(() => setShowSaveMessage(false), 1000);
          console.log('Photo saved:', photo.uri);
          await sendImageForVerification(photo.uri);
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
      <StatusBar barStyle="light-content" backgroundColor="black" />
      
      <CameraView style={styles.camera} facing={facing} flash={flash} ref={cameraRef}>
        {/* Top Control Bar */}
        <SafeAreaView style={styles.topControlBar}>
          <TouchableOpacity style={styles.topButton} onPress={toggleFlash}>
            <Ionicons name={getFlashIcon()} size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.topCenterControls}>
            <TouchableOpacity style={styles.topButton}>
              <Ionicons name="sync" size={20} color="white" />
            </TouchableOpacity>
            <Text style={styles.exposureText}>0.0</Text>
            <TouchableOpacity style={styles.topButton}>
              <Ionicons name="chevron-up" size={20} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.topRightControls}>
            <TouchableOpacity style={styles.topButton}>
              <Ionicons name="timer-outline" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.topButton}>
              <View style={styles.filterButton}>
                <View style={styles.filterIcon}>
                  <View style={styles.filterDot} />
                  <View style={styles.filterDot} />
                  <View style={styles.filterDot} />
                  <View style={styles.filterDot} />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* Zoom Control */}
        <View style={styles.zoomContainer}>
          <View style={styles.zoomButtons}>
            <TouchableOpacity style={styles.zoomButton}>
              <Text style={styles.zoomText}>.5</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.zoomButton, styles.zoomButtonActive]}>
              <Text style={[styles.zoomText, styles.zoomTextActive]}>1x</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.zoomButton}>
              <Text style={styles.zoomText}>2</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.zoomButton}>
              <Text style={styles.zoomText}>5</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          {/* Mode Selector */}
          <View style={styles.modeSelector}>
            <TouchableOpacity>
              <Text style={styles.modeText}>CINEMATIC</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={styles.modeText}>VIDEO</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={[styles.modeText, styles.modeTextActive]}>PHOTO</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={styles.modeText}>PORTRAIT</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={styles.modeText}>PANO</Text>
            </TouchableOpacity>
          </View>

          {/* Camera Controls */}
          <View style={styles.cameraControls}>
            {/* Gallery Thumbnail */}
            <View style={styles.galleryThumbnail}>
              <View style={styles.thumbnailPlaceholder} />
            </View>

            {/* Shutter Button */}
            <TouchableOpacity style={styles.shutterButton} onPress={takePicture}>
              <View style={styles.shutterInner} />
            </TouchableOpacity>

            {/* Flip Camera Button */}
            <TouchableOpacity style={styles.flipCameraButton} onPress={toggleCameraFacing}>
              <Ionicons name="camera-reverse" size={32} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Save Message */}
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
    backgroundColor: 'black',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    color: 'white',
  },
  camera: {
    flex: 1,
  },
  
  // Top Controls
  topControlBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  topButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topCenterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  exposureText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    minWidth: 30,
    textAlign: 'center',
  },
  topRightControls: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterIcon: {
    width: 20,
    height: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
  },
  filterDot: {
    width: 6,
    height: 6,
    backgroundColor: 'white',
    borderRadius: 3,
  },

  // Zoom Controls
  zoomContainer: {
    position: 'absolute',
    bottom: 260, // Moved up to account for Expo Go bar
    alignSelf: 'center',
  },
  zoomButtons: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  zoomButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    minWidth: 36,
    alignItems: 'center',
  },
  zoomButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  zoomText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  zoomTextActive: {
    color: 'white',
  },

  // Bottom Controls
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 100 : 80, // Extra padding for Expo Go bar
  },
  
  // Mode Selector
  modeSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
    gap: 24,
  },
  modeText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  modeTextActive: {
    color: '#FFD700',
    fontSize: 16,
  },

  // Camera Controls
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  
  // Gallery Thumbnail
  galleryThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'white',
  },
  
  // Shutter Button
  shutterButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  shutterInner: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: 'white',
  },
  
  // Flip Camera Button
  flipCameraButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Save Message
  saveMessageContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 250,
    transform: [{ translateX: -125 }],
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveMessageText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});