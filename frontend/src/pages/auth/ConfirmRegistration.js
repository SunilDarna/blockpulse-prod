import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Link,
} from '@mui/material';
import { Auth } from 'aws-amplify';

const validationSchema = Yup.object({
  code: Yup.string()
    .required('Verification code is required')
    .matches(/^\d+$/, 'Code must contain only numbers')
    .length(6, 'Code must be exactly 6 digits'),
});

const ConfirmRegistration = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [confirmError, setConfirmError] = useState('');
  const [resendSuccess, setResendSuccess] = useState('');
  
  // Get username from location state or use empty string
  const username = location.state?.username || '';

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // Use Amplify Auth directly
      await Auth.confirmSignUp(username, values.code);
      navigate('/login', { state: { confirmSuccess: true } });
    } catch (error) {
      console.error('Error confirming sign up:', error);
      setConfirmError(error.message || 'Failed to confirm registration');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    try {
      // Use Amplify Auth directly
      await Auth.resendSignUp(username);
      setResendSuccess('Verification code has been resent to your email');
      setConfirmError('');
    } catch (error) {
      console.error('Error resending code:', error);
      setConfirmError(error.message || 'Failed to resend verification code');
      setResendSuccess('');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Confirm Registration
        </Typography>
        
        <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
          We've sent a verification code to your email address.
          Please enter the code below to complete your registration.
        </Typography>
        
        {confirmError && (
          <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
            {confirmError}
          </Alert>
        )}
        
        {resendSuccess && (
          <Alert severity="success" sx={{ width: '100%', mt: 2 }}>
            {resendSuccess}
          </Alert>
        )}
        
        <Formik
          initialValues={{ code: '' }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form noValidate sx={{ mt: 3, width: '100%' }}>
              <Field
                as={TextField}
                margin="normal"
                required
                fullWidth
                id="code"
                label="Verification Code"
                name="code"
                autoComplete="one-time-code"
                autoFocus
                error={touched.code && Boolean(errors.code)}
                helperText={touched.code && errors.code}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Confirming...' : 'Confirm Registration'}
              </Button>
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2">
                  Didn't receive a code?{' '}
                  <Link
                    component="button"
                    variant="body2"
                    onClick={handleResendCode}
                  >
                    Resend Code
                  </Link>
                </Typography>
              </Box>
            </Form>
          )}
        </Formik>
      </Box>
    </Container>
  );
};

export default ConfirmRegistration;
