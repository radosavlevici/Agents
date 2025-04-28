import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

// State to track API key availability - will be updated by checkApiKeyStatus()
let hasAnthropicKey = false;
let hasOpenAIKey = false;

// Function to check API key status from the server
export async function checkApiKeyStatus() {
  try {
    const response = await fetch('/api/ai/status');
    if (!response.ok) {
      console.error('Failed to fetch API key status:', response.statusText);
      return false;
    }
    
    const data = await response.json();
    console.log('API key status:', data);
    
    // Update status variables
    hasAnthropicKey = data.anthropic === true;
    hasOpenAIKey = data.openai === true;
    
    // Update the status values only
    // We're using fetch for API calls, so we don't need to initialize SDK clients
    
    // Update the aiServicesStatus object
    aiServicesStatus.anthropic = hasAnthropicKey;
    aiServicesStatus.openai = hasOpenAIKey;
    
    return true;
  } catch (error) {
    console.error('Error checking API key status:', error);
    return false;
  }
}

// Call it immediately on load
checkApiKeyStatus();

// Anthropic Claude Functions
export async function sendMessageToAntropic(message: string): Promise<string> {
  if (!hasAnthropicKey) {
    return "Claude AI service is not available. Please ensure that your Anthropic API key is properly configured.";
  }

  try {
    // Use fetch to communicate with our proxy endpoint instead of direct SDK call
    const response = await fetch('/api/anthropic/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-7-sonnet-20250219',
        max_tokens: 1000,
        messages: [{ role: 'user', content: message }],
        system: "You are an AI assistant specifically designed to help ervin210@icloud.com. Your responses should be helpful, respectful, and secure. Focus on providing personalized assistance related to device security, digital privacy, software development, and cybersecurity issues. You have expertise in identifying security vulnerabilities, code review, and development best practices. For security-related questions, provide detailed analysis and recommendations. For development questions, offer code examples and practical solutions. Keep responses concise and direct."
      })
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();

    // Get the content from the response (matches Anthropic's API structure)
    if (data.content && data.content.length > 0) {
      const firstContent = data.content[0];
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
  if (!hasOpenAIKey) {
    return "GPT AI service is not available. Please ensure that your OpenAI API key is properly configured.";
  }

  try {
    // Use fetch to communicate with our proxy endpoint instead of direct SDK call
    const response = await fetch('/api/openai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: "You are an AI assistant specifically designed to help ervin210@icloud.com. Your responses should be helpful, respectful, and secure. Focus on providing personalized assistance related to device security, digital privacy, software development, and cybersecurity issues. You have access to information about user's iPhone (MU773ZD/A, SN:D2VMW6RNW2). You have expertise in code development, debugging, security vulnerability assessment, and technology implementation. For development questions, provide code examples and detailed explanations. For security issues, perform risk analysis and recommend protective measures. Keep responses concise and direct."
          },
          { role: 'user', content: message }
        ],
        max_tokens: 1000,
      })
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.choices[0].message.content || "No response generated";
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
    const dataAnalysisKeywords = ['analyze', 'data', 'statistics', 'pattern', 'insight'];
    
    const isSecurityRelated = securityKeywords.some(keyword => message.toLowerCase().includes(keyword));
    const isDataAnalysisRelated = dataAnalysisKeywords.some(keyword => message.toLowerCase().includes(keyword));
    
    if (hasAnthropicKey && (isSecurityRelated || !hasOpenAIKey)) {
      preferredService = 'anthropic';  // Claude is particularly good with security topics
    } else if (hasOpenAIKey && (isDataAnalysisRelated || !hasAnthropicKey)) {
      preferredService = 'openai';     // GPT for data analysis and general queries
    } else if (hasAnthropicKey) {
      preferredService = 'anthropic';  // Default to Anthropic if available
    } else if (hasOpenAIKey) {
      preferredService = 'openai';     // Default to OpenAI if Anthropic not available
    } else {
      return "No AI services are available. Please configure at least one API key.";
    }
  }
  
  // Call the appropriate AI service
  try {
    if (preferredService === 'anthropic') {
      return await sendMessageToAntropic(message);
    } else {
      return await sendMessageToOpenAI(message);
    }
  } catch (error) {
    console.error(`Error using ${preferredService} service:`, error);
    
    // Try fallback if primary service fails
    try {
      if (preferredService === 'anthropic' && hasOpenAIKey) {
        console.log("Falling back to OpenAI service...");
        return await sendMessageToOpenAI(message);
      } else if (preferredService === 'openai' && hasAnthropicKey) {
        console.log("Falling back to Anthropic service...");
        return await sendMessageToAntropic(message);
      }
    } catch (fallbackError) {
      console.error("Fallback service also failed:", fallbackError);
    }
    
    return `There was an error processing your request with the ${preferredService === 'anthropic' ? 'Claude AI' : 'GPT AI'} service. ${hasAnthropicKey && hasOpenAIKey ? 'I tried using the alternative AI service as a fallback, but it also failed.' : ''}`;
  }
}