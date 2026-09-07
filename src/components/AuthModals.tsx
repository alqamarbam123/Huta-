import React, { useState } from 'react';
import { User } from '../types';
import { X, Shield, Lock, User as UserIcon, KeyRound, Loader2, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

interface AuthModalsProps {
  isAdminLoginOpen: boolean;
  onCloseAdminLogin: () => void;
  onAdminLoginSuccess: () => void;

  isUserAuthOpen: boolean;
  onCloseUserAuth: () => void;
  onUserAuthSuccess: (user: User) => void;

  isChangePasswordOpen: boolean;
  onCloseChangePassword: () => void;

  currentUser: User | null;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AuthModals: React.FC<AuthModalsProps> = ({
  isAdminLoginOpen,
  onCloseAdminLogin,
  onAdminLoginSuccess,
  isUserAuthOpen,
  onCloseUserAuth,
  onUserAuthSuccess,
  isChangePasswordOpen,
  onCloseChangePassword,
  currentUser,
  onToast,
}) => {
  // Admin Login State
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminSubmitting, setIsAdminSubmitting] = useState(false);
  const [isAdminChangingPassword, setIsAdminChangingPassword] = useState(false);
  const [adminOldPass, setAdminOldPass] = useState('');
  const [adminNewPass, setAdminNewPass] = useState('');
  const [adminConfirmPass, setAdminConfirmPass] = useState('');
  const [isAdminPassChanging, setIsAdminPassChanging] = useState(false);

  // User Auth Mode (Login vs Register)
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authFullname, setAuthFullname] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authSecurityQuestion, setAuthSecurityQuestion] = useState('pet');
  const [authSecurityAnswer, setAuthSecurityAnswer] = useState('');
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);

  // Forgot Password / Reset Modal State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotUsername, setForgotUsername] = useState('');
  const [fetchedQuestion, setFetchedQuestion] = useState('');
  const [forgotAnswer, setForgotAnswer] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [isFetchingQuestion, setIsFetchingQuestion] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Change Password State
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmNewPass, setConfirmNewPass] = useState('');
  const [isUpdatingPass, setIsUpdatingPass] = useState(false);

  // Handlers
  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdminSubmitting(true);
    try {
      await api.adminLogin(adminPassword);
      onAdminLoginSuccess();
      onCloseAdminLogin();
      setAdminPassword('');
      onToast('Admin login successful! Welcome to Control Panel.', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid admin password';
      onToast(msg, 'error');
    } finally {
      setIsAdminSubmitting(false);
    }
  };

  const handleAdminChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminNewPass !== adminConfirmPass) {
      onToast('New password and confirmation do not match.', 'error');
      return;
    }
    if (adminNewPass.length < 6) {
      onToast('New password must be at least 6 characters.', 'error');
      return;
    }

    setIsAdminPassChanging(true);
    try {
      const res = await api.changeAdminPassword(adminOldPass, adminNewPass);
      onToast(res.message || 'Admin password updated successfully!', 'success');
      setIsAdminChangingPassword(false);
      setAdminOldPass('');
      setAdminNewPass('');
      setAdminConfirmPass('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update admin password';
      onToast(msg, 'error');
    } finally {
      setIsAdminPassChanging(false);
    }
  };

  const handleUserAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthSubmitting(true);

    try {
      if (isLoginMode) {
        const user = await api.userLogin(authUsername.trim(), authPassword);
        onUserAuthSuccess(user);
        onCloseUserAuth();
        setAuthPassword('');
        onToast(`Welcome back, ${user.fullname || user.username}!`, 'success');
      } else {
        if (authPassword.length < 6) {
          onToast('Password must be at least 6 characters.', 'error');
          setIsAuthSubmitting(false);
          return;
        }
        const user = await api.userRegister({
          username: authUsername.trim(),
          fullname: authFullname.trim() || authUsername.trim(),
          email: authEmail.trim(),
          password: authPassword,
          securityQuestion: authSecurityQuestion,
          securityAnswer: authSecurityAnswer.trim(),
        });
        onUserAuthSuccess(user);
        onCloseUserAuth();
        setAuthPassword('');
        onToast('Account created successfully! Welcome to HUTA.', 'success');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      onToast(msg, 'error');
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  const handleFetchQuestion = async () => {
    if (!forgotUsername.trim()) {
      onToast('Please enter your username first.', 'error');
      return;
    }
    setIsFetchingQuestion(true);
    try {
      const res = await api.getSecurityQuestion(forgotUsername.trim());
      setFetchedQuestion(res.question);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'User not found';
      onToast(msg, 'error');
      setFetchedQuestion('');
    } finally {
      setIsFetchingQuestion(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotNewPassword.length < 6) {
      onToast('New password must be at least 6 characters.', 'error');
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      onToast('Passwords do not match.', 'error');
      return;
    }

    setIsResetting(true);
    try {
      await api.resetPassword(forgotUsername.trim(), forgotAnswer.trim(), forgotNewPassword);
      onToast('Password reset successfully! You can now log in.', 'success');
      setIsForgotModalOpen(false);
      setForgotUsername('');
      setFetchedQuestion('');
      setForgotAnswer('');
      setForgotNewPassword('');
      setForgotConfirmPassword('');
      // Open login modal
      setIsLoginMode(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to reset password';
      onToast(msg, 'error');
    } finally {
      setIsResetting(false);
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (newPass.length < 6) {
      onToast('New password must be at least 6 characters.', 'error');
      return;
    }
    if (newPass !== confirmNewPass) {
      onToast('Passwords do not match.', 'error');
      return;
    }

    setIsUpdatingPass(true);
    try {
      await api.changePassword(currentUser.id, currentPass, newPass);
      onToast('Password updated successfully!', 'success');
      onCloseChangePassword();
      setCurrentPass('');
      setNewPass('');
      setConfirmNewPass('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Password update failed';
      onToast(msg, 'error');
    } finally {
      setIsUpdatingPass(false);
    }
  };

  return (
    <>
      {/* 1. Admin Login Modal */}
      {isAdminLoginOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={onCloseAdminLogin}
        >
          <div
            className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-7 shadow-2xl relative border border-gray-100 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#FF5A36]/15 text-[#FF5A36] flex items-center justify-center font-bold">
                  <Shield className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-lg text-gray-900">
                  {isAdminChangingPassword ? 'Change Admin Password' : 'Admin Login'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAdminChangingPassword(false);
                  onCloseAdminLogin();
                }}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!isAdminChangingPassword ? (
              <form onSubmit={handleAdminSubmit} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Admin Master Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Enter admin password..."
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] outline-none"
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[11px] text-gray-400">Default: admin123</span>
                    <button
                      type="button"
                      onClick={() => setIsAdminChangingPassword(true)}
                      className="text-[11px] font-semibold text-[#FF5A36] hover:underline"
                    >
                      Change Admin Password?
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isAdminSubmitting}
                  className="w-full bg-[#111217] hover:bg-black text-white font-bold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isAdminSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <span>Enter Dashboard</span>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleAdminChangePasswordSubmit} className="mt-5 space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Current Admin Password
                  </label>
                  <input
                    type="password"
                    required
                    value={adminOldPass}
                    onChange={(e) => setAdminOldPass(e.target.value)}
                    placeholder="Current password (default admin123)"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    New Admin Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={adminNewPass}
                    onChange={(e) => setAdminNewPass(e.target.value)}
                    placeholder="New password (min 6 characters)"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={adminConfirmPass}
                    onChange={(e) => setAdminConfirmPass(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] outline-none"
                  />
                </div>

                <div className="pt-1 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAdminChangingPassword(false)}
                    className="w-1/3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAdminPassChanging}
                    className="w-2/3 bg-[#FF5A36] hover:bg-[#E04826] text-white font-bold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer"
                  >
                    {isAdminPassChanging ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <span>Save New Password</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 2. User Login & Register Modal */}
      {isUserAuthOpen && !isForgotModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={onCloseUserAuth}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative border border-gray-100 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#FF5A36]/15 text-[#FF5A36] flex items-center justify-center font-bold">
                  <UserIcon className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-lg text-gray-900">
                  {isLoginMode ? 'Member Login' : 'Create an Account'}
                </h3>
              </div>
              <button
                type="button"
                onClick={onCloseUserAuth}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUserAuthSubmit} className="mt-5 space-y-3.5">
              {/* If Register: Full Name */}
              {!isLoginMode && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={authFullname}
                    onChange={(e) => setAuthFullname(e.target.value)}
                    placeholder="e.g. Kasun Perera"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] outline-none"
                  />
                </div>
              )}

              {/* Username */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Username or Email <span className="text-[#FF5A36]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={authUsername}
                  onChange={(e) => setAuthUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] outline-none"
                />
              </div>

              {/* If Register: Email */}
              {!isLoginMode && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="kasun@example.lk"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] outline-none"
                  />
                </div>
              )}

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Password <span className="text-[#FF5A36]">*</span>
                  </label>
                  {isLoginMode && (
                    <button
                      type="button"
                      onClick={() => setIsForgotModalOpen(true)}
                      className="text-xs text-[#FF5A36] hover:underline font-semibold"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] outline-none"
                />
              </div>

              {/* If Register: Security Question */}
              {!isLoginMode && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Security Question (for recovery) <span className="text-[#FF5A36]">*</span>
                    </label>
                    <select
                      value={authSecurityQuestion}
                      onChange={(e) => setAuthSecurityQuestion(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] outline-none bg-white cursor-pointer"
                    >
                      <option value="pet">What is your pet's name?</option>
                      <option value="mother">What is your mother's maiden name?</option>
                      <option value="city">What city were you born in?</option>
                      <option value="school">What is your primary school name?</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Security Answer <span className="text-[#FF5A36]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={authSecurityAnswer}
                      onChange={(e) => setAuthSecurityAnswer(e.target.value)}
                      placeholder="Your secret answer..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] outline-none"
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={isAuthSubmitting}
                className="w-full bg-[#FF5A36] hover:bg-[#E04826] text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                {isAuthSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>{isLoginMode ? 'Login to Account' : 'Register Account'}</span>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsLoginMode(!isLoginMode)}
                  className="text-xs text-gray-600 hover:text-gray-900 font-semibold"
                >
                  {isLoginMode ? (
                    <span>
                      Don't have an account? <strong className="text-[#FF5A36]">Create New Account</strong>
                    </span>
                  ) : (
                    <span>
                      Already have an account? <strong className="text-[#FF5A36]">Sign In</strong>
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Password Reset (Forgot Password) Modal */}
      {isForgotModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsForgotModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative border border-gray-100 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#FF5A36]" />
                <h3 className="font-extrabold text-lg text-gray-900">Reset Account Password</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Your Username
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={forgotUsername}
                    onChange={(e) => {
                      setForgotUsername(e.target.value);
                      setFetchedQuestion('');
                    }}
                    placeholder="Enter registered username"
                    className="flex-1 px-3.5 py-2 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleFetchQuestion}
                    disabled={isFetchingQuestion}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-colors shrink-0"
                  >
                    {isFetchingQuestion ? 'Checking...' : 'Find Question'}
                  </button>
                </div>
              </div>

              {fetchedQuestion && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl text-xs text-orange-900 space-y-1">
                  <span className="font-bold">Security Question:</span>
                  <p className="font-medium text-sm text-gray-900">{fetchedQuestion}</p>
                </div>
              )}

              {fetchedQuestion && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Your Security Answer
                    </label>
                    <input
                      type="text"
                      required
                      value={forgotAnswer}
                      onChange={(e) => setForgotAnswer(e.target.value)}
                      placeholder="Type your answer"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={forgotConfirmPassword}
                      onChange={(e) => setForgotConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isResetting}
                    className="w-full bg-[#FF5A36] hover:bg-[#E04826] text-white font-bold py-2.5 rounded-xl text-sm shadow-md transition-colors flex items-center justify-center gap-2"
                  >
                    {isResetting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <span>Reset Password</span>
                    )}
                  </button>
                </>
              )}

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(false)}
                  className="text-xs text-gray-500 hover:text-gray-900 font-semibold"
                >
                  Cancel and return to login
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Change Password Modal (For logged in user) */}
      {isChangePasswordOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={onCloseChangePassword}
        >
          <div
            className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative border border-gray-100 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#FF5A36]" />
                <h3 className="font-extrabold text-lg text-gray-900">Change Password</h3>
              </div>
              <button
                type="button"
                onClick={onCloseChangePassword}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleChangePasswordSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmNewPass}
                  onChange={(e) => setConfirmNewPass(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isUpdatingPass}
                className="w-full bg-[#111217] hover:bg-black text-white font-bold py-2.5 rounded-xl text-sm transition-colors mt-2 flex items-center justify-center gap-2"
              >
                {isUpdatingPass ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <span>Save New Password</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
