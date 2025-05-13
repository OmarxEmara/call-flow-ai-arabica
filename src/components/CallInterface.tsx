import React, { useState } from 'react';
import { Customer } from '@/types/customer';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mic, Volume2, Send } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { toast } from '@/components/ui/sonner';

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
  
  // Mock conversation flow
  const mockConversationFlow = [
    {
      text: `اهلا وسهلا, صباح الخير ${customer.user}، بكلم حضرتك بخصوص مشكلة رقم ${customer.ticket_id} و اللي كانت بخصوص ${customer.issue}. هسأل حضرتك شوية أسْئِلَة للمتابعة, و لو سمحت الاجابة تكون ب آه او لا علا الأسْئِلَة. لو الوقت مناسب مع حضرتك دلوقتي ممكن نكمل, و لو لا, ممكن اتصل نتكلم في وقت تاني. تمام نكمل ولا لا؟`,
      sender: 'ai' as const,
    },
    {
      text: "آه، تمام",
      sender: 'customer' as const,
    },
    {
      text: "اول سؤال , هل المشكلة اتحلت يا فندم؟",
      sender: 'ai' as const,
    },
    {
      text: "لا، لسه",
      sender: 'customer' as const,
    },
    {
      text: "طب حضرتك خلصت الخطوات المطلوبة يا فندم؟",
      sender: 'ai' as const,
    },
    {
      text: "ايوه خلصتها",
      sender: 'customer' as const,
    },
    {
      text: "هَصْعَد مشكلة حضرتك للمختصين. آسفين علا التأخير يا فندم. المشكلة هتتحل في خلال 3 أيام عمل. ممكن حضرتك تقَيِّم الخدمة و تقول لنا رأيك من واحد لخمسة؟",
      sender: 'ai' as const,
    }
  ];

  const handleStartCall = () => {
    setCallState('calling');
    toast("جاري الاتصال بالعميل...");
    
    // Simulate connection delay
    setTimeout(() => {
      setCallState('connected');
      toast.success("تم الاتصال بنجاح");
      
      // Add first message after connection
      addMessage(mockConversationFlow[0].text, 'ai');
      setCallState('speaking');
      
      // Simulate AI speaking
      setTimeout(() => {
        setCallState('listening');
      }, 5000);
    }, 2000);
  };

  const addMessage = (text: string, sender: 'ai' | 'customer') => {
    const newMessage = {
      id: Date.now(),
      text,
      sender,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    
    // Add customer message
    addMessage(inputText, 'customer');
    setInputText('');
    
    // Determine where we are in the conversation flow
    const aiMessageCount = messages.filter(m => m.sender === 'ai').length;
    
    if (aiMessageCount < mockConversationFlow.filter(m => m.sender === 'ai').length) {
      setCallState('speaking');
      
      // Simulate AI processing and response
      setTimeout(() => {
        // Get next AI message from flow
        const nextAiMessageIndex = mockConversationFlow.findIndex(
          (m, i) => m.sender === 'ai' && i > aiMessageCount * 2 - 1
        );
        
        if (nextAiMessageIndex !== -1) {
          addMessage(mockConversationFlow[nextAiMessageIndex].text, 'ai');
        }
        
        setTimeout(() => {
          setCallState('listening');
        }, 3000);
      }, 1500);
    } else {
      // End of script reached
      handleFeedbackSubmission(parseInt(inputText));
    }
  };

  const handleFeedbackSubmission = (rating: number) => {
    if (rating >= 1 && rating <= 5) {
      setFeedback(rating);
      toast.success(`شكرا لتقييمك: ${rating}/5`);
      
      // Add AI thank you message
      addMessage("شكرا لوقت حضرتك, مع السلامة", 'ai');
      
      // End call after delay
      setTimeout(() => {
        setCallState('ended');
        onEndCall(rating);
      }, 2000);
    } else {
      toast.error("برجاء إدخال رقم من 1 إلى 5");
    }
  };

  const handleVoiceInput = () => {
    toast("جاري الاستماع...");
    setCallState('listening');
    
    // Simulate voice recognition
    setTimeout(() => {
      const customerResponses = mockConversationFlow.filter(m => m.sender === 'customer');
      const customerMessageCount = messages.filter(m => m.sender === 'customer').length;
      
      if (customerMessageCount < customerResponses.length) {
        const nextResponse = customerResponses[customerMessageCount].text;
        addMessage(nextResponse, 'customer');
        
        // Simulate AI processing and response
        setCallState('speaking');
        setTimeout(() => {
          const nextAiMessage = mockConversationFlow[customerMessageCount * 2 + 1].text;
          addMessage(nextAiMessage, 'ai');
          
          setTimeout(() => {
            setCallState('listening');
          }, 3000);
        }, 1500);
      }
    }, 2000);
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
