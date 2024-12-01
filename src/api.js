import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3001',
});

export const executeCode = async (sourceCode) => {
  const response = await API.post('/compile', {
    code: sourceCode,
  });
  return response.data;
};

export const executeVM = async (objCode) => {
  const response = await API.post('/execute', {
    objCode: objCode,
  });
  return response.data;
};