import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Mail, Lock, User, Phone, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    password: '',
    password_confirm: '',
  });

  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setGeneralError('');

    if (formData.password !== formData.password_confirm) {
      setErrors({ password_confirm: 'Passwords do not match.' });
      return;
    }

    setLoading(true);

    try {
      await register(formData);
      navigate('/', { replace: true });
    } catch (err) {
      console.error(err);
      if (err.response?.data) {
        if (typeof err.response.data === 'object' && !err.response.data.detail) {
          setErrors(err.response.data);
        } else {
          setGeneralError(err.response.data.detail || 'Registration failed. Please check your information.');
        }
      } else {
        setGeneralError('Network error. Unable to reach Indian Bazar servers.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl shadow-card border border-slate-200/80">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-accent-500 flex items-center justify-center text-white shadow-md">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </Link>
          <h2 className="text-3xl font-extrabold text-slate-900 font-heading">Create Account</h2>
          <p className="text-sm text-slate-500">Join Indian Bazar for exclusive offers & fast checkout</p>
        </div>

        {generalError && (
          <div className="rounded-2xl bg-red-50 p-4 border border-red-200 flex items-start gap-3 text-red-800 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
            <p className="text-xs text-red-700">{generalError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Name"
              name="first_name"
              required
              placeholder="Aman"
              value={formData.first_name}
              onChange={handleChange}
              error={errors.first_name?.[0]}
              icon={User}
            />
            <Input
              label="Last Name"
              name="last_name"
              placeholder="Shaikh"
              value={formData.last_name}
              onChange={handleChange}
              error={errors.last_name?.[0]}
              icon={User}
            />
          </div>

          <Input
            label="Email Address"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            error={errors.email?.[0]}
            icon={Mail}
          />

          <Input
            label="Mobile Number (Optional)"
            name="phone_number"
            type="tel"
            placeholder="9876543210"
            value={formData.phone_number}
            onChange={handleChange}
            error={errors.phone_number?.[0]}
            icon={Phone}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Password"
              name="password"
              type="password"
              required
              placeholder="At least 8 characters"
              value={formData.password}
              onChange={handleChange}
              error={errors.password?.[0]}
              icon={Lock}
            />
            <Input
              label="Confirm Password"
              name="password_confirm"
              type="password"
              required
              placeholder="Repeat password"
              value={formData.password_confirm}
              onChange={handleChange}
              error={errors.password_confirm}
              icon={Lock}
            />
          </div>

          <div className="pt-2">
            <Button type="submit" loading={loading} className="w-full py-3 rounded-xl shadow-md">
              Create Account
            </Button>
          </div>
        </form>

        <div className="text-center pt-2 text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-primary-600 hover:text-primary-700 hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
