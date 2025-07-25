import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { ScrollArea } from '@/components/ui/scroll-area.jsx';
import { Avatar, AvatarFallback } from '@/components/ui/avatar.jsx';
import { Send, Bot, User, Trash2, Loader2, Mic, MicOff, Play, Pause, X } from 'lucide-react';
import { useChat } from '../hooks/useChat';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const ChatInterface = ({ user, onLogout }) => {
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioLevels, setAudioLevels] = useState(new Array(20).fill(0));
  const { messages, isLoading, sendMessage, sendAudioMessage, clearChat } = useChat(user.id);
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Auto-scroll para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Timer para duração da gravação
  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }

    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [isRecording]);

  // Função para analisar frequências de áudio
  const analyzeAudio = () => {
    if (!analyserRef.current || !isRecording) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Reduzir os dados para 20 barras
    const barCount = 20;
    const step = Math.floor(dataArray.length / barCount);
    const levels = [];

    for (let i = 0; i < barCount; i++) {
      const start = i * step;
      const end = start + step;
      const sum = dataArray.slice(start, end).reduce((a, b) => a + b, 0);
      const average = sum / step;
      levels.push(average);
    }

    setAudioLevels(levels);
    animationFrameRef.current = requestAnimationFrame(analyzeAudio);
  };

  // Iniciar análise de áudio
  useEffect(() => {
    if (isRecording && analyserRef.current) {
      analyzeAudio();
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setAudioLevels(new Array(20).fill(0));
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRecording]);

  // Formatar duração da gravação
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Função para iniciar gravação
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Configurar análise de áudio
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      const chunks = [];
      
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
        
        // Limpar contexto de áudio
        if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }
        analyserRef.current = null;
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      alert('Erro ao acessar microfone. Verifique as permissões.');
    }
  };

  // Função para parar gravação
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Função para cancelar gravação
  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingDuration(0);
    setAudioLevels(new Array(20).fill(0));
  };

  // Função para reproduzir áudio
  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Função para pausar áudio
  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Função para enviar áudio
  const handleSendAudio = async () => {
    if (audioBlob) {
      await sendAudioMessage(audioBlob, inputMessage);
      setAudioBlob(null);
      setAudioUrl(null);
      setInputMessage('');
      setRecordingDuration(0);
      setAudioLevels(new Array(20).fill(0));
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const messageToSend = inputMessage;
    setInputMessage('');
    await sendMessage(messageToSend);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Componente para visualização de frequências
  const AudioVisualizer = () => (
    <div className="flex items-center justify-center gap-1 h-10">
      {audioLevels.map((level, index) => (
        <div
          key={index}
          className="w-1 bg-blue-500 rounded-full transition-all duration-75 ease-out"
          style={{
            height: `${Math.max(2, (level / 255) * 40)}px`,
            opacity: level > 0 ? 0.8 : 0.3
          }}
        />
      ))}
    </div>
  );

  // Componente para renderizar mensagens com markdown
  const MessageContent = ({ content, sender, type, audioUrl }) => {
    if (type === 'audio' && audioUrl) {
      return (
        <div className="space-y-2">
          <p className="text-sm">{content}</p>
          <audio 
            src={audioUrl} 
            controls 
            className="w-full max-w-xs"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
          />
        </div>
      );
    }

    if (sender === 'user') {
      // Para mensagens do usuário, mostra texto simples
      return <p className="text-sm whitespace-pre-wrap">{content}</p>;
    }

    // Para mensagens do agente, renderiza markdown
    return (
      <div className="text-sm prose prose-sm max-w-none">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            // Estilização personalizada para elementos markdown
            h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
            h2: ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
            h3: ({ children }) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
            ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
            li: ({ children }) => <li className="text-sm">{children}</li>,
            code: ({ children, className }) => {
              const isInline = !className;
              if (isInline) {
                return <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">{children}</code>;
              }
              return (
                <pre className="bg-gray-100 p-2 rounded text-xs font-mono overflow-x-auto mb-2">
                  <code>{children}</code>
                </pre>
              );
            },
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-gray-300 pl-3 italic text-gray-600 mb-2">
                {children}
              </blockquote>
            ),
            strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
            em: ({ children }) => <em className="italic">{children}</em>,
            a: ({ children, href }) => (
              <a href={href} className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            ),
            table: ({ children }) => (
              <div className="overflow-x-auto mb-2">
                <table className="min-w-full border border-gray-300 text-xs">
                  {children}
                </table>
              </div>
            ),
            th: ({ children }) => (
              <th className="border border-gray-300 px-2 py-1 bg-gray-100 font-semibold">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="border border-gray-300 px-2 py-1">
                {children}
              </td>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Card className="rounded-none border-b">
        <CardHeader className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback className="bg-blue-500 text-white">
                  <Bot className="w-5 h-5" />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">Hipocampo</CardTitle>
                <p className="text-sm text-gray-500">Assistente IA</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearChat}
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Limpar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
              >
                Sair
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 p-4">
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <Bot className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Olá, {user.name}!
                </h3>
                <p className="text-gray-500">
                  Como posso ajudá-lo hoje? Digite sua mensagem ou grave um áudio para começar.
                </p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.sender === 'agent' && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-blue-500 text-white">
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : message.type === 'error'
                      ? 'bg-red-100 text-red-800 border border-red-200'
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  <MessageContent 
                    content={message.content} 
                    sender={message.sender} 
                    type={message.type}
                    audioUrl={message.audioUrl}
                  />
                  <p className={`text-xs mt-1 ${
                    message.sender === 'user' 
                      ? 'text-blue-100' 
                      : 'text-gray-500'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>

                {message.sender === 'user' && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-gray-500 text-white">
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-blue-500 text-white">
                    <Bot className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-white border border-gray-200 px-4 py-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-gray-500">Digitando...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <Card className="rounded-none border-t">
          <CardContent className="p-4">
            <div className="max-w-4xl mx-auto">
              {!audioBlob ? (
                // Interface normal de texto ou gravação
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  {isRecording ? (
                    // Visualização de frequências durante gravação - mesmo estilo do preview
                    <div className="flex-1 flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      {/* Ícone de áudio */}
                      <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
                        <Mic className="w-5 h-5 text-white" />
                      </div>
                      
                      {/* Controles de áudio */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-red-700 truncate">Gravando...</span>
                          <span className="text-xs text-red-600 flex-shrink-0 ml-2">{formatDuration(recordingDuration)}</span>
                        </div>
                        
                        {/* Visualização de frequências */}
                        <AudioVisualizer />
                      </div>
                      
                      {/* Botão de parar gravação - centralizado */}
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={stopRecording}
                        disabled={isLoading}
                        className="w-8 h-8 p-0 flex-shrink-0"
                      >
                        <MicOff className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    // Input de texto normal
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Digite sua mensagem..."
                      disabled={isLoading}
                      className="flex-1"
                    />
                  )}
                  
                  {!isRecording && (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={startRecording}
                        disabled={isLoading}
                        className="px-4"
                      >
                        <Mic className="w-4 h-4" />
                      </Button>
                      
                      <Button 
                        type="submit" 
                        disabled={isLoading || !inputMessage.trim()}
                        className="px-4"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </form>
              ) : (
                // Interface de preview de áudio (estilo WhatsApp) - SEMPRE consistente
                <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  {/* Ícone de áudio */}
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mic className="w-5 h-5 text-white" />
                  </div>
                  
                  {/* Controles de áudio */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900 truncate">Áudio gravado</span>
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-2">{formatDuration(recordingDuration)}</span>
                    </div>
                    
                    {/* Barra de progresso visual */}
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div 
                        className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((recordingDuration / 60) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Controles - sempre visíveis e consistentes */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={isPlaying ? pauseAudio : playAudio}
                      className="w-8 h-8 p-0"
                      disabled={isLoading}
                    >
                      {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={cancelRecording}
                      className="w-8 h-8 p-0 text-red-500 hover:text-red-700"
                      disabled={isLoading}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                    
                    <Button
                      size="sm"
                      onClick={handleSendAudio}
                      disabled={isLoading}
                      className="w-8 h-8 p-0"
                    >
                      <Send className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  {/* Áudio oculto para reprodução */}
                  <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

