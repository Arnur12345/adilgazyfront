import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, TextField, Paper, Typography, Box } from '@mui/material';

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
      const formData = new FormData();
      formData.append('title', title);
      formData.append('pdf', file);

      const token = localStorage.getItem('token');
      
      await axios.post(
        `http://localhost:5000/course/${courseId}/pdf`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
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
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
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
          />

          <input
            accept="application/pdf"
            type="file"
            onChange={handleFileChange}
            style={{ margin: '20px 0' }}
          />

          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}

          <Button 
            variant="contained" 
            type="submit"
            sx={{ mt: 2 }}
            disabled={!title || !file}
          >
            Загрузить PDF
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default CreatePdf;
