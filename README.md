# Hipocampo - Chat Inteligente

Uma aplicação de chat conversacional moderna construída com React que integra com as APIs da Automagik para proporcionar interações inteligentes com o agente Hipocampus.

## 🚀 Características

- **Interface Moderna**: Design limpo e responsivo construído com React e Tailwind CSS
- **Integração com IA**: Conecta diretamente com o agente Hipocampus da Automagik
- **Experiência Fluida**: Chat em tempo real com gerenciamento de sessões
- **Responsivo**: Funciona perfeitamente em desktop e dispositivos móveis
- **Persistência Local**: Dados do usuário e sessões mantidos localmente
- **Acessibilidade**: Interface acessível seguindo padrões WCAG

## 🛠️ Tecnologias Utilizadas

- **React 19.1.0** - Biblioteca principal para interface de usuário
- **Vite** - Bundler e servidor de desenvolvimento
- **Tailwind CSS 4.1.7** - Framework CSS utilitário
- **shadcn/ui** - Componentes de interface pré-construídos
- **Lucide React** - Ícones modernos
- **pnpm** - Gerenciador de pacotes

## 📋 Pré-requisitos

- Node.js 18+ 
- pnpm (recomendado) ou npm
- Chave de API da Automagik

## 🔧 Instalação

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd hipocampo
```

2. **Instale as dependências**
```bash
pnpm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```

Edite o arquivo `.env` e adicione sua chave de API:
```env
REACT_APP_AUTOMAGIK_API_KEY=sua_chave_api_aqui
REACT_APP_API_BASE_URL=https://api-flashed.namastex.ai/api/v1
```

4. **Inicie o servidor de desenvolvimento**
```bash
pnpm run dev --host
```

A aplicação estará disponível em `http://localhost:5173`

## 🏗️ Estrutura do Projeto

```
src/
├── components/          # Componentes React reutilizáveis
│   ├── ui/             # Componentes shadcn/ui
│   ├── ChatInterface.jsx
│   ├── UserRegistration.jsx
│   └── LoginForm.jsx
├── hooks/              # Hooks customizados
│   ├── useChat.js
│   └── useLocalStorage.js
├── lib/                # Utilitários e configurações
│   └── api.js
├── assets/             # Recursos estáticos
├── App.jsx             # Componente raiz
├── App.css             # Estilos globais
└── main.jsx            # Ponto de entrada
```

## 🎯 Como Usar

### Primeiro Acesso

1. **Acesse a aplicação** no navegador
2. **Clique em "Criar nova conta"** na tela inicial
3. **Preencha seu nome e telefone** no formulário
4. **Clique em "Criar conta e começar"**
5. **Comece a conversar** com o Hipocampus!

### Acesso Posterior

1. **Digite seu número de telefone** na tela de login
2. **Clique em "Entrar"**
3. **Continue sua conversa** de onde parou

### Funcionalidades do Chat

- **Envio de Mensagens**: Digite sua mensagem e pressione Enter ou clique no botão enviar
- **Histórico**: Todas as mensagens são mantidas durante a sessão
- **Continuidade**: Conversas são mantidas através de session_id
- **Limpeza**: Use o botão "Limpar" para iniciar uma nova conversa
- **Logout**: Use o botão "Sair" para fazer logout e limpar dados

## 🔌 Integração com API

O projeto integra com dois endpoints principais da Automagik:

### Criação de Usuário
```
POST /api/v1/users
```

### Execução do Agente Hipocampus
```
POST /api/v1/agent/hippocampus/run
```

A integração é gerenciada através do arquivo `src/lib/api.js` que centraliza todas as chamadas de API.

## 🎨 Customização

### Temas e Cores

O projeto utiliza Tailwind CSS com suporte a modo escuro. As cores podem ser customizadas no arquivo `src/App.css`:

```css
:root {
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  /* ... outras variáveis */
}
```

### Componentes

Novos componentes devem seguir a estrutura padrão:

```javascript
import { useState } from 'react';
import { Button } from '@/components/ui/button.jsx';

export const NovoComponente = ({ prop1, prop2 }) => {
  const [estado, setEstado] = useState(null);
  
  return (
    <div className="container">
      {/* conteúdo */}
    </div>
  );
};
```

## 🧪 Testes

Para executar os testes (quando implementados):

```bash
pnpm run test
```

Para verificar a qualidade do código:

```bash
pnpm run lint
```

## 📦 Build e Deploy

### Build de Produção

```bash
pnpm run build
```

### Preview do Build

```bash
pnpm run preview
```

### Deploy

O projeto pode ser deployado em qualquer serviço de hosting estático:

- **Vercel**: `vercel --prod`
- **Netlify**: Conecte o repositório Git
- **GitHub Pages**: Configure GitHub Actions
- **AWS S3**: Upload da pasta `dist/`

## 🔒 Segurança

- **Chaves de API**: Nunca exponha chaves de API no código frontend
- **Validação**: Sempre valide dados de entrada do usuário
- **HTTPS**: Use HTTPS em produção
- **Sanitização**: Dados são sanitizados antes do processamento

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Padrões de Código

- Siga as regras definidas em `.cursorrules`
- Use commits semânticos: `feat:`, `fix:`, `docs:`, etc.
- Mantenha o código formatado com Prettier
- Siga as convenções de nomenclatura do projeto

## 📚 Documentação

- **[Melhores Práticas](docs/MELHORES_PRATICAS.md)** - Guia completo de desenvolvimento
- **[Diretrizes do Cursor](docs/CURSOR_GUIDELINES.md)** - Regras para uso do editor Cursor
- **[Relatório de Testes](docs/TESTE_VALIDACAO.md)** - Resultados dos testes realizados

## 🐛 Problemas Conhecidos

- Integração com API requer chave válida para funcionamento completo
- Validação de telefone poderia ser mais robusta
- Testes end-to-end ainda não implementados

## 🗺️ Roadmap

### Versão 1.1
- [ ] Testes automatizados completos
- [ ] Validação aprimorada de formulários
- [ ] Suporte a upload de arquivos
- [ ] Mensagens de voz

### Versão 1.2
- [ ] Modo offline
- [ ] Múltiplos temas
- [ ] Internacionalização (i18n)
- [ ] PWA (Progressive Web App)

### Versão 2.0
- [ ] Múltiplos agentes
- [ ] Salas de chat
- [ ] Integração com outros serviços
- [ ] Dashboard administrativo

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Equipe

- **Desenvolvedor Principal**: Manus AI
- **Arquitetura**: Baseada em melhores práticas React
- **Design**: Interface moderna e acessível

## 📞 Suporte

Para suporte e dúvidas:

1. Verifique a [documentação](docs/)
2. Consulte os [problemas conhecidos](#-problemas-conhecidos)
3. Abra uma issue no repositório
4. Entre em contato com a equipe de desenvolvimento

## 🙏 Agradecimentos

- **Automagik** pela API de IA
- **Vercel** pelo Vite e ferramentas de desenvolvimento
- **Tailwind Labs** pelo Tailwind CSS
- **shadcn** pelos componentes de UI
- **Comunidade React** pelas melhores práticas

---

**Hipocampo** - Conversas inteligentes, experiência excepcional. 🧠💬

