import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  FormLabel,
  FormControlLabel,
  RadioGroup,
  Radio,
  Paper,
  Divider,
  Alert,
  CircularProgress,
  InputAdornment,
  Tooltip,
  IconButton
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { createCommunity } from '../features/community/communitySlice';

const validationSchema = Yup.object({
  name: Yup.string()
    .required('Community name is required')
    .min(3, 'Name must be at least 3 characters')
    .max(50, 'Name must be less than 50 characters'),
  description: Yup.string()
    .required('Description is required')
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be less than 500 characters'),
  joinType: Yup.string()
    .required('Join type is required')
    .oneOf(['open', 'invite'], 'Invalid join type'),
  tags: Yup.string()
    .matches(/^[a-zA-Z0-9]+(,[a-zA-Z0-9]+)*$/, 'Tags must be comma-separated without spaces')
    .max(100, 'Tags must be less than 100 characters')
});

const CreateCommunity = () => {
  const { user } = useSelector((state) => state.auth);
  const { loading, error: reduxError, success } = useSelector((state) => state.community);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError('');
      
      // Convert tags string to array
      const tagsArray = values.tags ? values.tags.split(',') : [];
      
      // Prepare the request payload
      const payload = {
        name: values.name,
        description: values.description,
        joinType: values.joinType,
        tags: tagsArray
      };
      
      console.log('Submitting community creation with payload:', payload);
      
      // Dispatch the createCommunity action
      const resultAction = await dispatch(createCommunity(payload));
      console.log('Result action:', resultAction);
      
      if (createCommunity.fulfilled.match(resultAction)) {
        console.log('Community created successfully:', resultAction.payload);
        // Navigate to the communities list page after a short delay
        setTimeout(() => {
          navigate('/communities');
        }, 2000);
      } else {
        console.error('Failed to create community:', resultAction);
        setError(resultAction.payload || 'Failed to create community. Please try again.');
      }
      
    } catch (err) {
      console.error('Error creating community:', err);
      setError(err.message || 'Failed to create community. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Community
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {reduxError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {reduxError}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Community created successfully! Redirecting...
          </Alert>
        )}
        
        <Formik
          initialValues={{
            name: '',
            description: '',
            joinType: 'open',
            tags: ''
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form>
              <Box sx={{ mb: 3 }}>
                <Field
                  as={TextField}
                  fullWidth
                  id="name"
                  name="name"
                  label="Community Name"
                  variant="outlined"
                  error={touched.name && Boolean(errors.name)}
                  helperText={touched.name && errors.name}
                />
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Field
                  as={TextField}
                  fullWidth
                  id="description"
                  name="description"
                  label="Description"
                  variant="outlined"
                  multiline
                  rows={4}
                  error={touched.description && Boolean(errors.description)}
                  helperText={touched.description && errors.description}
                />
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Join Type</FormLabel>
                  <RadioGroup row name="joinType">
                    <FormControlLabel 
                      value="open" 
                      control={<Field as={Radio} name="joinType" />} 
                      label="Open (Anyone can join)" 
                    />
                    <FormControlLabel 
                      value="invite" 
                      control={<Field as={Radio} name="joinType" />} 
                      label="Invite Only (Members need approval)" 
                    />
                  </RadioGroup>
                </FormControl>
              </Box>
              
              <Box sx={{ mb: 4 }}>
                <Field
                  as={TextField}
                  fullWidth
                  id="tags"
                  name="tags"
                  label="Tags (comma-separated)"
                  variant="outlined"
                  placeholder="technology,books,fitness"
                  error={touched.tags && Boolean(errors.tags)}
                  helperText={touched.tags && errors.tags}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title="Add tags to help others find your community. Separate tags with commas, no spaces.">
                          <IconButton edge="end">
                            <HelpOutlineIcon />
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/dashboard')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting || loading || success}
                  startIcon={(isSubmitting || loading) && <CircularProgress size={20} />}
                >
                  {(isSubmitting || loading) ? 'Creating...' : 'Create Community'}
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      </Paper>
    </Container>
  );
};

export default CreateCommunity;
