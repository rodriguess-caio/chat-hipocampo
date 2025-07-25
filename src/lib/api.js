// Configuração da API Automagik
const API_BASE_URL = import.meta.env.REACT_APP_API_BASE_URL || 'https://api-flashed.namastex.ai/api/v1';

// Função para fazer requisições à API
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': import.meta.env.VITE_AUTOMAGIK_API_KEY || 'namastex888',
    },
  };

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    console.log('API request:', url, config);
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Função para buscar usuário pelo número de telefone
export const getUserByPhone = async (phoneNumber) => {
  return apiRequest(`/users/${phoneNumber}`, {
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'x-api-key': 'namastex888',
    },
  });
};

// Função para criar usuário
export const createUser = async (userData) => {
  return apiRequest('/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

// Função para executar o agent Hipocampus
export const runHipocampusAgent = async (messageData, userId) => {
  return apiRequest('/agent/hippocampus/run', {
    method: 'POST',
    body: JSON.stringify({
      ...messageData,
      user_id: userId,
    }),
  });
};

// Função para continuar conversa com session_id
export const continueConversation = async (sessionId, messageContent, userId, mediaContents = null) => {
  const payload = {
    message_content: messageContent,
    session_name: sessionId,
    message_type: 'text',
    user_id: userId,
  };

  // Adiciona media_contents se fornecido
  if (mediaContents && mediaContents.length > 0) {
    payload.media_contents = mediaContents;
  }

  return apiRequest('/agent/hippocampus/run', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

// Função para enviar mensagem com áudio
export const sendMessageWithAudio = async (sessionId, messageContent, audioBlob, userId) => {
  // Converte o blob de áudio para base64
  const arrayBuffer = await audioBlob.arrayBuffer();
  const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
  
  const mediaContents = [{
    mime_type: audioBlob.type,
    data: `data:${audioBlob.type};base64,${base64Audio}`
  }];

  return continueConversation(sessionId, messageContent, userId, mediaContents);
};

