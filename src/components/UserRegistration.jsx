import { useState } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Alert, AlertDescription } from '@/components/ui/alert.jsx';
import { Loader2, User, Phone } from 'lucide-react';
import { createUser } from '../lib/api';

export const UserRegistration = ({ onUserRegistered }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone_number: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.phone_number.trim()) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const userData = {
        phone_number: formData.phone_number,
        user_data: {
          name: formData.name
        }
      };

      const response = await createUser(userData);
      
      // Salva dados do usuário no localStorage
      localStorage.setItem('hipocampo_user', JSON.stringify({
        id: response.id,
        name: formData.name,
        phone_number: formData.phone_number
      }));

      onUserRegistered({
        id: response.id,
        name: formData.name,
        phone_number: formData.phone_number
      });

    } catch (err) {
      console.error('Erro ao registrar usuário:', err);
      setError('Erro ao criar conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Bem-vindo ao Hipocampo
          </CardTitle>
          <CardDescription>
            Crie sua conta para começar a conversar com nossa IA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Nome
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Digite seu nome"
                value={formData.name}
                onChange={handleInputChange}
                disabled={isLoading}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_number" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Telefone
              </Label>
              <Input
                id="phone_number"
                name="phone_number"
                type="tel"
                placeholder="(11) 99999-9999"
                value={formData.phone_number}
                onChange={handleInputChange}
                disabled={isLoading}
                className="w-full"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando conta...
                </>
              ) : (
                'Criar conta e começar'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

