import React, { useState, useEffect } from 'react';
import { User, Eye, EyeOff, Mail, Lock, ChevronLeft } from 'lucide-react';
import InputField from '../common/InputField';
import Button from '../common/Button';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const SignupForm = ({ 
  loading = false, 
  error = null, 
  values = { name: '', email: '', password: '' }, 
  errors = {}, 
  onChange, 
  onSubmit, 
  onSwitchToLogin,
  onBack = () => {},
  orgId
}) => {
  const [formValues, setFormValues] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  

  const { loading: reduxLoading, error: reduxError, user } = useSelector(state => state.auth || {});

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/user-home');
      }
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    if (onChange) {
      onChange(e);
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validate();
  };

  const validate = () => {
    const validationErrors = {};
    if (!formValues.username.trim()) validationErrors.username = 'Username is required';
    if (!formValues.email.trim()) {
      validationErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formValues.email)) {
      validationErrors.email = 'Email address is invalid';
    }
    if (!formValues.password) validationErrors.password = 'Password is required';
    if (!formValues.confirmPassword) validationErrors.confirmPassword = 'Please confirm your password';
    if (formValues.password && formValues.confirmPassword && formValues.password !== formValues.confirmPassword) {
      validationErrors.confirmPassword = "Passwords don't match";
    }
    setFormErrors(validationErrors);
    return validationErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setTouched({
      username: true,
      email: true,
      password: true,
      confirmPassword: true,
    });
    if (Object.keys(validationErrors).length === 0) {
      if (onSubmit) onSubmit({
        username: formValues.username,
        email: formValues.email,
        password: formValues.password,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="card-base max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <div className="flex items-center mb-4">
            <Button
              onClick={onBack}
              className="bg-gradient-to-r from-purple-600 to-blue-600 p-1 rounded-full hover:from-purple-700 hover:to-blue-700 transition-colors absolute"
              type="button"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </Button>
          </div>
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h2>
          <p className="text-gray-600">Step 2: Your credentials</p>
        </div>
        <div className="space-y-6">
        
          {(error || reduxError) && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded mb-4 text-center animate-fade-in">
              <span className="font-semibold">
                {typeof (error || reduxError) === 'object' && (error || reduxError).message 
                  ? (error || reduxError).message 
                  : String(error || reduxError)}
              </span>
            </div>
          )}
          <div className="space-y-4">
            <InputField
              id="username"
              label="Username"
              icon={User}
              name="username"
              type="text"
              value={formValues.username}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.username && formErrors.username ? formErrors.username : ''}
              placeholder="Enter your username"
            />
            <InputField
              id="email"
              label="Email Address"
              icon={Mail}
              name="email"
              type="email"
              value={formValues.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.email && formErrors.email ? formErrors.email : ''}
              placeholder="Enter your email"
            />
            <div className="relative">
              <InputField
                id="password"
                label="Password"
                icon={Lock}
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formValues.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.password && formErrors.password ? formErrors.password : ''}
                placeholder="Create a password"
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <div className="relative">
              <InputField
                id="confirmPassword"
                label="Confirm Password"
                icon={Lock}
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formValues.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.confirmPassword && formErrors.confirmPassword ? formErrors.confirmPassword : ''}
                placeholder="Confirm your password"
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-9 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || reduxLoading}
            fullWidth
            className="bg-gradient-to-r from-purple-600 to-blue-600 font-semibold hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            variant="primary"
          >
            {(loading || reduxLoading) ? 'Creating Account...' : 'Sign Up'}
          </Button>
        </div>
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Button
              onClick={onSwitchToLogin}
              className="text-purple-600 hover:text-purple-800 font-semibold hover:underline transition-colors"
              type="button"
              variant="link"
            >
              Sign in here
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;