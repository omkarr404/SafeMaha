/**
 * SafeMaha Mobile Design System Tokens
 * Food & Drug Administration (FDA), Government of Maharashtra
 */

export const colors = {
  // Primary & Secondary Brand
  primary: '#142B4A',
  primaryHover: '#0E1F35',
  primaryLight: '#1E3A63',
  secondary: '#2563EB',
  secondaryHover: '#1D4ED8',
  secondaryLight: '#3B82F6',

  // Surfaces & Backgrounds
  background: '#F5F7FA',
  surface: '#FFFFFF',
  card: '#FFFFFF',

  // Neutral Typography
  text: '#172B4D',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',

  // Borders & Dividers
  border: '#E2E8F0',
  borderHover: '#CBD5E1',
  borderFocus: '#2563EB',

  // Semantic Status Colors
  success: '#15803D',
  successBg: '#DCFCE7',
  successBorder: '#BBF7D0',

  warning: '#D97706',
  warningBg: '#FEF3C7',
  warningBorder: '#FDE68A',

  critical: '#DC2626',
  criticalBg: '#FEE2E2',
  criticalBorder: '#FECACA',

  info: '#2563EB',
  infoBg: '#EFF6FF',
  infoBorder: '#BFDBFE',

  // Priority specific mapping
  priority: {
    Critical: { color: '#DC2626', bg: '#FEE2E2', border: '#FECACA' },
    High: { color: '#D97706', bg: '#FEF3C7', border: '#FDE68A' },
    Medium: { color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
    Low: { color: '#15803D', bg: '#DCFCE7', border: '#BBF7D0' },
  },

  // Grievance Status mapping
  status: {
    Submitted: { color: '#475569', bg: '#F1F5F9' },
    Assigned: { color: '#2563EB', bg: '#EFF6FF' },
    Investigation: { color: '#D97706', bg: '#FEF3C7' },
    'Action Taken': { color: '#15803D', bg: '#DCFCE7' },
    Closed: { color: '#64748B', bg: '#F1F5F9' },
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const borderRadius = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const typography = {
  h1: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 30,
  },
  h2: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 26,
  },
  h3: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 22,
  },
  body: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.text,
    lineHeight: 22,
  },
  bodySecondary: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textSecondary,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    lineHeight: 16,
  },
  badge: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
};

export const shadows = {
  sm: {
    shadowColor: '#142B4A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#142B4A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#142B4A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
};

export const commonStyles = {
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadows.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
    color: colors.text,
  },
};

export default {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
  commonStyles,
};
