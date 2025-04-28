import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

// Helper function to check if API keys are available
const hasAnthropicKey = typeof import.meta.env.VITE_ANTHROPIC_API_KEY === 'string' && 
                       import.meta.env.VITE_ANTHROPIC_API_KEY.trim() !== '';
const hasOpenAIKey = typeof import.meta.env.VITE_OPENAI_API_KEY === 'string' && 
                    import.meta.env.VITE_OPENAI_API_KEY.trim() !== '';

// Initialize the Anthropic client if API key is available
// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const anthropic = hasAnthropicKey ? new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true, // Required for client-side usage
}) : null;

// Initialize the OpenAI client if API key is available
// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
const openai = hasOpenAIKey ? new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,  // Required for client-side usage
}) : null;

// Anthropic Claude Functions
export async function sendMessageToAntropic(message: string): Promise<string> {
  if (!hasAnthropicKey || !anthropic) {
    return "Claude AI service is not available. Please ensure that your Anthropic API key is properly configured.";
  }

  try {
    const response = await anthropic!.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 1000,
      messages: [{ role: 'user', content: message }],
      system: "You are an AI assistant specifically designed to help ervin210@icloud.com. Your responses should be helpful, respectful, and secure. Focus on providing personalized assistance related to device security and digital privacy. Keep responses concise and direct."
    });

    // Get the content from the response
    if (response.content && response.content.length > 0) {
      const firstContent = response.content[0];
      if ('text' in firstContent) {
        return firstContent.text;
      }
    }
    
    return "I received your message but couldn't generate a proper response. Please try again.";
  } catch (error) {
    console.error('Error communicating with Anthropic:', error);
    return "I'm having trouble connecting to the Anthropic AI service. Please try again later.";
  }
}

// OpenAI Functions
export async function sendMessageToOpenAI(message: string): Promise<string> {
  if (!hasOpenAIKey || !openai) {
    return "GPT AI service is not available. Please ensure that your OpenAI API key is properly configured.";
  }

  try {
    const response = await openai!.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: "You are an AI assistant specifically designed to help ervin210@icloud.com. Your responses should be helpful, respectful, and secure. Focus on providing personalized assistance related to device security and digital privacy. You have access to information about user's iPhone (MU773ZD/A, SN:D2VMW6RNW2). Keep responses concise and direct."
        },
        { role: 'user', content: message }
      ],
      max_tokens: 1000,
    });

    return response.choices[0].message.content || "No response generated";
  } catch (error) {
    console.error('Error communicating with OpenAI:', error);
    return "I'm having trouble connecting to the OpenAI service. Please try again later.";
  }
}

// Exported function to check if AI services are available
export const aiServicesStatus = {
  anthropic: hasAnthropicKey,
  openai: hasOpenAIKey,
  get anyAvailable() { 
    return this.anthropic || this.openai;
  }
};

// Function to select AI service based on query or preference
export async function getAIResponse(message: string, preferredService?: 'anthropic' | 'openai'): Promise<string> {
  // Check if any AI services are available
  if (!aiServicesStatus.anyAvailable) {
    return "AI services are not available. Please ensure either Anthropic or OpenAI API keys are properly configured.";
  }

  // Default to available service if requested service is not available
  if (preferredService === 'anthropic' && !hasAnthropicKey) {
    preferredService = hasOpenAIKey ? 'openai' : undefined;
  } else if (preferredService === 'openai' && !hasOpenAIKey) {
    preferredService = hasAnthropicKey ? 'anthropic' : undefined;
  }

  // If no preferred service specified, select based on availability and query content
  if (!preferredService) {
    const securityKeywords = ['security', 'privacy', 'protect', 'hack', 'breach', 'scan', 'threat'];
    const securityRelated = securityKeywords.some(keyword => message.toLowerCase().includes(keyword));
    
    if (hasAnthropicKey && (securityRelated || !hasOpenAIKey)) {
      preferredService = 'anthropic';  // Claude is particularly good with security topics
    } else if (hasOpenAIKey) {
      preferredService = 'openai';     // GPT for general queries
    } else {
      preferredService = 'anthropic';  // Fallback to first option
    }
  }
  
  if (preferredService === 'anthropic') {
    return sendMessageToAntropic(message);
  } else {
    return sendMessageToOpenAI(message);
  }
}