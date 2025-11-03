import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { User, RefreshCcw } from 'lucide-react-native';
import { useAuth } from '../../contexts/auth-context';
import { useTheme } from '../../contexts/theme-context';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function ProfileScreen() {
  const { user, updateProfile, logout } = useAuth();
  const { colors } = useTheme();

  const [name, setName] = useState(user?.name || '');
  const [profilePhoto, setProfilePhoto] = useState(user?.profilePhoto || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [location, setLocation] = useState(user?.location || '');
  const [loading, setLoading] = useState(false);
  const [locLoading, setLocLoading] = useState(false);

  // Request permissions and auto-fetch location
  const fetchLocation = async () => {
    setLocLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location required', 'Allow location access to verify your location.');
        setLocLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      const [placemark] = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      if (placemark) {
        const formattedLocation = `${placemark.city || ''}, ${placemark.region || ''}, ${placemark.country || ''}`;
        setLocation(formattedLocation);
      }
    } catch (err) {
      console.error('Error fetching location:', err);
      Alert.alert('Error', 'Failed to fetch location.');
    }
    setLocLoading(false);
  };

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted' || galleryStatus.status !== 'granted') {
          Alert.alert('Permissions required', 'Allow camera and gallery access to update your profile photo.');
        }
      }
      await fetchLocation();
    })();
  }, []);

  const handlePhotoSelect = async () => {
    Alert.alert('Profile Photo', 'Choose an option', [
      {
        text: 'Take Photo',
        onPress: async () => {
          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          });
          if (!result.canceled) setProfilePhoto(result.assets[0].uri);
        },
      },
      {
        text: 'Choose from Gallery',
        onPress: async () => {
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          });
          if (!result.canceled) setProfilePhoto(result.assets[0].uri);
        },
      },
      { text: 'Remove Photo', style: 'destructive', onPress: () => setProfilePhoto('') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleSaveAllChanges = async () => {
    if (!name.trim()) return Alert.alert('Error', 'Name cannot be empty');
    if (!location.trim()) return Alert.alert('Error', 'Location could not be verified');

    setLoading(true);
    const result = await updateProfile({
      name: name.trim(),
      profilePhoto: profilePhoto || undefined,
      bio: bio.trim() || undefined,
      phone: phone.trim() || undefined,
      location: location.trim() || undefined,
    });
    setLoading(false);

    if (result.success) Alert.alert('Success', 'Changes saved successfully');
    else Alert.alert('Error', result.error || 'Failed to save changes');
  };

  const handleLogout = async () => {
    await logout();
    await AsyncStorage.clear();
    Alert.alert('Logged out', 'You have successfully logged out.');
  };

  const dynamicStyles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    card: { backgroundColor: colors.surface, borderColor: colors.border, marginBottom: 16 },
    editableField: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: colors.surface,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 12,
    },
    fieldContent: { flex: 1, marginRight: 12 },
    fieldLabel: { fontSize: 12, color: colors.textSecondary, marginBottom: 4 },
    fieldValue: { fontSize: 16, color: colors.text },
    refreshButton: { marginLeft: 8, padding: 6, backgroundColor: colors.accent, borderRadius: 6 },
  });

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        {/* Profile Header */}
        <Card style={dynamicStyles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={handlePhotoSelect}>
              {profilePhoto ? (
                <Image source={{ uri: profilePhoto }} style={{ width: 80, height: 80, borderRadius: 40 }} />
              ) : (
                <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' }}>
                  <User size={40} color={colors.textSecondary} />
                </View>
              )}
            </TouchableOpacity>
            <View style={{ marginLeft: 16 }}>
              <Text style={{ color: colors.text, fontSize: 20, fontWeight: 'bold' }}>{user?.name}</Text>
              <Text style={{ color: colors.textSecondary }}>{user?.email}</Text>
            </View>
          </View>
        </Card>

        {/* Editable Fields */}
        <Card style={dynamicStyles.card}>
          {[
            { key: 'name', value: name, setter: setName, placeholder: 'Enter full name', keyboardType: 'default' },
            // { key: 'bio', value: bio, setter: setBio, placeholder: 'Tell us about yourself', multiline: true },
            // { key: 'phone', value: phone, setter: setPhone, placeholder: 'Enter phone number', keyboardType: 'phone-pad' },
          ].map((field) => (
            <View key={field.key} style={dynamicStyles.editableField}>
              <View style={dynamicStyles.fieldContent}>
                <Text style={dynamicStyles.fieldLabel}>{field.key.charAt(0).toUpperCase() + field.key.slice(1)}</Text>
                <Input
                  value={field.value}
                  onChangeText={field.setter}
                  placeholder={field.placeholder}
                  multiline={field.multiline}
                  keyboardType={field.keyboardType as any}
                />
              </View>
            </View>
          ))}

          {/* Location Field with Refresh */}
          <View style={dynamicStyles.editableField}>
            <View style={{ flex: 1 }}>
              <Text style={dynamicStyles.fieldLabel}>Location</Text>
              <Input value={location} placeholder="Location will be verified" editable={false} />
            </View>
            <TouchableOpacity style={dynamicStyles.refreshButton} onPress={fetchLocation} disabled={locLoading}>
              <RefreshCcw size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </Card>

        {/* Save & Logout Buttons */}
        <View style={{ marginTop: 24 }}>
          <Button title="Save Changes" onPress={handleSaveAllChanges} loading={loading} style={{ marginBottom: 12 }} />
          <Button title="Logout" onPress={handleLogout} style={{ backgroundColor: '#ef4444' }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
