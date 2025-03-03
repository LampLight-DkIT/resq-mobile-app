import { Alert, Platform } from "react-native";
import * as Camera from "expo-camera";
import * as Location from "expo-location";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";
import { Audio } from "expo-av";

const requestCameraPermission = async () => {
  try {
    const [permissionResponse] = await Camera.useCameraPermissions();
    const { status } = permissionResponse || {};

    if (status === "granted") {
      console.log("Camera permission granted");
      return true;
    } else {
      Alert.alert(
        "Permission denied",
        "Camera access is required for this feature"
      );
      return false;
    }
  } catch (error) {
    console.log("Error requesting camera permission:", error);
    return false;
  }
};

const requestLocationPermission = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status === "granted") {
      console.log("Location permission granted");
      return true;
    } else {
      Alert.alert(
        "Permission denied",
        "Location access is required for this feature"
      );
      return false;
    }
  } catch (error) {
    console.log("Error requesting location permission:", error);
    return false;
  }
};

const requestMediaLibraryPermission = async () => {
  try {
    const { status } = await MediaLibrary.requestPermissionsAsync();

    if (status === "granted") {
      console.log("Media library permission granted");
      return true;
    } else {
      Alert.alert(
        "Permission denied",
        "Photo library access is required for this feature"
      );
      return false;
    }
  } catch (error) {
    console.log("Error requesting media library permission:", error);
    return false;
  }
};

const requestAudioRecordingPermission = async () => {
  try {
    const { status } = await Audio.requestPermissionsAsync();

    if (status === "granted") {
      console.log("Audio recording permission granted");
      return true;
    } else {
      Alert.alert(
        "Permission denied",
        "Microphone access is required for this feature"
      );
      return false;
    }
  } catch (error) {
    console.log("Error requesting audio permission:", error);
    return false;
  }
};

const pickDocument = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: "*/*", // All file types
      copyToCacheDirectory: true,
    });

    if (result.canceled === false) {
      console.log("Document picked:", result.assets[0].uri);
      return result.assets[0];
    } else {
      console.log("Document picking cancelled");
      return null;
    }
  } catch (error) {
    console.log("Error picking document:", error);
    return null;
  }
};

const takePhoto = async () => {
  const hasPermission = await requestCameraPermission();

  if (hasPermission) {
    console.log("Navigate to camera screen");
  }
};

const pickImage = async () => {
  const hasPermission = await requestMediaLibraryPermission();

  if (hasPermission) {
    const result = await MediaLibrary.getAssetsAsync({
      mediaType: "photo",
      first: 20,
    });
    console.log(`Found ${result.totalCount} photos`);
    return result.assets;
  }
  return null;
};

// Example function to start recording audio
const startRecording = async () => {
  const hasPermission = await requestAudioRecordingPermission();

  if (hasPermission) {
    try {
      console.log("Starting recording...");
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await recording.startAsync();
      console.log("Recording started");
      return recording;
    } catch (error) {
      console.log("Error starting recording:", error);
      return null;
    }
  }
  return null;
};

const getCurrentLocation = async () => {
  const hasPermission = await requestLocationPermission();

  if (hasPermission) {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      console.log("Current location:", location);
      return location;
    } catch (error) {
      console.log("Error getting location:", error);
      return null;
    }
  }
  return null;
};

const saveFile = async (fileUri: any, fileName: string | number) => {
  try {
    if (FileSystem.documentDirectory) {
      const destinationUri = FileSystem.documentDirectory + fileName;
      await FileSystem.copyAsync({
        from: fileUri,
        to: destinationUri,
      });
      console.log("File saved to:", destinationUri);
      return destinationUri;
    } else {
      console.log("Error: FileSystem.documentDirectory is null");
      return null;
    }
  } catch (error) {
    console.log("Error saving file:", error);
    return null;
  }
};

export {
  requestCameraPermission,
  requestLocationPermission,
  requestMediaLibraryPermission,
  requestAudioRecordingPermission,
  pickDocument,
  takePhoto,
  pickImage,
  startRecording,
  getCurrentLocation,
  saveFile,
};
