import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useAlert } from '@/template';
import { COLORS, GLOW } from '@/constants/theme';

type Mode = 'login' | 'register' | 'otp';

export function AuthScreen() {
  const { signInWithPassword, sendOTP, verifyOTPAndLogin, operationLoading } = useAuth();
  const { showAlert } = useAlert();

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) { showAlert('Missing fields', 'Enter email and password'); return; }
    const { error } = await signInWithPassword(email.trim(), password);
    if (error) showAlert('Login failed', error);
  };

  const handleSendOTP = async () => {
    if (!email.trim()) { showAlert('Missing email', 'Enter your email address'); return; }
    if (password.length < 6) { showAlert('Weak password', 'Password must be at least 6 characters'); return; }
    if (password !== confirmPassword) { showAlert('Password mismatch', 'Passwords do not match'); return; }
    const { error } = await sendOTP(email.trim());
    if (error) { showAlert('Failed', error); return; }
    setMode('otp');
  };

  const handleVerifyOTP = async () => {
    if (otp.length < 4) { showAlert('Invalid code', 'Enter the 4-digit code'); return; }
    const { error } = await verifyOTPAndLogin(email.trim(), otp, { password });
    if (error) showAlert('Verification failed', error);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Glow orbs background effect */}
        <View style={styles.glowOrb1} />
        <View style={styles.glowOrb2} />

        {/* Logo */}
        <View style={styles.logoSection}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoIcon}>💬</Text>
          </View>
          <Text style={styles.logoText}>{"It's me"}</Text>
          <Text style={styles.logoSub}>Private. Secure. Real-time.</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          {mode === 'otp' ? (
            <>
              <Text style={styles.cardTitle}>Verify Email</Text>
              <Text style={styles.cardDesc}>Enter the 4-digit code sent to {email}</Text>
              <View style={styles.otpRow}>
                {[0, 1, 2, 3].map(i => (
                  <View key={i} style={[styles.otpBox, otp.length > i && styles.otpBoxFilled]}>
                    <Text style={styles.otpDigit}>{otp[i] ?? ''}</Text>
                  </View>
                ))}
              </View>
              <TextInput
                style={styles.hiddenOtpInput}
                value={otp}
                onChangeText={t => setOtp(t.replace(/\D/g, '').slice(0, 4))}
                keyboardType="number-pad"
                maxLength={4}
                autoFocus
              />
              <TouchableOpacity
                style={[styles.btn, styles.btnPrimary, operationLoading && styles.btnDisabled]}
                onPress={handleVerifyOTP}
                disabled={operationLoading}
              >
                {operationLoading ? <ActivityIndicator color="#000" /> : <Text style={styles.btnText}>Verify & Create Account</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={styles.linkBtn} onPress={() => setMode('register')}>
                <Text style={styles.linkText}>← Change email</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.tabRow}>
                <TouchableOpacity
                  style={[styles.tab, mode === 'login' && styles.tabActive]}
                  onPress={() => setMode('login')}
                >
                  <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>Sign In</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tab, mode === 'register' && styles.tabActive]}
                  onPress={() => setMode('register')}
                >
                  <Text style={[styles.tabText, mode === 'register' && styles.tabTextActive]}>Register</Text>
                </TouchableOpacity>
              </View>

              {/* Email */}
              <View style={styles.inputWrap}>
                <Ionicons name="mail-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email address"
                  placeholderTextColor={COLORS.textGray}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Password */}
              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Password"
                  placeholderTextColor={COLORS.textGray}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPass}
                />
                <TouchableOpacity onPress={() => setShowPass(!showPass)} style={{ paddingRight: 12 }}>
                  <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>

              {mode === 'register' && (
                <View style={styles.inputWrap}>
                  <Ionicons name="lock-closed-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Confirm password"
                    placeholderTextColor={COLORS.textGray}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPass}
                  />
                </View>
              )}

              <TouchableOpacity
                style={[styles.btn, styles.btnPrimary, operationLoading && styles.btnDisabled]}
                onPress={mode === 'login' ? handleLogin : handleSendOTP}
                disabled={operationLoading}
              >
                {operationLoading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={styles.btnText}>
                    {mode === 'login' ? 'Sign In' : 'Continue'}
                  </Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>

        <Text style={styles.footer}>{"Your messages are end-to-end encrypted 🔒"}</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  glowOrb1: {
    position: 'absolute', width: 300, height: 300, borderRadius: 150,
    backgroundColor: 'rgba(0,229,160,0.06)', top: -60, left: -100,
  },
  glowOrb2: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(77,200,255,0.05)', top: 200, right: -80,
  },
  logoSection: { alignItems: 'center', marginBottom: 40 },
  logoCircle: {
    width: 88, height: 88, borderRadius: 44, backgroundColor: COLORS.primaryDim,
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
    borderWidth: 1.5, borderColor: COLORS.borderBright,
    ...GLOW.primary,
  },
  logoIcon: { fontSize: 40 },
  logoText: { fontSize: 34, fontWeight: '800', color: COLORS.primary, letterSpacing: 1 },
  logoSub: { fontSize: 14, color: COLORS.textMuted, marginTop: 4 },
  card: {
    width: '100%', backgroundColor: COLORS.bgLight,
    borderRadius: 20, padding: 24,
    borderWidth: 1, borderColor: COLORS.border,
    ...GLOW.subtle,
  },
  cardTitle: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  cardDesc: { fontSize: 14, color: COLORS.textMuted, marginBottom: 24, lineHeight: 20 },
  tabRow: { flexDirection: 'row', backgroundColor: COLORS.bg, borderRadius: 12, padding: 4, marginBottom: 24 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: COLORS.primaryDim, borderWidth: 1, borderColor: COLORS.borderBright },
  tabText: { fontSize: 15, color: COLORS.textMuted, fontWeight: '600' },
  tabTextActive: { color: COLORS.primary },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.bg, borderRadius: 12, marginBottom: 14,
    borderWidth: 1, borderColor: COLORS.border,
    minHeight: 50,
  },
  inputIcon: { paddingLeft: 14, paddingRight: 8 },
  input: { flex: 1, color: COLORS.text, fontSize: 15, paddingVertical: 14, paddingRight: 14 },
  btn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  btnPrimary: { backgroundColor: COLORS.primary, ...GLOW.primary },
  btnDisabled: { opacity: 0.6 },
  btnText: { fontSize: 16, fontWeight: '700', color: '#000' },
  otpRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 8 },
  otpBox: {
    width: 56, height: 64, borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.border,
    backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center',
  },
  otpBoxFilled: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryDim, ...GLOW.subtle },
  otpDigit: { fontSize: 28, fontWeight: '700', color: COLORS.primary },
  hiddenOtpInput: { position: 'absolute', opacity: 0, height: 0 },
  linkBtn: { alignItems: 'center', marginTop: 16 },
  linkText: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
  footer: { marginTop: 32, fontSize: 13, color: COLORS.textGray, textAlign: 'center' },
});
