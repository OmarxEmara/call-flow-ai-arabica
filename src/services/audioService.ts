
// This is a mock service that would interact with the backend audio processing

export const startListening = async (): Promise<boolean> => {
  console.log("Starting listening...");
  // In a real implementation, this would connect to the backend
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 500);
  });
};

export const stopListening = async (): Promise<{ text: string }> => {
  console.log("Stopping listening...");
  // In a real implementation, this would get the transcription from the backend
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ text: "نعم، أنا موافق" }); // Mock response
    }, 1000);
  });
};

export const speakText = async (text: string): Promise<boolean> => {
  console.log(`Speaking: ${text}`);
  // In a real implementation, this would send the text to be spoken to the backend
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, text.length * 50); // Simulating speaking time based on text length
  });
};

export const getAPIKey = (): string | null => {
  return localStorage.getItem('elevenlabs-api-key');
};

export const setAPIKey = (key: string): void => {
  localStorage.setItem('elevenlabs-api-key', key);
};
