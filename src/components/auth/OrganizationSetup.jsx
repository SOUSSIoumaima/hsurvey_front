import React, { useState, useEffect } from 'react';
import { ChevronLeft, Building2 } from 'lucide-react';
import Button from '../common/Button';
import { useDispatch, useSelector } from 'react-redux';
import { createOrganization } from '../../redux/slices/organizationSlice';
import { useNavigate } from 'react-router-dom';

const OrganizationSetup = ({ 
  loading = false, 
  error = null,
  onBack = () => {}, 
  onSubmit = null, 
  onSwitchToJoinOrganization = () => {},
  onOrgCreated = () => {}
}) => {
  const [values, setValues] = useState({
    name: '',
  });

  const [touched, setTouched] = useState({
    name: false,
  });

  const [errors, setErrors] = useState({});

  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  
  const { 
    loading: orgLoading = false, 
    error: orgError = null, 
    currentOrg = null 
  } = useSelector(state => state.organization || {});


  
  const validate = (fieldValues = values) => {
    let tempErrors = { ...errors };

    if ('name' in fieldValues) {
      tempErrors.name = fieldValues.name.trim() ? '' : 'Organization Name is required';
    }
    
    setErrors(tempErrors);

    return Object.values(tempErrors).every(x => x === '');
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
    validate({ [name]: value });
  };

  const handleBlur = e => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validate(values);
  };

  const handleSubmit = e => {
    e.preventDefault();
    setTouched({ name: true });
    
    if (validate()) {
     
      if (onSubmit) {
       
        onSubmit({ name: values.name });
      } else {
        
       
        dispatch(createOrganization({ name: values.name }));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="card-base max-w-xl border border-gray-100">
        <div className="flex items-center mb-8">
          <button
            onClick={onBack}
            className="bg-gradient-to-r from-blue-600 to-purple-600 mr-8 p-1 mt-[-100px] rounded-full hover:from-blue-700 hover:to-purple-700 transition-colors"
            type="button"
            aria-label="Go back"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <div>
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-[140px] mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2 pr-10">Setup Your Organization</h2>
            <p className="text-gray-600 mx-[70px]">Step 1: Organization Creation</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {(error || orgError) && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded mb-4 text-center animate-fade-in">
              <span className="font-semibold">
                {typeof (error || orgError) === 'object' && (error || orgError).message 
                  ? (error || orgError).message 
                  : String(error || orgError)}
              </span>
            </div>
          )}
          
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-2"
              htmlFor="name"
            >
              Organization Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all ${
                touched.name && errors.name
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300'
              }`}
              placeholder="Enter organization name"
              required
            />
            {touched.name && errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={orgLoading || loading}
            fullWidth
            className="font-semibold transform transition-all duration-200 shadow-lg"
            variant={orgLoading || loading ? undefined : 'primary'}
          >
            {orgLoading || loading ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
                Creating Organization...
              </span>
            ) : (
              'Continue To Account Creation'
            )}
          </Button>

          <div className="text-center mt-4">
            <p className="text-gray-600">
              Join An Existing Organization?{' '}
              <Button
                onClick={onSwitchToJoinOrganization}
                className="text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors"
                type="button"
                variant="link"
              >
                Sign up here
              </Button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrganizationSetup;