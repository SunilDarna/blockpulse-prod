import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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
  username: Yup.string().required('Username or email is required'),
});

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [forgotError, setForgotError] = useState('');

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await Auth.forgotPassword(values.username);
      navigate('/reset-password', { state: { username: values.username } });
    } catch (error) {
      console.error('Error requesting password reset:', error);
      setForgotError(error.message || 'Failed to request password reset');
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
          Forgot Password
        </Typography>
        
        <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
          Enter your username or email address and we'll send you a code to reset your password.
        </Typography>
        
        {forgotError && (
          <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
            {forgotError}
          </Alert>
        )}
        
        <Formik
          initialValues={{ username: '' }}
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
                id="username"
                label="Username or Email"
                name="username"
                autoComplete="username"
                autoFocus
                error={touched.username && Boolean(errors.username)}
                helperText={touched.username && errors.username}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send Reset Code'}
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

export default ForgotPassword;
