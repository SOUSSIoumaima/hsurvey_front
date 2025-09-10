import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import SignupUser from './SignupUser';
import OrganizationSetup from './OrganizationSetup';
import Dashboard from '../../pages/Dashboard';
import { registerUserForNewOrg, registerUserForExistingOrg, clearAuthErrors, loginUser } from '../../redux/slices/authSlice';
import { createOrganization } from '../../redux/slices/organizationSlice';

const AuthSystem = () => {
  const [currentView, setCurrentView] = useState('login');


  const [loginValues, setLoginValues] = useState({ email: '', password: '' });

 
  const [signupValues, setSignupValues] = useState({ name: '', email: '', password: '' });


  const [signupUserValues, setSignupUserValues] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '',
    invitationCode: '' 
  });


  const [orgValues, setOrgValues] = useState({ organizationName: '', type: '' });

  const [orgId, setOrgId] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  
  const authState = useSelector(state => state.auth || {});
  const orgState = useSelector(state => state.organization || {});

  const { loading: authLoading = false, errorLogin, errorRegisterNewOrg, errorRegisterExistingOrg } = authState;
  const { loading: orgLoading = false, error: orgError = null, currentOrg = null } = orgState;

  const validateForm = (values, type) => {
    const errors = {};

    if (type === 'signup') {
      if (!values.name?.trim()) errors.name = 'Name is required';
      if (!values.email?.trim()) {
        errors.email = 'Email is required';
      } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
        errors.email = 'Invalid email address';
      }
      if (!values.password) {
        errors.password = 'Password is required';
      } else if (values.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }
    }

    if (type === 'signupUser') {
      if (!values.name?.trim()) errors.name = 'Name is required';
      if (!values.email?.trim()) {
        errors.email = 'Email is required';
      } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
        errors.email = 'Invalid email address';
      }
      if (!values.password) {
        errors.password = 'Password is required';
      } else if (values.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }
      if (!values.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (values.password !== values.confirmPassword) {
        errors.confirmPassword = "Passwords don't match";
      }
      if (!values.invitationCode?.trim()) {
        errors.invitationCode = 'Invitation code is required';
      }
    }

    if (type === 'organization') {
      if (!values.organizationName?.trim()) errors.organizationName = 'Organization name is required';
    }

    if (type === 'login') {
      if (!values.email?.trim()) errors.email = 'Email is required';
      if (!values.password) errors.password = 'Password is required';
    }

    return errors;
  };


  const handleLoginChange = e => {
    setLoginValues({ ...loginValues, [e.target.name]: e.target.value });
  };

 
  const handleLoginSubmit = (formValues) => {
    const errors = validateForm(formValues, 'login');
    if (Object.keys(errors).length === 0) {
      dispatch(loginUser(formValues));
    }
  };

 
  const handleSignupChange = e => {
    setSignupValues({ ...signupValues, [e.target.name]: e.target.value });
  };

  const handleSignupSubmit = (formValues) => {
    if (orgId) {
      dispatch(registerUserForNewOrg({ orgId, userData: formValues }));
    }
  };

  
  const handleSignupUserChange = e => {
    setSignupUserValues({ ...signupUserValues, [e.target.name]: e.target.value });
  };

  const handleSignupUserSubmit = (userData) => {
    dispatch(registerUserForExistingOrg(userData));
  };


  const handleOrgSubmit = (orgData) => {
    console.log('Creating organization with data:', orgData);
    dispatch(createOrganization(orgData));
  };
  const handleOrgCreated = (createdOrgId) => {
    console.log('handleOrgCreated called with:', createdOrgId);
    setOrgId(createdOrgId);
    setCurrentView('signup');
  };
  React.useEffect(() => {
    console.log('currentOrg changed:', currentOrg);
    if (currentOrg && (currentOrg.id || currentOrg._id)) {
      const orgIdToUse = currentOrg.id || currentOrg._id;
      console.log('Organization created successfully, proceeding to signup with orgId:', orgIdToUse);
      setOrgId(orgIdToUse);
      setCurrentView('signup');
    }
  }, [currentOrg]);
  React.useEffect(() => {
    const { user } = authState;
    if (user) {
  
      navigate('/dashboard', { replace: true });
    }
  }, [authState.user, navigate]);

  const switchToSignup = () => { dispatch(clearAuthErrors()); setCurrentView('organization'); };
  const switchToLogin = () => { dispatch(clearAuthErrors()); setCurrentView('login'); };
  const switchToJoinOrganization = () => { dispatch(clearAuthErrors()); setCurrentView('signupUser'); };
  const switchToCreateOrganization = () => { dispatch(clearAuthErrors()); setCurrentView('organization'); };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      {currentView === 'login' && (
        <LoginForm
          loading={authLoading}
          error={errorLogin}
          values={loginValues}
          onChange={handleLoginChange}
          onSubmit={handleLoginSubmit}
          onSwitchToSignup={switchToSignup}
        />
      )}
      {currentView === 'signup' && (
        <SignupForm
          loading={authLoading}
          error={errorRegisterNewOrg}
          values={signupValues}
          onChange={handleSignupChange}
          onSubmit={handleSignupSubmit}
          onSwitchToLogin={switchToLogin}
          onBack={() => setCurrentView('organization')}
          orgId={orgId}
        />
      )}
      {currentView === 'signupUser' && (
        <SignupUser
          loading={authLoading}
          error={errorRegisterExistingOrg}
          values={signupUserValues}
          onChange={handleSignupUserChange}
          onSubmit={handleSignupUserSubmit}
          onSwitchToLogin={switchToLogin}
          onSwitchToCreateOrganization={switchToCreateOrganization}
        />
      )}
      {currentView === 'organization' && (
        <OrganizationSetup
          loading={orgLoading}
          error={orgError}
          onSubmit={handleOrgSubmit}
          onOrgCreated={handleOrgCreated}
          onBack={switchToLogin}
          onSwitchToJoinOrganization={switchToJoinOrganization}
        />
      )}
    </div>
  );
};

export default AuthSystem;