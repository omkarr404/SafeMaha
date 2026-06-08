// FILE NAME: d:\Omkar\Water\FDA\screens\ComplaintFormScreen.js

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  ScrollView, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform, 
  Alert,
  TouchableOpacity,
  StatusBar
} from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { useComplaints } from '../context/ComplaintContext';
import CustomButton from '../components/CustomButton';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';

export default function ComplaintFormScreen({ navigation }) {
  const { t, locale } = useLanguage();
  const { draftComplaint, updateDraft } = useComplaints();
  const isFocused = useIsFocused();

  // Form State
  const [fullName, setFullName] = useState(draftComplaint.name || '');
  const [mobileNumber, setMobileNumber] = useState(draftComplaint.mobile || '');
  const [category, setCategory] = useState(draftComplaint.category || '');
  const [title, setTitle] = useState(draftComplaint.title || '');
  const [description, setDescription] = useState(draftComplaint.description || '');

  // Synchronize state with context when screen is focused (useful when editing or resetting)
  useEffect(() => {
    if (isFocused) {
      setFullName(draftComplaint.name || '');
      setMobileNumber(draftComplaint.mobile || '');
      setCategory(draftComplaint.category || '');
      setTitle(draftComplaint.title || '');
      setDescription(draftComplaint.description || '');
    }
  }, [isFocused, draftComplaint]);

  // Error State
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);

  // Focus Handlers
  const handleFocus = (field) => setFocusedField(field);
  const handleBlur = () => setFocusedField(null);

  const categoriesList = [
    { id: 'food', name: t('form.categories.food'), icon: 'restaurant-outline' },
    { id: 'drug', name: t('form.categories.drug'), icon: 'medkit-outline' },
    { id: 'cosmetic', name: t('form.categories.cosmetic'), icon: 'color-palette-outline' },
    { id: 'other', name: t('form.categories.other'), icon: 'chatbox-ellipses-outline' }
  ];

  // Validation Logic
  const validateForm = () => {
    let tempErrors = {};
    let isValid = true;

    if (!fullName.trim()) {
      tempErrors.fullName = t('form.validation.fullNameRequired');
      isValid = false;
    }

    if (!mobileNumber.trim()) {
      tempErrors.mobileNumber = t('form.validation.mobileRequired');
      isValid = false;
    } else {
      // Basic 10 digit check
      const mobileRegex = /^[0-9]{10}$/;
      if (!mobileRegex.test(mobileNumber.trim())) {
        tempErrors.mobileNumber = t('form.validation.mobileInvalid');
        isValid = false;
      }
    }

    if (!category) {
      tempErrors.category = t('form.validation.categoryRequired');
      isValid = false;
    }

    if (!title.trim()) {
      tempErrors.title = t('form.validation.titleRequired');
      isValid = false;
    }

    if (!description.trim()) {
      tempErrors.description = t('form.validation.descRequired');
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // Update global context draft state
      updateDraft({
        name: fullName.trim(),
        mobile: mobileNumber.trim(),
        category,
        title: title.trim(),
        description: description.trim()
      });
      // Navigate to Evidence Upload screen
      navigation.navigate('EvidenceUpload');
    } else {
      Alert.alert(
        t('common.error'),
        locale === 'mr' ? 'कृपया सर्व आवश्यक फील्ड योग्य तपशीलांसह भरा.' : 'Please correct the errors in the form before submitting.',
        [{ text: t('common.ok'), style: 'cancel' }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.formHeader}>
            <Text style={styles.headerTitle}>{t('form.headerTitle')}</Text>
            <Text style={styles.headerSub}>
              {locale === 'mr' ? 'ग्राहक हक्कांच्या संरक्षणासाठी तक्रार नोंदवा.' : 'Register issues and FDA will process your grievance.'}
            </Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            
            {/* Full Name */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                {t('form.fullNameLabel')} <Text style={styles.asterisk}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  focusedField === 'fullName' && styles.inputFocused,
                  errors.fullName && styles.inputError
                ]}
                placeholder={t('form.fullNamePlaceholder')}
                placeholderTextColor="#94A3B8"
                value={fullName}
                onChangeText={(text) => {
                  setFullName(text);
                  if (errors.fullName) setErrors({ ...errors, fullName: null });
                }}
                onFocus={() => handleFocus('fullName')}
                onBlur={handleBlur}
              />
              {errors.fullName && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle-outline" size={14} color="#EF4444" />
                  <Text style={styles.errorText}>{errors.fullName}</Text>
                </View>
              )}
            </View>

            {/* Mobile Number */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                {t('form.mobileLabel')} <Text style={styles.asterisk}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  focusedField === 'mobileNumber' && styles.inputFocused,
                  errors.mobileNumber && styles.inputError
                ]}
                placeholder={t('form.mobilePlaceholder')}
                placeholderTextColor="#94A3B8"
                value={mobileNumber}
                keyboardType="numeric"
                maxLength={10}
                onChangeText={(text) => {
                  // Only allow numbers
                  const cleaned = text.replace(/[^0-9]/g, '');
                  setMobileNumber(cleaned);
                  if (errors.mobileNumber) setErrors({ ...errors, mobileNumber: null });
                }}
                onFocus={() => handleFocus('mobileNumber')}
                onBlur={handleBlur}
              />
              {errors.mobileNumber && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle-outline" size={14} color="#EF4444" />
                  <Text style={styles.errorText}>{errors.mobileNumber}</Text>
                </View>
              )}
            </View>

            {/* Category Custom Chips Selector */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                {t('form.categoryLabel')} <Text style={styles.asterisk}>*</Text>
              </Text>
              <View style={styles.chipsGrid}>
                {categoriesList.map((item) => {
                  const isSelected = category === item.id;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.chip,
                        isSelected && styles.chipSelected,
                        errors.category && styles.chipErrorBorder
                      ]}
                      onPress={() => {
                        setCategory(item.id);
                        if (errors.category) setErrors({ ...errors, category: null });
                      }}
                      activeOpacity={0.8}
                    >
                      <Ionicons 
                        name={item.icon} 
                        size={18} 
                        color={isSelected ? '#FFFFFF' : '#0A3D62'} 
                        style={styles.chipIcon}
                      />
                      <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {errors.category && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle-outline" size={14} color="#EF4444" />
                  <Text style={styles.errorText}>{errors.category}</Text>
                </View>
              )}
            </View>

            {/* Complaint Title */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                {t('form.titleLabel')} <Text style={styles.asterisk}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  focusedField === 'title' && styles.inputFocused,
                  errors.title && styles.inputError
                ]}
                placeholder={t('form.titlePlaceholder')}
                placeholderTextColor="#94A3B8"
                value={title}
                onChangeText={(text) => {
                  setTitle(text);
                  if (errors.title) setErrors({ ...errors, title: null });
                }}
                onFocus={() => handleFocus('title')}
                onBlur={handleBlur}
              />
              {errors.title && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle-outline" size={14} color="#EF4444" />
                  <Text style={styles.errorText}>{errors.title}</Text>
                </View>
              )}
            </View>

            {/* Description */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                {t('form.descLabel')} <Text style={styles.asterisk}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  focusedField === 'description' && styles.inputFocused,
                  errors.description && styles.inputError
                ]}
                placeholder={t('form.descPlaceholder')}
                placeholderTextColor="#94A3B8"
                value={description}
                multiline={true}
                numberOfLines={6}
                textAlignVertical="top"
                onChangeText={(text) => {
                  setDescription(text);
                  if (errors.description) setErrors({ ...errors, description: null });
                }}
                onFocus={() => handleFocus('description')}
                onBlur={handleBlur}
              />
              {errors.description && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle-outline" size={14} color="#EF4444" />
                  <Text style={styles.errorText}>{errors.description}</Text>
                </View>
              )}
            </View>

            {/* Submit Button */}
            <View style={styles.submitContainer}>
              <CustomButton
                title={t('form.submitBtn')}
                onPress={handleSubmit}
                variant="accent" // Teal accent for submit button
                icon={<Ionicons name="cloud-upload-outline" size={20} color="#FFFFFF" />}
              />
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  formHeader: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0A3D62',
    marginBottom: 6,
  },
  headerSub: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  formContainer: {
    width: '100%',
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0A3D62',
    marginBottom: 8,
  },
  asterisk: {
    color: '#EF4444',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 48,
    fontSize: 15,
    color: '#0F172A',
  },
  inputFocused: {
    borderColor: '#0A3D62',
    backgroundColor: '#FFFFFF',
    shadowColor: '#0A3D62',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  textArea: {
    height: 120,
    paddingTop: 12,
    paddingBottom: 12,
  },
  chipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 16,
    margin: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  chipSelected: {
    backgroundColor: '#0A3D62',
    borderColor: '#0A3D62',
  },
  chipErrorBorder: {
    borderColor: '#EF4444',
  },
  chipIcon: {
    marginRight: 6,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0A3D62',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 4,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  submitContainer: {
    marginTop: 10,
    width: '100%',
  },
});
