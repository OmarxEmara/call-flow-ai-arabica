
// Audio service that connects to the Python backend API

// API base URL - adjust this to match your Python backend URL
const API_BASE_URL = 'http://localhost:5000'; // Change this to your Python API endpoint

export const startListening = async (): Promise<boolean> => {
  console.log("Starting listening...");
  try {
    const response = await fetch(`${API_BASE_URL}/start_listening`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error('Failed to start listening');
    }
    
    return true;
  } catch (error) {
    console.error("Error starting listening:", error);
    return false;
  }
};

export const stopListening = async (): Promise<{ text: string }> => {
  console.log("Stopping listening...");
  try {
    // This endpoint should trigger your Python function listen_and_transcribe()
    const response = await fetch(`${API_BASE_URL}/stop_listening`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error('Failed to stop listening');
    }
    
    const data = await response.json();
    return { text: data.transcript || "لم يتم التعرف على الكلام" };
  } catch (error) {
    console.error("Error stopping listening:", error);
    return { text: "حدث خطأ في التعرف على الكلام" };
  }
};

export const speakText = async (text: string): Promise<boolean> => {
  console.log(`Speaking: ${text}`);
  try {
    // This endpoint should trigger your Python function text_to_speech()
    const response = await fetch(`${API_BASE_URL}/speak`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to speak text');
    }
    
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
  console.log(`Submitting feedback: ${rating}`);
  try {
    // This endpoint should trigger your Python function get_feedback()
    const response = await fetch(`${API_BASE_URL}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ rating }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to submit feedback');
    }
    
    return true;
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return false;
  }
};

export const continueCall = async (answer: string): Promise<boolean> => {
  console.log(`Continue call response: ${answer}`);
  try {
    // This endpoint should trigger your Python function continue_call_or_not()
    const response = await fetch(`${API_BASE_URL}/continue_call`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ answer }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to process continue call response');
    }
    
    return true;
  } catch (error) {
    console.error("Error processing continue call:", error);
    return false;
  }
};

export const handleQuestion = async (answer: string): Promise<{
  nextStep: 'feedback' | 'follow_up' | 'complete',
  message: string
}> => {
  console.log(`Handling question response: ${answer}`);
  try {
    // This endpoint should handle your Python handle_questions() function logic
    const response = await fetch(`${API_BASE_URL}/handle_question`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ answer }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to handle question response');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error handling question:", error);
    return {
      nextStep: 'complete',
      message: "حدث خطأ في معالجة الإجابة"
    };
  }
};
