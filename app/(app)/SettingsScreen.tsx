import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableNativeFeedback,
  ScrollView,
  Switch,
  Alert,
  Modal,
  Image,
  FlatList,
  ImageSourcePropType,
  StatusBar,
  ToastAndroid,
} from "react-native";
import { FONTS } from "@/constants/fonts";

// Define types for icon options
interface IconOption {
  id: string;
  name: string;
  image: ImageSourcePropType;
}

// FlatList renderItem parameter type
interface RenderItemProps {
  item: IconOption;
}

const SettingsScreen: React.FC = () => {
  // State for various settings
  const [notifications, setNotifications] = useState<boolean>(true);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [locationServices, setLocationServices] = useState<boolean>(true);
  const [biometricLogin, setBiometricLogin] = useState<boolean>(false);
  const [autoUpdate, setAutoUpdate] = useState<boolean>(true);
  const [dataSync, setDataSync] = useState<boolean>(true);

  // State for app icon camouflage
  const [camouflageEnabled, setCamouflageEnabled] = useState<boolean>(false);
  const [currentIcon, setCurrentIcon] = useState<string>("default");
  const [iconSelectorVisible, setIconSelectorVisible] =
    useState<boolean>(false);

  // Sample icon options (in a real app, these would be actual alternative icons)
  const iconOptions: IconOption[] = [
    {
      id: "default",
      name: "Default",
      image: require("@/assets/icons/rocket-icon.png"),
    },
    {
      id: "calculator",
      name: "Calculator",
      image: require("@/assets/icons/rocket-icon.png"),
    },
    {
      id: "notes",
      name: "Notes",
      image: require("@/assets/icons/rocket-icon.png"),
    },
    {
      id: "calendar",
      name: "Calendar",
      image: require("@/assets/icons/rocket-icon.png"),
    },
    {
      id: "weather",
      name: "Weather",
      image: require("@/assets/icons/rocket-icon.png"),
    },
  ];

  // Handle reset settings
  const handleResetSettings = (): void => {
    Alert.alert(
      "Reset Settings",
      "Are you sure you want to reset all settings to default?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reset",
          onPress: () => {
            setNotifications(true);
            setDarkMode(false);
            setLocationServices(true);
            setBiometricLogin(false);
            setAutoUpdate(true);
            setDataSync(true);
            setCamouflageEnabled(false);
            setCurrentIcon("default");
            // Show toast notification (Android style)
            ToastAndroid.show("Settings reset to default", ToastAndroid.SHORT);
          },
          style: "destructive",
        },
      ]
    );
  };

  // Handle clearing cache
  const handleClearCache = (): void => {
    Alert.alert(
      "Clear Cache",
      "Are you sure you want to clear all cached data?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear",
          onPress: () => {
            // Show toast notification (Android style)
            ToastAndroid.show("Cache cleared successfully", ToastAndroid.SHORT);
          },
          style: "destructive",
        },
      ]
    );
  };

  // Handle toggling camouflage mode
  const toggleCamouflage = (value: boolean): void => {
    setCamouflageEnabled(value);

    if (value) {
      // Show icon selector when enabling
      setIconSelectorVisible(true);
    } else {
      // Reset to default icon when disabling
      changeAppIcon("default");
    }
  };

  // Handle changing app icon
  const changeAppIcon = (iconId: string): void => {
    setCurrentIcon(iconId);

    // In a real implementation, you would use a package like react-native-app-shortcut
    // or a custom native module for Android

    // For this demo, just show a toast (Android style)
    ToastAndroid.show(`Icon changed to ${iconId}`, ToastAndroid.SHORT);

    setIconSelectorVisible(false);
  };

  // Render icon option item
  const renderIconOption = ({ item }: RenderItemProps): React.ReactElement => (
    <TouchableNativeFeedback
      onPress={() => changeAppIcon(item.id)}
      background={TouchableNativeFeedback.Ripple("rgba(0, 0, 0, 0.1)", false)}
    >
      <View
        style={[
          styles.iconOption,
          currentIcon === item.id && styles.selectedIconOption,
        ]}
      >
        <Image source={item.image} style={styles.iconImage} />
        <Text style={styles.iconName}>{item.name}</Text>
        {currentIcon === item.id && (
          <View style={styles.radioButton}>
            <View style={styles.radioButtonInner} />
          </View>
        )}
      </View>
    </TouchableNativeFeedback>
  );

  const renderSectionHeader = (title: string): React.ReactElement => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  const renderSwitch = (
    value: boolean,
    onValueChange: (value: boolean) => void
  ): React.ReactElement => (
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: "#ccc", true: "#bbd8f9" }}
      thumbColor={value ? "#4285F4" : "#f1f1f1"}
    />
  );

  return (
    <View style={styles.screenContainer}>
      <StatusBar backgroundColor='#4285F4' barStyle='light-content' />

      {/* Toolbar - Android style */}
      <View style={styles.toolbar}>
        <Text style={styles.toolbarTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.container}>
        {/* App Preferences Section */}
        {renderSectionHeader("App Preferences")}
        <View style={styles.card}>
          <TouchableNativeFeedback
            background={TouchableNativeFeedback.Ripple(
              "rgba(0, 0, 0, 0.1)",
              false
            )}
          >
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Notifications</Text>
              {renderSwitch(notifications, setNotifications)}
            </View>
          </TouchableNativeFeedback>

          <View style={styles.divider} />

          <TouchableNativeFeedback
            background={TouchableNativeFeedback.Ripple(
              "rgba(0, 0, 0, 0.1)",
              false
            )}
          >
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Dark Mode</Text>
              {renderSwitch(darkMode, setDarkMode)}
            </View>
          </TouchableNativeFeedback>

          <View style={styles.divider} />

          <TouchableNativeFeedback
            background={TouchableNativeFeedback.Ripple(
              "rgba(0, 0, 0, 0.1)",
              false
            )}
          >
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Location Services</Text>
              {renderSwitch(locationServices, setLocationServices)}
            </View>
          </TouchableNativeFeedback>
        </View>

        {/* Security Section */}
        {renderSectionHeader("Security")}
        <View style={styles.card}>
          <TouchableNativeFeedback
            background={TouchableNativeFeedback.Ripple(
              "rgba(0, 0, 0, 0.1)",
              false
            )}
          >
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Biometric Login</Text>
              {renderSwitch(biometricLogin, setBiometricLogin)}
            </View>
          </TouchableNativeFeedback>

          <View style={styles.divider} />

          <TouchableNativeFeedback
            background={TouchableNativeFeedback.Ripple(
              "rgba(0, 0, 0, 0.1)",
              false
            )}
          >
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Camouflage App Icon</Text>
              {renderSwitch(camouflageEnabled, toggleCamouflage)}
            </View>
          </TouchableNativeFeedback>

          {camouflageEnabled && (
            <>
              <View style={styles.divider} />
              <TouchableNativeFeedback
                onPress={() => setIconSelectorVisible(true)}
                background={TouchableNativeFeedback.Ripple(
                  "rgba(0, 0, 0, 0.1)",
                  false
                )}
              >
                <View style={styles.settingWithArrow}>
                  <Text style={styles.settingLabel}>
                    Choose Camouflage Icon
                  </Text>
                  <Text style={styles.chevron}>›</Text>
                </View>
              </TouchableNativeFeedback>
            </>
          )}

          <View style={styles.divider} />

          <TouchableNativeFeedback
            onPress={() => ToastAndroid.show("Coming soon", ToastAndroid.SHORT)}
            background={TouchableNativeFeedback.Ripple(
              "rgba(0, 0, 0, 0.1)",
              false
            )}
          >
            <View style={styles.settingWithArrow}>
              <Text style={styles.settingLabel}>Change Password</Text>
              <Text style={styles.chevron}>›</Text>
            </View>
          </TouchableNativeFeedback>
        </View>

        {/* Data & Storage Section */}
        {renderSectionHeader("Data & Storage")}
        <View style={styles.card}>
          <TouchableNativeFeedback
            background={TouchableNativeFeedback.Ripple(
              "rgba(0, 0, 0, 0.1)",
              false
            )}
          >
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Auto Update</Text>
              {renderSwitch(autoUpdate, setAutoUpdate)}
            </View>
          </TouchableNativeFeedback>

          <View style={styles.divider} />

          <TouchableNativeFeedback
            background={TouchableNativeFeedback.Ripple(
              "rgba(0, 0, 0, 0.1)",
              false
            )}
          >
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Data Sync</Text>
              {renderSwitch(dataSync, setDataSync)}
            </View>
          </TouchableNativeFeedback>

          <View style={styles.divider} />

          <TouchableNativeFeedback
            onPress={handleClearCache}
            background={TouchableNativeFeedback.Ripple(
              "rgba(0, 0, 0, 0.1)",
              false
            )}
          >
            <View style={styles.settingWithArrow}>
              <Text style={styles.settingLabel}>Clear Cache</Text>
              <Text style={styles.chevron}>›</Text>
            </View>
          </TouchableNativeFeedback>
        </View>

        {/* Information Section */}
        {renderSectionHeader("Information")}
        <View style={styles.card}>
          <TouchableNativeFeedback
            onPress={() =>
              ToastAndroid.show("Privacy Policy", ToastAndroid.SHORT)
            }
            background={TouchableNativeFeedback.Ripple(
              "rgba(0, 0, 0, 0.1)",
              false
            )}
          >
            <View style={styles.settingWithArrow}>
              <Text style={styles.settingLabel}>Privacy Policy</Text>
              <Text style={styles.chevron}>›</Text>
            </View>
          </TouchableNativeFeedback>

          <View style={styles.divider} />

          <TouchableNativeFeedback
            onPress={() =>
              ToastAndroid.show("Terms of Service", ToastAndroid.SHORT)
            }
            background={TouchableNativeFeedback.Ripple(
              "rgba(0, 0, 0, 0.1)",
              false
            )}
          >
            <View style={styles.settingWithArrow}>
              <Text style={styles.settingLabel}>Terms of Service</Text>
              <Text style={styles.chevron}>›</Text>
            </View>
          </TouchableNativeFeedback>

          <View style={styles.divider} />

          <TouchableNativeFeedback
            onPress={() => ToastAndroid.show("About App", ToastAndroid.SHORT)}
            background={TouchableNativeFeedback.Ripple(
              "rgba(0, 0, 0, 0.1)",
              false
            )}
          >
            <View style={styles.settingWithArrow}>
              <Text style={styles.settingLabel}>About</Text>
              <Text style={styles.chevron}>›</Text>
            </View>
          </TouchableNativeFeedback>
        </View>

        {/* Reset Button - Material Button style */}
        <TouchableNativeFeedback
          onPress={handleResetSettings}
          background={TouchableNativeFeedback.Ripple(
            "rgba(255, 255, 255, 0.2)",
            false
          )}
        >
          <View style={styles.materialButton}>
            <Text style={styles.materialButtonText}>RESET ALL SETTINGS</Text>
          </View>
        </TouchableNativeFeedback>

        {/* Version Info */}
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>

      {/* Icon Selector Bottom Sheet (Android style) */}
      <Modal
        visible={iconSelectorVisible}
        transparent={true}
        animationType='slide'
        onRequestClose={() => setIconSelectorVisible(false)}
      >
        <View style={styles.bottomSheetContainer}>
          <View style={styles.bottomSheetContent}>
            <View style={styles.bottomSheetHandle} />

            <Text style={styles.bottomSheetTitle}>Choose Camouflage Icon</Text>
            <Text style={styles.bottomSheetSubtitle}>
              Select an icon to disguise your app
            </Text>

            <FlatList
              data={iconOptions}
              renderItem={renderIconOption}
              keyExtractor={(item: IconOption) => item.id}
              numColumns={2}
              style={styles.iconList}
            />

            <View style={styles.buttonContainer}>
              <TouchableNativeFeedback
                onPress={() => setIconSelectorVisible(false)}
                background={TouchableNativeFeedback.Ripple(
                  "rgba(0, 0, 0, 0.1)",
                  false
                )}
              >
                <View style={[styles.actionButton, styles.cancelButton]}>
                  <Text style={styles.cancelButtonText}>CANCEL</Text>
                </View>
              </TouchableNativeFeedback>

              <TouchableNativeFeedback
                onPress={() => setIconSelectorVisible(false)}
                background={TouchableNativeFeedback.Ripple(
                  "rgba(255, 255, 255, 0.2)",
                  false
                )}
              >
                <View style={[styles.actionButton, styles.applyButton]}>
                  <Text style={styles.applyButtonText}>APPLY</Text>
                </View>
              </TouchableNativeFeedback>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  toolbar: {
    height: 56,
    backgroundColor: "#4285F4",
    elevation: 4,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  toolbarTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "500",
    marginLeft: 16,
  },
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4285F4",
    marginLeft: 16,
    marginTop: 16,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  card: {
    backgroundColor: "#fff",
    marginBottom: 8,
    elevation: 1,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  settingWithArrow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  settingLabel: {
    fontSize: 16,
    color: "#333",
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginLeft: 16,
  },
  chevron: {
    fontSize: 18,
    color: "#757575",
  },
  materialButton: {
    backgroundColor: "#F44336",
    alignSelf: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 2,
    elevation: 2,
    marginTop: 24,
    marginBottom: 16,
  },
  materialButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  versionText: {
    textAlign: "center",
    color: "#757575",
    fontSize: 14,
    marginBottom: 24,
  },
  // Bottom sheet styles (Android style)
  bottomSheetContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  bottomSheetContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    paddingTop: 8,
    elevation: 16,
    maxHeight: "80%",
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#e0e0e0",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 8,
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: "500",
    color: "#333",
    marginTop: 16,
  },
  bottomSheetSubtitle: {
    fontSize: 14,
    color: "#757575",
    marginTop: 8,
    marginBottom: 24,
  },
  iconList: {
    width: "100%",
    marginBottom: 16,
  },
  iconOption: {
    flex: 1,
    margin: 8,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  selectedIconOption: {
    borderColor: "#4285F4",
    backgroundColor: "#f0f8ff",
  },
  iconImage: {
    width: 56,
    height: 56,
    marginBottom: 12,
    resizeMode: "contain",
  },
  iconName: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
  },
  radioButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#4285F4",
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4285F4",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 2,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: "transparent",
  },
  applyButton: {
    backgroundColor: "#4285F4",
  },
  cancelButtonText: {
    color: "#4285F4",
    fontWeight: "500",
    fontSize: 14,
  },
  applyButtonText: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 14,
  },
});

export default SettingsScreen;
