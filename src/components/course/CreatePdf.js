import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, TextField, Paper, Typography, Box, Container } from '@mui/material';
import Navbar from '../layout/Navbar';

const CreatePdf = () => {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const { courseId } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title || !file) {
      setError('Пожалуйста, заполните все поля');
      return;
    }

    try {
      // Upload to Cloudinary first
      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append('file', file);
      cloudinaryFormData.append('upload_preset', 'adilgazy');
      cloudinaryFormData.append('cloud_name', 'dq2pbzrtu');

      const cloudinaryResponse = await fetch(
        'https://api.cloudinary.com/v1_1/dq2pbzrtu/raw/upload',
        {
          method: 'POST',
          body: cloudinaryFormData
        }
      );

      const cloudinaryData = await cloudinaryResponse.json();

      // Then send PDF URL to backend
      const token = localStorage.getItem('token');
      
      const formData = new FormData();
      formData.append('title', title);
      formData.append('pdf', file);

      await axios.post(
        `https://adilgazyback.onrender.com/api/course/${courseId}/pdf`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      navigate(`/course/${courseId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Произошла ошибка при загрузке PDF');
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Пожалуйста, выберите PDF файл');
      setFile(null);
    }
  };

  return (
    <>
      <Navbar />
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4,
            borderRadius: 2,
            backgroundColor: '#ffffff',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
        >
          <Typography 
            variant="h4" 
            gutterBottom 
            sx={{
              fontWeight: 600,
              color: '#1a237e',
              textAlign: 'center',
              mb: 4
            }}
          >
            Добавить PDF документ
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Название документа"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              margin="normal"
              required
              variant="outlined"
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#1a237e',
                  },
                },
              }}
            />

            <Box
              sx={{
                border: '2px dashed #1a237e',
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
                mb: 3,
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'rgba(26, 35, 126, 0.04)'
                }
              }}
            >
              <input
                accept="application/pdf"
                type="file"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                id="pdf-upload"
              />
              <label htmlFor="pdf-upload">
                <div style={{ fontSize: '48px', color: '#1a237e', marginBottom: '8px' }}>
                  📄
                </div>
                <Typography variant="body1" sx={{ color: '#1a237e' }}>
                  {file ? file.name : 'Нажмите для загрузки PDF файла'}
                </Typography>
              </label>
            </Box>

            {error && (
              <Typography 
                color="error" 
                sx={{ 
                  mt: 2, 
                  mb: 2,
                  textAlign: 'center',
                  backgroundColor: '#ffebee',
                  p: 2,
                  borderRadius: 1
                }}
              >
                {error}
              </Typography>
            )}

            <Button 
              variant="contained" 
              type="submit"
              fullWidth
              disabled={!title || !file}
              sx={{
                mt: 2,
                py: 1.5,
                backgroundColor: '#1a237e',
                '&:hover': {
                  backgroundColor: '#000051'
                },
                '&:disabled': {
                  backgroundColor: '#9fa8da'
                }
              }}
            >
              Загрузить PDF
            </Button>
          </form>
        </Paper>
      </Container>
    </>
  );
};

export default CreatePdf;
