import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Database, 
  ChevronDown, 
  ChevronUp, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  RotateCcw,
  Bot,
  User,
  Info,
  ArrowRight
} from 'lucide-react';
import { FarmProfile, EnvironmentalSnapshot, RotationPlan, ChatMessage } from '@/src/types';
import { apiClient } from '@/src/lib/apiClient';
import { useI18n } from '@/src/lib/i18n/context';

interface AskTerraViewProps {
  farm: FarmProfile;
  environment: EnvironmentalSnapshot;
  plan?: RotationPlan;
  messages: ChatMessage[];
  onSendMessage: (msg: ChatMessage) => void;
  onClearChat: () => void;
}

export const AskTerraView: React.FC<AskTerraViewProps> = ({
  farm,
  environment,
  plan,
  messages,
  onSendMessage,
  onClearChat
}) => {
  const { t, language, speak, stopSpeaking, isSpeaking } = useI18n();

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isDataUsedExpanded, setIsDataUsedExpanded] = useState(false);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Setup Web Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = language === 'bn' ? 'bn-BD' : 'en-US';

        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((res: any) => res[0].transcript)
            .join('');
          setInputText(transcript);
        };

        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);

        recognitionRef.current = recognition;
      }
    }
  }, [language]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert(language === 'bn' ? 'আপনার ব্রাউজারে ভয়েস ইনপুট সমর্থিত নয়।' : 'Voice input is not supported in this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.lang = language === 'bn' ? 'bn-BD' : 'en-US';
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isTyping) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const userMessage: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toISOString()
    };

    onSendMessage(userMessage);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    try {
      const response = await apiClient.sendChatMessage(
        query,
        [...messages, userMessage],
        farm,
        environment,
        plan
      );

      const assistantMessage: ChatMessage = {
        id: `msg-assistant-${Date.now()}`,
        role: 'assistant',
        content: response.message,
        timestamp: new Date().toISOString(),
        dataUsed: response.dataUsed
      };

      onSendMessage(assistantMessage);
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsTyping(false);
    }
  };

  const presetQuestions = language === 'bn' ? [
    'কেন আপনি এই ফসলটি প্রস্তাব করেছেন?',
    'মাটিতে কম জলের অর্থ কী এবং কী করণীয়?',
    'আমি কীভাবে কম জলে ভালো চাষ করতে পারি?',
    'বৃষ্টি স্বাভাবিকের চেয়ে কম হলে কী হবে?'
  ] : [
    'Why did you suggest this crop?',
    'What does low soil moisture mean?',
    'How can I save water?',
    'What if it rains less than usual?'
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-6 bg-[#F1F4EF] min-h-full">
      {/* Centered Conversation Header */}
      <div className="text-center max-w-xl mx-auto space-y-2 pt-2">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#193D25]">
          {language === 'bn' ? 'টেরা সহকারী' : 'Ask Terra'}
        </h2>
        <p className="text-xs sm:text-sm text-[#697568]">
          {language === 'bn' 
            ? 'আপনার খামার ও ফসল নিয়ে যেকোনো প্রশ্ন জিজ্ঞাসা করুন।' 
            : 'Ask a question about your farm grounded in real NASA telemetry.'}
        </p>
      </div>

      {/* Suggested Questions Chips */}
      <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
        {presetQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="px-4 py-2 rounded-full bg-white border border-[#DCE2D8] hover:border-[#71966B] text-xs font-medium text-[#243428] shadow-2xs hover:bg-[#F8F7F0] transition-all cursor-pointer"
          >
            <span>{q}</span>
          </button>
        ))}
      </div>

      {/* Main Conversation Canvas */}
      <div className="bg-white rounded-3xl border border-[#DCE2D8] shadow-2xs flex flex-col h-[520px] overflow-hidden">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-5">
          {messages.length === 0 && (
            <div className="text-center py-16 text-[#8A9286] space-y-2">
              <Bot className="w-9 h-9 mx-auto text-[#71966B]/60" />
              <p className="text-xs sm:text-sm font-medium">
                {language === 'bn' 
                  ? 'উপরে যেকোনো প্রশ্নে ট্যাপ করুন অথবা মুখে বলুন।' 
                  : 'Select a question above or type your inquiry below.'}
              </p>
            </div>
          )}

          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-2xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  isUser ? 'bg-[#193D25] text-white' : 'bg-[#DDE8D8] text-[#193D25]'
                }`}>
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className="space-y-1.5 max-w-lg">
                  <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-[#193D25] text-white rounded-tr-xs'
                      : 'bg-[#F8F7F0] text-[#243428] border border-[#DCE2D8] rounded-tl-xs whitespace-pre-line'
                  }`}>
                    {msg.content}
                  </div>

                  {/* Read Aloud button for assistant answers */}
                  {!isUser && (
                    <div className="flex items-center gap-3 px-1 text-[11px] text-[#8A9286]">
                      <button
                        onClick={() => speak(msg.content)}
                        className="flex items-center gap-1 text-[#285C35] hover:text-[#193D25] font-medium transition-colors cursor-pointer"
                        title="Listen to this explanation"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{language === 'bn' ? 'শুনুন' : 'Listen'}</span>
                      </button>
                      {msg.dataUsed && (
                        <span>✓ Grounded in {farm.name} observations</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex gap-3 max-w-2xl">
              <div className="w-8 h-8 rounded-full bg-[#DDE8D8] text-[#193D25] flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl bg-[#F8F7F0] border border-[#DCE2D8] text-xs text-[#697568] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#285C35] animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#285C35] animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#285C35] animate-bounce [animation-delay:0.4s]" />
                <span className="ml-1 font-medium">{language === 'bn' ? 'টেরা তথ্য বিশ্লেষণ করছে...' : 'Consulting agronomic matrices...'}</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Input Area with Microphone and Clear button */}
        <div className="p-4 bg-[#F8F7F0] border-t border-[#DCE2D8] flex items-center gap-2">
          <button
            onClick={onClearChat}
            className="p-2.5 rounded-full text-[#8A9286] hover:text-[#243428] hover:bg-white transition-colors cursor-pointer"
            title="Start Fresh"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Voice Input Button */}
          <button
            onClick={toggleListening}
            className={`p-2.5 rounded-full border transition-all cursor-pointer ${
              isListening
                ? 'bg-[#B94B43] text-white border-[#B94B43] animate-pulse'
                : 'bg-white text-[#697568] border-[#DCE2D8] hover:text-[#193D25]'
            }`}
            title={isListening ? 'Stop listening' : 'Voice input'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-[#71966B]" />}
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            placeholder={isListening ? 'Listening...' : (language === 'bn' ? 'আপনার খামার সংক্রান্ত প্রশ্ন লিখুন...' : 'Ask a question about your farm...')}
            className="flex-1 min-h-[44px] px-4 rounded-full border border-[#DCE2D8] bg-white text-xs sm:text-sm text-[#243428] focus:outline-none focus:border-[#71966B]"
          />

          <button
            onClick={() => handleSend()}
            disabled={!inputText.trim() || isTyping}
            className="min-h-[44px] px-5 rounded-full bg-[#193D25] hover:bg-[#285C35] text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{language === 'bn' ? 'পাঠান' : 'Send'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
