import React, { useState, useEffect } from 'react';
import { Users, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import Button from '../common/Button';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearAuthErrors } from '../../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';

const LoginForm = ({ 
  loading = false, 
  error = null, 
  values = { email: '', password: '' },
  onChange, 
  onSubmit,
  onSwitchToSignup = () => {} 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formValues, setFormValues] = useState({
    email: '',
    password: '',
  });
  const [formTouched, setFormTouched] = useState({});
  const [formErrors, setFormErrors] = useState({});

  const dispatch = useDispatch();
  const navigate = useNavigate();
  
 
  const { 
    loading: reduxLoading = false, 
    errorLogin: reduxError = null, 
    user = null 
  } = useSelector(state => state.auth || {});

  useEffect(() => {
    if (user) {
      // Check if user has admin roles
      const isAdmin = user.roles && user.roles.some(role => 
        role === "ORGANIZATION MANAGER" ||
        role === "DEPARTMENT MANAGER" ||
        role === "TEAM MANAGER" ||
        role === "ADMIN" ||
        role === "admin"
      );
      if (isAdmin) {
        navigate('/dashboard');
      } else {
        navigate('/user-home');
      }
    }
  }, [user, navigate]);

  
  useEffect(() => {
    dispatch(clearAuthErrors());
  }, [dispatch]);

  const validate = (values) => {
    const errors = {};
    if (!values.email.trim()) {
      errors.email = 'Email is required';
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)
    ) {
      errors.email = 'Invalid email address';
    }
    if (!values.password) {
      errors.password = 'Password is required';
    } else if (values.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    if (onChange) {
      onChange(e);
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setFormTouched((prev) => ({ ...prev, [name]: true }));
    const errors = validate(formValues);
    setFormErrors(errors);
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validate(formValues);
    setFormTouched({
      email: true,
      password: true,
    });
    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      if (onSubmit) {
       
        onSubmit(formValues);
      } else {
        
        dispatch(loginUser(formValues));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="card-base max-w-md border border-gray-100"
      >
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
          <p className="text-gray-600">Sign in to your account</p>
        </div>
        
        {(error || reduxError) && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded mb-4 text-center animate-fade-in">
            <span className="font-semibold">
              {typeof (error || reduxError) === 'object' && (error || reduxError).message 
                ? (error || reduxError).message 
                : String(error || reduxError)}
            </span>
          </div>
        )}
        
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formValues.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    formTouched.email && formErrors.email
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300'
                  }`}
                  placeholder="Enter your email"
                />
                {formTouched.email && formErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formValues.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    formTouched.password && formErrors.password
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                {formTouched.password && formErrors.password && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
                )}
              </div>
            </div>
          </div>

          <Button
            type="submit"
            loading={reduxLoading || loading}
            fullWidth
            className="font-semibold transform transition-all duration-200 shadow-lg"
            variant={reduxLoading || loading ? undefined : 'primary'}
            disabled={reduxLoading || loading}
          >
            {reduxLoading || loading ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
                Signing In...
              </span>
            ) : (
              'Sign In'
            )}
          </Button>
        </div>

        <div className="text-center mt-6">
          <p className="text-gray-600">
            Not a member?{' '}
            <Button
              type="button"
              onClick={onSwitchToSignup}
              className="text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors"
              variant="link"
            >
              Sign up here
            </Button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;

