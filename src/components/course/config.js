const config = {
  development: {
    apiUrl: 'http://127.0.0.1:5000',
    cloudinaryUrl: 'https://api.cloudinary.com/v1_1/dq2pbzrtu/image/upload',
    cloudinaryPreset: 'adilgazy'
  },
  production: {
    apiUrl: 'https://adilgazyback.onrender.com', 
    cloudinaryUrl: 'https://api.cloudinary.com/v1_1/dq2pbzrtu/image/upload',
    cloudinaryPreset: 'adilgazy',
    cloudinaryCloudName: 'dq2pbzrtu'
  }
};

const environment = process.env.NODE_ENV || 'development';
const currentConfig = config[environment];

export default currentConfig;
