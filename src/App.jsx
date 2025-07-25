import { useState, useEffect } from 'react';
import { UserRegistration } from './components/UserRegistration';
import { LoginForm } from './components/LoginForm';
import { ChatInterface } from './components/ChatInterface';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(true);

  // Verifica se há usuário salvo no localStorage ao carregar
  useEffect(() => {
    const savedUser = localStorage.getItem('hipocampo_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        localStorage.removeItem('hipocampo_user');
      }
    }
  }, []);

  const handleUserRegistered = (userData) => {
    setUser(userData);
  };

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('hipocampo_user');
    localStorage.removeItem('hipocampo_session_id');
    setShowLogin(true);
  };

  const switchToRegister = () => {
    setShowLogin(false);
  };

  const switchToLogin = () => {
    setShowLogin(true);
  };

  // Se o usuário está logado, mostra a interface de chat
  if (user) {
    return <ChatInterface user={user} onLogout={handleLogout} />;
  }

  // Se não está logado, mostra login ou registro
  if (showLogin) {
    return (
      <LoginForm 
        onLogin={handleLogin} 
        onSwitchToRegister={switchToRegister}
      />
    );
  }

  return (
    <UserRegistration 
      onUserRegistered={handleUserRegistered}
    />
  );
}

export default App;
