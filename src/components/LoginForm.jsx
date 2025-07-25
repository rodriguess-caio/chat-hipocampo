import { useState } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Alert, AlertDescription } from '@/components/ui/alert.jsx';
import { Phone, LogIn, Loader2 } from 'lucide-react';
import { getUserByPhone } from '@/lib/api.js';
import { formatPhoneNumber, cleanPhoneNumber } from '@/lib/utils.js';
import logo from '@/assets/logo.png';

export const LoginForm = ({ onLogin, onSwitchToRegister }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    const formatted = formatPhoneNumber(value);
    setPhoneNumber(formatted);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!phoneNumber.trim()) {
      setError('Por favor, digite seu número de telefone.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Remove caracteres não numéricos do telefone
      const cleanPhone = cleanPhoneNumber(phoneNumber);
      
      // Busca o usuário na API
      const userData = await getUserByPhone(cleanPhone);
      
      if (userData && userData.id) {
        // Salva os dados do usuário no localStorage
        const userInfo = {
          id: userData.id,
          phone_number: cleanPhone,
          name: userData.name || '',
          created_at: userData.created_at || new Date().toISOString(),
        };
        
        localStorage.setItem('hipocampo_user', JSON.stringify(userInfo));
        
        // Chama a função de login com os dados do usuário
        onLogin(userInfo);
      } else {
        setError('Usuário não encontrado. Verifique o número ou crie uma nova conta.');
      }
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      if (error.message.includes('404')) {
        setError('Usuário não encontrado. Verifique o número ou crie uma nova conta.');
      } else {
        setError('Erro ao conectar com o servidor. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src={logo} alt="Hipocampo Logo" className="h-16 w-auto" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Entrar no Hipocampo
          </CardTitle>
          <CardDescription>
            Digite seu número de telefone para acessar o chat
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Telefone
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(11) 99999-9999"
                value={phoneNumber}
                onChange={handlePhoneChange}
                className="w-full"
                disabled={isLoading}
                maxLength={15}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Entrar
                </>
              )}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={onSwitchToRegister}
                className="text-sm"
                disabled={isLoading}
              >
                Não tem conta? Criar nova conta
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

