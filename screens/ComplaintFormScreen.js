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
import { colors, spacing, borderRadius, shadows } from '../constants/theme';

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

  // Synchronize state with context when screen is focused
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

  const categoriesList = [
    { id: 'food', name: t('form.categories.food'), icon: 'restaurant-outline' },
    { id: 'drug', name: t('form.categories.drug'), icon: 'medkit-outline' },
    { id: 'cosmetic', name: t('form.categories.cosmetic'), icon: 'color-palette-outline' },
    { id: 'other', name: t('form.categories.other'), icon: 'chatbox-ellipses-outline' },
  ];

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

  const handleNext = () => {
    if (validateForm()) {
      updateDraft({
        name: fullName.trim(),
        mobile: mobileNumber.trim(),
        category,
        title: title.trim(),
        description: description.trim(),
      });
      navigation.navigate('EvidenceUpload');
    } else {
      Alert.alert(
        t('common.error'),
        locale === 'mr' 
          ? 'कृपया सर्व आवश्यक माहिती भरा.' 
          : 'Please correct the errors in the form before proceeding.',
        [{ text: t('common.ok') }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Wizard Progress Bar */}
      <View style={styles.progressBarWrap}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressStepText}>STEP 1 OF 4</Text>
          <Text style={styles.progressStepName}>
            {locale === 'mr' ? 'तक्रार तपशील' : 'Grievance Particulars'}
          </Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: '25%' }]} />
        </View>
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Section 1: Regulated Sector / Category */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>
              {t('form.categoryLabel')} <Text style={styles.requiredStar}>*</Text>
            </Text>
            <Text style={styles.sectionSubtitle}>
              {locale === 'mr' ? 'योग्य उत्पादन श्रेणी निवडा' : 'Select affected product domain'}
            </Text>

            <View style={styles.categoryGrid}>
              {categoriesList.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryCard,
                      isSelected && styles.categoryCardSelected,
                    ]}
                    onPress={() => {
                      setCategory(cat.id);
                      if (errors.category) setErrors({ ...errors, category: null });
                    }}
                    activeOpacity={0.8}
                  >
                    <Ionicons 
                      name={cat.icon} 
                      size={22} 
                      color={isSelected ? colors.secondary : colors.primary} 
                    />
                    <Text style={[
                      styles.categoryName,
                      isSelected && styles.categoryNameSelected,
                    ]}>
                      {cat.name}
                    </Text>
                    {isSelected && (
                      <View style={styles.catCheckBadge}>
                        <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
            {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
          </View>

          {/* Section 2: Complainant Details */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>
              {locale === 'mr' ? 'तक्रारदाराची माहिती' : 'Complainant Information'}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {locale === 'mr' ? 'तपासाच्या संपर्कासाठी माहिती' : 'Used solely for official verification & SMS updates'}
            </Text>

            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {t('form.fullNameLabel')} <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  focusedField === 'fullName' && styles.inputFocused,
                  errors.fullName && styles.inputError,
                ]}
                placeholder={t('form.fullNamePlaceholder')}
                placeholderTextColor={colors.textMuted}
                value={fullName}
                onChangeText={(text) => {
                  setFullName(text);
                  if (errors.fullName) setErrors({ ...errors, fullName: null });
                }}
                onFocus={() => setFocusedField('fullName')}
                onBlur={() => setFocusedField(null)}
              />
              {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
            </View>

            {/* Mobile Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {t('form.mobileLabel')} <Text style={styles.requiredStar}>*</Text>
              </Text>
              <View style={[
                styles.phoneInputWrap,
                focusedField === 'mobile' && styles.inputFocused,
                errors.mobileNumber && styles.inputError,
              ]}>
                <View style={styles.prefixContainer}>
                  <Text style={styles.prefixText}>+91</Text>
                </View>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="10-digit mobile number"
                  placeholderTextColor={colors.textMuted}
                  value={mobileNumber}
                  onChangeText={(text) => {
                    const cleaned = text.replace(/[^0-9]/g, '');
                    setMobileNumber(cleaned);
                    if (errors.mobileNumber) setErrors({ ...errors, mobileNumber: null });
                  }}
                  keyboardType="numeric"
                  maxLength={10}
                  onFocus={() => setFocusedField('mobile')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
              {errors.mobileNumber && <Text style={styles.errorText}>{errors.mobileNumber}</Text>}
            </View>
          </View>

          {/* Section 3: Grievance Incident Statement */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>
              {locale === 'mr' ? 'घटनेचा तपशील' : 'Incident Statement'}
            </Text>

            {/* Title */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {t('form.titleLabel')} <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  focusedField === 'title' && styles.inputFocused,
                  errors.title && styles.inputError,
                ]}
                placeholder={t('form.titlePlaceholder')}
                placeholderTextColor={colors.textMuted}
                value={title}
                onChangeText={(text) => {
                  setTitle(text);
                  if (errors.title) setErrors({ ...errors, title: null });
                }}
                onFocus={() => setFocusedField('title')}
                onBlur={() => setFocusedField(null)}
              />
              {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
            </View>

            {/* Detailed Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {t('form.descLabel')} <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.textArea,
                  focusedField === 'description' && styles.inputFocused,
                  errors.description && styles.inputError,
                ]}
                placeholder={t('form.descPlaceholder')}
                placeholderTextColor={colors.textMuted}
                value={description}
                onChangeText={(text) => {
                  setDescription(text);
                  if (errors.description) setErrors({ ...errors, description: null });
                }}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                onFocus={() => setFocusedField('description')}
                onBlur={() => setFocusedField(null)}
              />
              {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
            </View>
          </View>

          {/* Action Button */}
          <View style={styles.btnWrap}>
            <CustomButton
              title={locale === 'mr' ? 'फोटो पुरावा जोडा (पुढील पायरी)' : 'Proceed to Evidence Upload →'}
              onPress={handleNext}
              variant="primary"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  progressBarWrap: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressStepText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.secondary,
    letterSpacing: 0.8,
  },
  progressStepName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.secondary,
    borderRadius: 2,
  },
  scrollContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.md,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  requiredStar: {
    color: colors.critical,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryCard: {
    flexBasis: '48%',
    flexGrow: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    minHeight: 74,
  },
  categoryCardSelected: {
    borderColor: colors.secondary,
    backgroundColor: colors.infoBg,
  },
  categoryName: {
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.text,
    marginTop: 6,
    textAlign: 'center',
  },
  categoryNameSelected: {
    color: colors.secondary,
    fontWeight: '700',
  },
  catCheckBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 44,
    fontSize: 14,
    color: colors.text,
  },
  inputFocused: {
    borderColor: colors.secondary,
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: colors.critical,
  },
  phoneInputWrap: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    height: 44,
    overflow: 'hidden',
  },
  prefixContainer: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  prefixText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: spacing.md,
    fontSize: 14,
    color: colors.text,
  },
  textArea: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    minHeight: 90,
    fontSize: 14,
    color: colors.text,
  },
  errorText: {
    fontSize: 11,
    color: colors.critical,
    marginTop: 4,
  },
  btnWrap: {
    marginTop: spacing.sm,
  },
});
