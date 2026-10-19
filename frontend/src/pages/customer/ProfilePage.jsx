import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import {
  User as UserIcon,
  Mail,
  Phone,
  Shield,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Calendar,
} from 'lucide-react';

export const ProfilePage = () => {
  const { user, refreshUserProfile } = useAuth();

  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone_number: user?.phone_number || '',
  });

  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    new_password_confirm: '',
  });

  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPass, setChangingPass] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg({ type: '', text: '' });

    try {
      await authService.updateProfile(profileData);
      await refreshUserProfile();
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      console.error(err);
      setProfileMsg({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });

    if (passwordData.new_password !== passwordData.new_password_confirm) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setChangingPass(true);

    try {
      await authService.changePassword(
        passwordData.old_password,
        passwordData.new_password,
        passwordData.new_password_confirm
      );
      setPasswordMsg({ type: 'success', text: 'Password changed successfully!' });
      setPasswordData({ old_password: '', new_password: '', new_password_confirm: '' });
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.old_password?.[0] || err.response?.data?.new_password?.[0] || 'Failed to change password. Please check your current password.';
      setPasswordMsg({ type: 'error', text: detail });
    } finally {
      setChangingPass(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-200/80 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-primary-600 to-amber-500 flex items-center justify-center text-white text-3xl font-extrabold uppercase shadow-lg shadow-primary-500/20">
          {user?.first_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
        </div>

        <div className="flex-1 text-center sm:text-left space-y-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 font-heading">
              {user?.full_name || 'My Profile'}
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-100 text-primary-800 w-fit mx-auto sm:mx-0">
              <Shield className="w-3 h-3" /> {user?.role || 'CUSTOMER'}
            </span>
          </div>

          <p className="text-sm text-slate-500 flex items-center justify-center sm:justify-start gap-1.5">
            <Mail className="w-4 h-4 text-slate-400" /> {user?.email}
          </p>

          <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-1.5 pt-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" /> Member since {user?.date_joined ? new Date(user.date_joined).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'Recently'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personal Details Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-200/80 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900 font-heading flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-primary-600" /> Personal Information
            </h2>
            <p className="text-xs text-slate-500">Update your account name and contact number</p>
          </div>

          {profileMsg.text && (
            <div className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-medium ${
              profileMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {profileMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
              {profileMsg.text}
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <Input
              label="First Name"
              required
              value={profileData.first_name}
              onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
            />
            <Input
              label="Last Name"
              value={profileData.last_name}
              onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
            />
            <Input
              label="Mobile Number"
              type="tel"
              value={profileData.phone_number}
              onChange={(e) => setProfileData({ ...profileData, phone_number: e.target.value })}
            />
            <Button type="submit" loading={savingProfile} className="w-full">
              Save Profile Changes
            </Button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-200/80 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900 font-heading flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-amber-600" /> Security & Password
            </h2>
            <p className="text-xs text-slate-500">Ensure your account remains secure with a strong password</p>
          </div>

          {passwordMsg.text && (
            <div className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-medium ${
              passwordMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {passwordMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
              {passwordMsg.text}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              required
              value={passwordData.old_password}
              onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
            />
            <Input
              label="New Password (min 8 chars)"
              type="password"
              required
              value={passwordData.new_password}
              onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
            />
            <Input
              label="Confirm New Password"
              type="password"
              required
              value={passwordData.new_password_confirm}
              onChange={(e) => setPasswordData({ ...passwordData, new_password_confirm: e.target.value })}
            />
            <Button type="submit" variant="outline" loading={changingPass} className="w-full">
              Update Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
