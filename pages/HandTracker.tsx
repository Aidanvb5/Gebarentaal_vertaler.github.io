import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Camera, useCameraDevices, CameraDevice } from 'react-native-vision-camera';

const HandTracker = ({ onBack }: { onBack: () => void }) => {
  const devices = useCameraDevices();
  const device: CameraDevice | undefined = devices.find(device => device.position === 'back');
  const [hasPermission, setHasPermission] = useState<'authorized' | 'denied' | 'not-determined'>('not-determined');

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(
        status === 'granted'
          ? 'authorized'
          : status === 'denied'
          ? 'denied'
          : 'not-determined'
      );
    })();
  }, []);

  if (!device) {
    return (
      <View style={styles.container}>
        <Text>Loading camera...</Text>
      </View>
    );
  }

  if (hasPermission !== 'authorized') {
    return (
      <View style={styles.container}>
        <Text>No camera permission</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});

export default HandTracker;
