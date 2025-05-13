
// Audio service with mock API responses (no backend required)
import { toast } from "@/components/ui/sonner";

// Mock implementation (no backend required)
const mockDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const startListening = async (): Promise<boolean> => {
  console.log("Starting listening (mock)...");
  try {
    // Simulate API delay
    await mockDelay(500);
    return true;
  } catch (error) {
    console.error("Error starting listening:", error);
    return false;
  }
};

export const stopListening = async (): Promise<{ text: string }> => {
  console.log("Stopping listening (mock)...");
  try {
    // Simulate API delay
    await mockDelay(1000);
    
    // Generate a random Arabic response
    const responses = [
      "نعم",
      "لا",
      "تمام",
      "ممكن",
      "اتفضل",
      "مش متأكد",
      "طبعاً",
      "شكراً",
      "ماشي"
    ];
    
    const randomIndex = Math.floor(Math.random() * responses.length);
    return { text: responses[randomIndex] };
  } catch (error) {
    console.error("Error stopping listening:", error);
    return { text: "لم يتم التعرف على الكلام" };
  }
};

export const speakText = async (text: string): Promise<boolean> => {
  console.log(`Speaking (mock): ${text}`);
  try {
    // Simulate API delay - longer text takes longer to speak
    const speakingTime = Math.max(1000, text.length * 50);
    await mockDelay(speakingTime);
    
    return true;
  } catch (error) {
    console.error("Error speaking text:", error);
    return false;
  }
};

export const getAPIKey = (): string | null => {
  return localStorage.getItem('elevenlabs-api-key');
};

export const setAPIKey = (key: string): void => {
  localStorage.setItem('elevenlabs-api-key', key);
};

export const getFeedback = async (rating: number): Promise<boolean> => {
  console.log(`Submitting feedback (mock): ${rating}`);
  try {
    // Simulate API delay
    await mockDelay(500);
    toast.success(`تم تسجيل التقييم: ${rating}/5`);
    return true;
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return false;
  }
};

export const continueCall = async (answer: string): Promise<boolean> => {
  console.log(`Continue call response (mock): ${answer}`);
  try {
    // Simulate API delay
    await mockDelay(500);
    
    // Simple logic to determine if call should continue
    const positiveResponses = ["نعم", "تمام", "موافق", "أيوة", "آه", "اه"];
    const lowerAnswer = answer.toLowerCase();
    
    // Check if any positive response is included in the answer
    return positiveResponses.some(response => lowerAnswer.includes(response.toLowerCase())) || Math.random() > 0.2;
  } catch (error) {
    console.error("Error processing continue call:", error);
    return true; // Default to continuing the call
  }
};

export const handleQuestion = async (answer: string): Promise<{
  nextStep: 'feedback' | 'follow_up' | 'complete',
  message: string
}> => {
  console.log(`Handling question response (mock): ${answer}`);
  try {
    // Simulate API delay
    await mockDelay(1000);
    
    // Simple mock logic to determine next step
    const questionCount = parseInt(localStorage.getItem('questionCount') || '0');
    localStorage.setItem('questionCount', (questionCount + 1).toString());
    
    if (questionCount >= 2) {
      // After 3 questions, ask for feedback
      localStorage.setItem('questionCount', '0'); // Reset counter
      return {
        nextStep: 'feedback',
        message: "شكراً على الإجابات، ممكن حضرتك تُقَيِّم الخدمة و تقول لنا رأيك من واحد لخمسة؟"
      };
    } else if (questionCount === 0) {
      return {
        nextStep: 'follow_up',
        message: "طب حضرتك خلصت الخطوات المطلوبة يا فندم؟"
      };
    } else {
      return {
        nextStep: 'follow_up',
        message: "هل لديك أي استفسارات أخرى متعلقة بهذه المشكلة؟"
      };
    }
  } catch (error) {
    console.error("Error handling question:", error);
    return {
      nextStep: 'complete',
      message: "شكراً للتواصل معنا، سعداء بخدمتك"
    };
  }
};
