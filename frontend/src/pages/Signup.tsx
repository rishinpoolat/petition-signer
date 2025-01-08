import React, { useState, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, FormikProps } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';
import { QrCodeIcon } from '@heroicons/react/24/outline';
import QRScannerModal from '../components/QRScannerModal';

interface SignupValues {
  email: string;
  fullName: string;
  dateOfBirth: string;
  password: string;
  bioId: string;
}

const signupSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  fullName: Yup.string()
    .required('Full name is required')
    .min(2, 'Name too short'),
  dateOfBirth: Yup.date()
    .required('Date of birth is required')
    .max(new Date(), 'Date of birth cannot be in the future'),
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters'),
  bioId: Yup.string()
    .required('BioID is required')
    .matches(/^[A-Z0-9]{10}$/, 'BioID must be 10 characters long and contain only uppercase letters and numbers')
});

const Signup: React.FC = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const formikRef = useRef<FormikProps<SignupValues>>(null);
  const [error, setError] = useState<string>('');
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);

  const openQRScanner = useCallback(() => setIsQRScannerOpen(true), []);
  const closeQRScanner = useCallback(() => setIsQRScannerOpen(false), []);

  const handleQRCodeScanned = useCallback((bioId: string) => {
    if (formikRef.current) {
      formikRef.current.setFieldValue('bioId', bioId);
    }
    closeQRScanner();
  }, [closeQRScanner]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              sign in to existing account
            </Link>
          </p>
        </div>

        <Formik
          innerRef={formikRef}
          initialValues={{
            email: '',
            fullName: '',
            dateOfBirth: '',
            password: '',
            bioId: ''
          }}
          validationSchema={signupSchema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              await signup(values);
              navigate('/');
            } catch (err: any) {
              console.error('Signup error:', err);
              const errorMessage = err.response?.data?.error || 'Failed to create account';
              const errorDetails = err.response?.data?.details || '';
              setError(`${errorMessage}${errorDetails ? `: ${errorDetails}` : ''}`);
              setSubmitting(false);
            }
          }}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form className="mt-8 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                  <span className="block sm:inline">{error}</span>
                </div>
              )}

              <div className="rounded-md shadow-sm space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <Field
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Email address"
                  />
                  {errors.email && touched.email && (
                    <div className="text-red-500 text-sm mt-1">{errors.email}</div>
                  )}
                </div>

                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <Field
                    id="fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Full Name"
                  />
                  {errors.fullName && touched.fullName && (
                    <div className="text-red-500 text-sm mt-1">{errors.fullName}</div>
                  )}
                </div>

                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                    Date of Birth
                  </label>
                  <Field
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  {errors.dateOfBirth && touched.dateOfBirth && (
                    <div className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</div>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <Field
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Password"
                  />
                  {errors.password && touched.password && (
                    <div className="text-red-500 text-sm mt-1">{errors.password}</div>
                  )}
                </div>

                <div>
                  <label htmlFor="bioId" className="block text-sm font-medium text-gray-700">
                    BioID
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <Field
                      id="bioId"
                      name="bioId"
                      type="text"
                      className="appearance-none rounded-l-md relative block w-full px-3 py-2 border border-r-0 border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Enter your 10-digit BioID"
                    />
                    <button
                      type="button"
                      onClick={openQRScanner}
                      className="relative -ml-px inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <QrCodeIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      <span className="ml-2">Scan</span>
                    </button>
                  </div>
                  {errors.bioId && touched.bioId && (
                    <div className="text-red-500 text-sm mt-1">{errors.bioId}</div>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    Enter your BioID manually or scan QR code
                  </p>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {isSubmitting ? 'Creating Account....' : 'Create Account'}
                </button>
              </div>
            </Form>
          )}
        </Formik>

        <QRScannerModal
          isOpen={isQRScannerOpen}
          onClose={closeQRScanner}
          onScan={handleQRCodeScanned}
        />
      </div>
    </div>
  );
};

export default Signup;