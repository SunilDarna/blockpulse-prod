import React, { useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { Auth } from 'aws-amplify';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Link,
  Alert,
} from '@mui/material';

const validationSchema = Yup.object({
  code: Yup.string()
    .required('Verification code is required')
    .matches(/^\d+$/, 'Code must contain only numbers'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[^a-zA-Z0-9]/, 'Password must contain at least one special character')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [resetError, setResetError] = useState('');
  
  // Get username from location state or use empty string
  const username = location.state?.username || '';

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await Auth.forgotPasswordSubmit(username, values.code, values.password);
      navigate('/login', { state: { resetSuccess: true } });
    } catch (error) {
      console.error('Error resetting password:', error);
      setResetError(error.message || 'Failed to reset password');
    } finally {
      setSubmitting(false);
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
          Reset Password
        </Typography>
        
        <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
          Enter the verification code sent to your email and your new password.
        </Typography>
        
        {resetError && (
          <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
            {resetError}
          </Alert>
        )}
        
        <Formik
          initialValues={{ code: '', password: '', confirmPassword: '' }}
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
              <Field
                as={TextField}
                margin="normal"
                required
                fullWidth
                name="password"
                label="New Password"
                type="password"
                id="password"
                autoComplete="new-password"
                error={touched.password && Boolean(errors.password)}
                helperText={touched.password && errors.password}
              />
              <Field
                as={TextField}
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm New Password"
                type="password"
                id="confirmPassword"
                error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                helperText={touched.confirmPassword && errors.confirmPassword}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Resetting...' : 'Reset Password'}
              </Button>
              <Grid container justifyContent="center">
                <Grid item>
                  <Link component={RouterLink} to="/login" variant="body2">
                    Back to Sign In
                  </Link>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </Box>
    </Container>
  );
};

export default ResetPassword;
