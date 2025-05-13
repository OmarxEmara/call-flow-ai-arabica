
import React, { useState, useEffect } from 'react';
import { Customer } from '@/types/customer';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mic, Volume2, Send } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { toast } from '@/components/ui/sonner';
import { 
  startListening, 
  stopListening, 
  speakText, 
  getFeedback as submitFeedback,
  continueCall,
  handleQuestion
} from '@/services/audioService';

interface CallInterfaceProps {
  customer: Customer;
  onEndCall: (feedback?: number) => void;
  onBack: () => void;
}

type Message = {
  id: number;
  text: string;
  sender: 'ai' | 'customer';
  timestamp: Date;
};

type CallState = 'ready' | 'calling' | 'connected' | 'listening' | 'speaking' | 'ended';

const CallInterface: React.FC<CallInterfaceProps> = ({ customer, onEndCall, onBack }) => {
  const [callState, setCallState] = useState<CallState>('ready');
  const [messages, setMessages] = useState<Message[]>([]);
  const [feedback, setFeedback] = useState<number | null>(null);
  const [inputText, setInputText] = useState('');
  const [conversationStep, setConversationStep] = useState<'initial' | 'questions' | 'feedback'>('initial');
  
  // The initial message to the customer
  const initialMessage = `اهلا وسهلا, صباح الخير ${customer.user}، بكلم حضرتك بخصوص مشكلة رقم ${customer.ticket_id} و اللي كانت بخصوص ${customer.issue}. هسأل حضرتك شوية أسْئِلَة للمتابعة, و لو سمحت الاجابة تكون ب آه او لا علا الأسْئِلَة. لو الوقت مناسب مع حضرتك دلوقتي ممكن نكمل, و لو لا, ممكن اتصل نتكلم في وقت تاني. تمام نكمل ولا لا؟`;

  const addMessage = (text: string, sender: 'ai' | 'customer') => {
    const newMessage = {
      id: Date.now(),
      text,
      sender,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newMessage]);
  };

  const handleStartCall = async () => {
    setCallState('calling');
    toast("جاري الاتصال بالعميل...");
    
    // Simulate connection delay
    setTimeout(async () => {
      setCallState('connected');
      toast.success("تم الاتصال بنجاح");
      
      // Add first message after connection
      addMessage(initialMessage, 'ai');
      setCallState('speaking');
      
      // Use the TTS service to speak the message
      try {
        await speakText(initialMessage);
        setCallState('listening');
      } catch (error) {
        console.error("Error speaking text:", error);
        toast.error("حدث خطأ في تحويل النص إلى كلام");
        setCallState('listening');
      }
    }, 2000);
  };

  const handleVoiceInput = async () => {
    toast("جاري الاستماع...");
    setCallState('listening');
    
    try {
      // Start listening
      await startListening();
      
      // After a moment, stop listening and get the transcribed text
      const result = await stopListening();
      addMessage(result.text, 'customer');
      
      // Process the response based on where we are in the conversation
      await processCustomerResponse(result.text);
    } catch (error) {
      console.error("Error handling voice input:", error);
      toast.error("حدث خطأ أثناء الاستماع");
      setCallState('connected');
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    
    // Add customer message
    addMessage(inputText, 'customer');
    const messageToProcess = inputText;
    setInputText('');
    
    await processCustomerResponse(messageToProcess);
  };

  const processCustomerResponse = async (response: string) => {
    setCallState('speaking');
    
    try {
      if (conversationStep === 'initial') {
        // Handle the initial question about continuing the call
        const shouldContinue = await continueCall(response);
        if (shouldContinue) {
          const nextMessage = "اول سؤال , هل المشكلة اتحلت يا فندم؟";
          addMessage(nextMessage, 'ai');
          await speakText(nextMessage);
          setConversationStep('questions');
        } else {
          const endMessage = "تمام يا فندم مفيش مشكلة, هكلم حضرتك في وقت تاني, اسف علي الازعاج.";
          addMessage(endMessage, 'ai');
          await speakText(endMessage);
          setTimeout(() => {
            setCallState('ended');
          }, 3000);
        }
      } else if (conversationStep === 'questions') {
        // Handle the follow-up questions
        const result = await handleQuestion(response);
        addMessage(result.message, 'ai');
        await speakText(result.message);
        
        if (result.nextStep === 'feedback') {
          setConversationStep('feedback');
        } else if (result.nextStep === 'complete') {
          setTimeout(() => {
            setCallState('ended');
            onEndCall();
          }, 3000);
        }
      } else if (conversationStep === 'feedback') {
        // Handle feedback submission
        try {
          const feedbackValue = parseInt(response);
          if (feedbackValue >= 1 && feedbackValue <= 5) {
            await submitFeedback(feedbackValue);
            setFeedback(feedbackValue);
            
            const thankYouMessage = "شكرا لوقت حضرتك, مع السلامة";
            addMessage(thankYouMessage, 'ai');
            await speakText(thankYouMessage);
            
            setTimeout(() => {
              setCallState('ended');
              onEndCall(feedbackValue);
            }, 3000);
          } else {
            const errorMessage = "برجاء إدخال رقم من 1 إلى 5";
            addMessage(errorMessage, 'ai');
            await speakText(errorMessage);
          }
        } catch (error) {
          const errorMessage = "برجاء إدخال رقم من 1 إلى 5";
          addMessage(errorMessage, 'ai');
          await speakText(errorMessage);
        }
      }
    } catch (error) {
      console.error("Error processing customer response:", error);
      toast.error("حدث خطأ في معالجة الرد");
    } finally {
      setCallState('listening');
    }
  };

  const renderCallControls = () => {
    switch (callState) {
      case 'ready':
        return (
          <Button onClick={handleStartCall} className="w-full">
            بدء المكالمة
          </Button>
        );
      case 'calling':
        return (
          <Button disabled className="w-full bg-call-waiting">
            جاري الإتصال...
          </Button>
        );
      case 'connected':
      case 'speaking':
      case 'listening':
        return (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className={`flex-1 ${callState === 'listening' ? 'bg-call-active animate-pulse-recording' : ''}`}
              onClick={handleVoiceInput}
              disabled={callState === 'speaking'}
            >
              <Mic className="mr-2 h-4 w-4" />
              {callState === 'listening' ? 'جاري الاستماع...' : 'استماع'}
            </Button>
            
            <Button 
              variant="outline" 
              className={`flex-1 ${callState === 'speaking' ? 'bg-call-active' : ''}`}
              disabled={true}
            >
              <Volume2 className="mr-2 h-4 w-4" />
              {callState === 'speaking' ? 'جاري التحدث...' : 'تحدث'}
            </Button>
            
            <Button 
              variant="destructive" 
              className="flex-1"
              onClick={() => setCallState('ended')}
            >
              إنهاء المكالمة
            </Button>
          </div>
        );
      case 'ended':
        return (
          <div className="space-y-4">
            <p className="text-center">تم إنهاء المكالمة</p>
            <Button onClick={onBack} className="w-full">
              العودة للقائمة
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={onBack}>
          العودة
        </Button>
        <h2 className="text-2xl font-bold">المكالمة مع {customer.user}</h2>
      </div>

      <Card className="min-h-[500px] flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle>
              رقم التذكرة: {customer.ticket_id}
            </CardTitle>
            <Badge variant={
              callState === 'ready' ? 'outline' :
              callState === 'calling' ? 'secondary' :
              callState === 'ended' ? 'destructive' :
              'default'
            }>
              {callState === 'ready' && 'جاهز للاتصال'}
              {callState === 'calling' && 'جاري الاتصال'}
              {callState === 'connected' && 'متصل'}
              {callState === 'speaking' && 'جاري التحدث'}
              {callState === 'listening' && 'جاري الاستماع'}
              {callState === 'ended' && 'انتهى الاتصال'}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-2">
            المشكلة: {customer.issue}
          </p>
        </CardHeader>

        <Tabs defaultValue="conversation" className="flex-1 flex flex-col">
          <TabsList className="mx-6">
            <TabsTrigger value="conversation">المحادثة</TabsTrigger>
            <TabsTrigger value="script">السيناريو</TabsTrigger>
            <TabsTrigger value="notes">ملاحظات</TabsTrigger>
          </TabsList>
          
          <TabsContent value="conversation" className="flex-1 flex flex-col mt-0">
            <CardContent className="flex-1 overflow-y-auto pt-6">
              <div className="space-y-4">
                {messages.map(message => (
                  <div 
                    key={message.id} 
                    className={`flex ${message.sender === 'ai' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div 
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.sender === 'ai' 
                          ? 'bg-muted' 
                          : 'bg-primary text-primary-foreground'
                      }`}
                    >
                      <p>{message.text}</p>
                      <p className="text-xs opacity-70 text-right mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            
            <Separator />
            
            <CardFooter className="p-4">
              {callState !== 'ready' && callState !== 'calling' && callState !== 'ended' && (
                <div className="flex w-full gap-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="اكتب رسالتك هنا..."
                    className="flex-1 p-2 border rounded-md"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') handleSendMessage();
                    }}
                  />
                  <Button onClick={handleSendMessage}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              )}
              
              <div className="w-full mt-4">
                {renderCallControls()}
              </div>
            </CardFooter>
          </TabsContent>
          
          <TabsContent value="script">
            <CardContent>
              <div className="space-y-4">
                <h3 className="font-bold">سيناريو المكالمة</h3>
                <div className="border-l-4 border-primary pl-4 py-2 bg-muted rounded">
                  <p className="mb-2">1. تحية العميل والتعريف بسبب المكالمة:</p>
                  <blockquote className="text-sm">
                    "اهلا وسهلا, صباح الخير [اسم العميل]، بكلم حضرتك بخصوص مشكلة رقم [رقم التذكرة] و اللي كانت بخصوص [المشكلة]..."
                  </blockquote>
                </div>
                
                <div className="border-l-4 border-primary pl-4 py-2 bg-muted rounded">
                  <p className="mb-2">2. التأكد من مناسبة الوقت للعميل:</p>
                  <blockquote className="text-sm">
                    "لو الوقت مناسب مع حضرتك دلوقتي ممكن نكمل, و لو لا, ممكن اتصل نتكلم في وقت تاني. تمام نكمل ولا لا؟"
                  </blockquote>
                </div>
                
                <div className="border-l-4 border-primary pl-4 py-2 bg-muted rounded">
                  <p className="mb-2">3. السؤال عن حل المشكلة:</p>
                  <blockquote className="text-sm">
                    "اول سؤال, هل المشكلة اتحلت يا فندم؟"
                  </blockquote>
                </div>
                
                <div className="border-l-4 border-primary pl-4 py-2 bg-muted rounded">
                  <p className="mb-2">4. السؤال عن الخطوات المطلوبة:</p>
                  <blockquote className="text-sm">
                    "طب حضرتك خلصت الخطوات المطلوبة يا فندم؟"
                  </blockquote>
                </div>
                
                <div className="border-l-4 border-primary pl-4 py-2 bg-muted rounded">
                  <p className="mb-2">5. جمع التقييم:</p>
                  <blockquote className="text-sm">
                    "ممكن حضرتك تُقَيِّم الخدمة و تقول لنا رأيك من واحد لخمسة؟"
                  </blockquote>
                </div>
              </div>
            </CardContent>
          </TabsContent>
          
          <TabsContent value="notes">
            <CardContent>
              <textarea
                className="w-full h-[300px] p-3 border rounded-md"
                placeholder="اضف ملاحظاتك هنا..."
              />
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default CallInterface;
