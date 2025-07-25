import { useState, useCallback } from 'react';
import { runHipocampusAgent, continueConversation } from '../lib/api';
import { useLocalStorage } from './useLocalStorage';

export const useChat = (userId) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useLocalStorage('hipocampo_session_id', null);
  const [error, setError] = useState(null);

  // Função para adicionar mensagem à lista
  const addMessage = useCallback((message) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      timestamp: new Date(),
      ...message
    }]);
  }, []);

  // Função para enviar mensagem
  const sendMessage = useCallback(async (content) => {
    if (!content.trim() || !userId) return;

    // Adiciona mensagem do usuário
    addMessage({
      content,
      sender: 'user',
      type: 'text'
    });

    setIsLoading(true);
    setError(null);

    try {
      let response;
      
      if (sessionId) {
        // Continua conversa existente
        response = await continueConversation(sessionId, content, userId);
      } else {
        // Inicia nova conversa
        response = await runHipocampusAgent({
          message_content: content,
          message_type: 'text',
          session_origin: 'web'
        }, userId);
        
        // Salva session_id para futuras mensagens
        if (response.session_id) {
          setSessionId(response.session_id);
        }
      }

      // Adiciona resposta do agente
      if (response.message) {
        addMessage({
          content: response.message,
          sender: 'agent',
          type: 'text',
          messageId: response.message_id
        });
      }

    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
      setError('Erro ao enviar mensagem. Tente novamente.');
      
      // Adiciona mensagem de erro
      addMessage({
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
        sender: 'agent',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, setSessionId, addMessage, userId]);

  // Função para limpar chat
  const clearChat = useCallback(() => {
    setMessages([]);
    setSessionId(null);
    setError(null);
  }, [setSessionId]);

  // Função para verificar se há sessão ativa
  const hasActiveSession = Boolean(sessionId);

  return {
    messages,
    isLoading,
    error,
    sessionId,
    hasActiveSession,
    sendMessage,
    clearChat,
    addMessage
  };
};

