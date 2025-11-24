import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Typography, Paper, TextField, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { health as ollamaHealth, listModels as ollamaListModels, pullModel as ollamaPullModel, ragConvert as ollamaRagConvert } from '../services/ollama';
import BackButton from '../components/BackButton';
import { detectLanguageLocal, detectLanguageAPI } from '../services/api';
import { FaPaperPlane } from 'react-icons/fa';
import { styled } from '@mui/material/styles';
import MonacoEditor from '@monaco-editor/react';
import ThemeSwitch from '../components/ThemeSwitchButton';
import styledComp from 'styled-components';

const Container = styledComp.div<{ theme?: { background: string, text: string } }>`
  background-color: ${props => props.theme?.background || '#f5f7fa'};
  color: ${props => props.theme?.text || '#222'};
  min-height: 100vh;
`;

const ChatContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '600px',
  border: '1px solid #333',
  borderRadius: '8px',
  backgroundColor: '#1e1e1e',
  overflow: 'hidden'
}));

const ChatMessages = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  overflowY: 'auto',
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2)
}));

const ChatMessage = styled(Box)(({ theme }) => ({
  maxWidth: '80%',
  padding: theme.spacing(1.5),
  borderRadius: '8px',
  '&.user': {
    alignSelf: 'flex-end',
    backgroundColor: '#007acc',
    color: 'white'
  },
  '&.ai': {
    alignSelf: 'flex-start',
    backgroundColor: '#333',
    color: 'white'
  }
}));

const ChatInputContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  padding: theme.spacing(1),
  borderTop: '1px solid #333',
  backgroundColor: '#2d2d30'
}));

// Styled components for the chat interface
const ChatHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  borderBottom: '1px solid #333',
  backgroundColor: '#2d2d30',
  fontWeight: 600,
  color: 'white'
}));

const ChatBubbleContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1)
}));

const ChatBubble = styled(Box)(({ theme, role }) => ({
  maxWidth: '80%',
  padding: theme.spacing(1.5),
  borderRadius: '8px',
  color: 'white',
  ...(role === 'user' ? {
    alignSelf: 'flex-end',
    backgroundColor: '#007acc'
  } : {
    alignSelf: 'flex-start',
    backgroundColor: '#333'
  })
}));

const CodeBlock = styled('pre')(({ theme }) => ({
  backgroundColor: '#1e1e1e',
  borderRadius: '4px',
  padding: theme.spacing(1.5),
  overflowX: 'auto',
  margin: theme.spacing(1, 0),
  '& code': {
    fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
    fontSize: '0.9rem',
    lineHeight: '1.5'
  },
  // Basic syntax highlighting styles
  '& .language-javascript, & .language-js': {
    color: '#d4d4d4',
    '.comment': { color: '#6a9955' },
    '.keyword': { color: '#569cd6' },
    '.string': { color: '#ce9178' },
    '.number': { color: '#b5cea8' },
    '.function': { color: '#dcdcaa' },
    '.operator': { color: '#d4d4d4' }
  },
  '& .language-python, & .language-py': {
    color: '#d4d4d4',
    '.comment': { color: '#6a9955' },
    '.keyword': { color: '#569cd6' },
    '.string': { color: '#ce9178' },
    '.number': { color: '#b5cea8' },
    '.function': { color: '#dcdcaa' },
    '.operator': { color: '#d4d4d4' }
  },
  '& .language-java': {
    color: '#d4d4d4',
    '.comment': { color: '#6a9955' },
    '.keyword': { color: '#569cd6' },
    '.string': { color: '#ce9178' },
    '.number': { color: '#b5cea8' },
    '.function': { color: '#dcdcaa' },
    '.operator': { color: '#d4d4d4' }
  },
  '& .language-c, & .language-cpp': {
    color: '#d4d4d4',
    '.comment': { color: '#6a9955' },
    '.keyword': { color: '#569cd6' },
    '.string': { color: '#ce9178' },
    '.number': { color: '#b5cea8' },
    '.function': { color: '#dcdcaa' },
    '.operator': { color: '#d4d4d4' }
  }
}));

// Add styled components for the chat interface
const ChatPanel = styled(Box)(({ theme }) => ({
  height: '600px',
  border: '1px solid #333',
  borderRadius: '4px',
  overflow: 'hidden',
  backgroundColor: '#1e1e1e',
  display: 'flex',
  flexDirection: 'column'
}));

const ChatMessagesContainer = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  overflowY: 'auto',
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2)
}));

const WriteWithAI: React.FC = () => {
    const [promptText, setPromptText] = useState('');
    const [generatedCode, setGeneratedCode] = useState('');
    const [chatMessages, setChatMessages] = useState<Array<{role: string, content: string}>>([]);
    const navigate = useNavigate();
    const [models, setModels] = useState<string[]>([]);
    const [selectedModel, setSelectedModel] = useState<string>('');
    const [generating, setGenerating] = useState(false);
    const [ollamaRunning, setOllamaRunning] = useState(false);
    const promptEditorRef = useRef<any>(null);
    const codeOutputRef = useRef<any>(null);
    const chatMessagesRef = useRef<HTMLDivElement>(null);
    const [detectedLanguage, setDetectedLanguage] = useState<string>('plaintext');
    const [isDetecting, setIsDetecting] = useState(false);
    const [aiResponses, setAiResponses] = useState<Array<{content: string, codeBlocks: Array<{language: string, code: string}>}>>([]);

    useEffect(() => {
        (async () => {
            const tags = await ollamaListModels();
            const names = tags.map(m => m.name || m.model).filter(Boolean);
            setModels(names);
            if (!selectedModel) setSelectedModel(names[0] || '');
        })();
    }, []);

    // Auto-scroll chat to bottom
    useEffect(() => {
        if (chatMessagesRef.current) {
            chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
        }
    }, [chatMessages]);

    // Auto-scroll AI responses to bottom
    useEffect(() => {
        if (codeOutputRef.current) {
            codeOutputRef.current.scrollTop = codeOutputRef.current.scrollHeight;
        }
    }, [aiResponses]);

    // Auto-detect language of generated code
    useEffect(() => {
        const code = generatedCode.trim();
        if (code) {
            // First try fast local detection for immediate feedback
            const localDetected = detectLanguageLocal(code);
            const langMap: Record<string, string> = {
                js: 'javascript',
                ts: 'typescript',
                python: 'python',
                java: 'java',
                c: 'c',
                cpp: 'cpp',
            };
            setDetectedLanguage(localDetected ? langMap[localDetected] || 'plaintext' : 'plaintext');
            
            // Then use API detection for more accurate results
            const apiDetect = async () => {
                setIsDetecting(true);
                try {
                    const apiDetected = await detectLanguageAPI(code);
                    // Map API response to our expected types
                    const mappedLanguage = apiDetected === 'javascript' ? 'javascript' : 
                                         apiDetected === 'typescript' ? 'typescript' : 
                                         apiDetected === 'python' ? 'python' : 
                                         apiDetected === 'java' ? 'java' : 
                                         apiDetected === 'c' ? 'c' : 
                                         apiDetected === 'cpp' ? 'cpp' : 
                                         'plaintext';
                    
                    setDetectedLanguage(mappedLanguage);
                } catch (error) {
                    // If API detection fails, fall back to local detection
                    console.warn('API language detection failed, falling back to local detection:', error);
                    const localDetected = detectLanguageLocal(code);
                    const langMap: Record<string, string> = {
                        js: 'javascript',
                        ts: 'typescript',
                        python: 'python',
                        java: 'java',
                        c: 'c',
                        cpp: 'cpp',
                    };
                    setDetectedLanguage(localDetected ? langMap[localDetected] || 'plaintext' : 'plaintext');
                } finally {
                    setIsDetecting(false);
                }
            };
            
            apiDetect();
        } else {
            setDetectedLanguage('plaintext');
        }
    }, [generatedCode]);

    const parseAIResponse = (response: string) => {
        if (!response) return { content: '', codeBlocks: [] };
        
        // Split the response into text and code blocks
        const parts = response.split(/(```[\s\S]*?```)/g);
        const codeBlocks: Array<{language: string, code: string}> = [];
        let content = '';
        
        parts.forEach(part => {
            if (part.startsWith('```') && part.endsWith('```')) {
                // This is a code block
                const lines = part.slice(3, -3).split('\n');
                const firstLine = lines[0] || '';
                const code = lines.slice(1).join('\n').trim();
                
                // Try to detect language from the first line (e.g., ```javascript)
                let language = 'plaintext';
                if (firstLine) {
                    const langMap: Record<string, string> = {
                        js: 'javascript',
                        ts: 'typescript',
                        py: 'python',
                        java: 'java',
                        c: 'c',
                        cpp: 'cpp',
                        javascript: 'javascript',
                        typescript: 'typescript',
                        python: 'python'
                    };
                    language = langMap[firstLine] || firstLine || 'plaintext';
                }
                
                codeBlocks.push({ language, code });
                // Add a placeholder in the content
                content += `[CODE_BLOCK_${codeBlocks.length - 1}]`;
            } else {
                // This is regular text
                content += part;
            }
        });
        
        return { content, codeBlocks };
    };

    const handleGenerateCode = async () => {
        const prompt = promptText.trim();
        if (!prompt) return;
        
        // Add user message to chat
        const newMessages = [...chatMessages, { role: 'user', content: prompt }];
        setChatMessages(newMessages);
        setPromptText('');
        
        try {
            setGenerating(true);
            
            // Quick health check with timeout
            const healthPromise = ollamaHealth();
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Health check timeout')), 2000)
            );
            
            const ok = await Promise.race([healthPromise, timeoutPromise]).catch(() => false);
            if (!ok) {
                setGeneratedCode('// Error: Ollama daemon is not reachable at http://localhost:11434');
                setGenerating(false);
                setChatMessages([...newMessages, { role: 'ai', content: 'Error: Ollama daemon is not reachable at http://localhost:11434' }]);
                return;
            }
            
            let names = models;
            if (names.length === 0) {
                const tags = await ollamaListModels();
                names = tags.map(m => m.name || m.model).filter(Boolean);
                setModels(names);
            }
            let modelToUse = selectedModel || names[0] || '';
            if (!modelToUse) {
                setGeneratedCode('// Error: No Ollama model available. Please pull a model in Ollama.');
                setGenerating(false);
                setChatMessages([...newMessages, { role: 'ai', content: 'Error: No Ollama model available. Please pull a model in Ollama.' }]);
                return;
            }
            setSelectedModel(modelToUse);
            
            // Show immediate feedback
            setGeneratedCode(`// ⚡ Generating with ${modelToUse}...\n// It will take a few seconds to complete`);
            
            // Use RAG convert with 'generate' mode
            const response = await ollamaRagConvert(modelToUse, prompt, 'generate');
            console.log('[WriteWithAI] Received response:', response);
            
            // Extract code from response - only accept actual code
            const extractedCode = extractCodeFromResponse(response);
            console.log('[WriteWithAI] Extracted code:', extractedCode);
            
            // Only set the generated code if we actually extracted code
            if (extractedCode && extractedCode.trim() !== '') {
                setGeneratedCode(extractedCode);
                setChatMessages([...newMessages, { role: 'ai', content: 'Code generated successfully. See the code editor for details.' }]);
            } else {
                // If no code was extracted, show the full response for debugging
                setGeneratedCode(`// No valid code could be extracted from the response
// Full response:
/*
${response}
*/`);
                setChatMessages([...newMessages, { role: 'ai', content: 'No valid code could be extracted from the response' }]);
            }
        } catch (e: any) {
            const errorMessage = `// Error during generation: ${e?.message || String(e)}`;
            setGeneratedCode(errorMessage);
            setChatMessages([...newMessages, { role: 'ai', content: `Error during generation: ${e?.message || String(e)}` }]);
        } finally {
            setGenerating(false);
        }
    };

    const extractCodeFromResponse = (text: string): string => {
        if (!text) return '';
        
        console.log('[WriteWithAI] Attempting to extract code from response, length:', text.length);
        console.log('[WriteWithAI] First 200 chars:', text.substring(0, 200));
        
        // Method 1: Extract code from ``` delimiters if present
        const codeBlockRegex = /```(?:[a-zA-Z0-9]+)?\s*\n([\s\S]*?)\n```/;
        const match = text.match(codeBlockRegex);
        
        if (match && match[1]) {
            const extractedCode = match[1].trim();
            console.log('[WriteWithAI] Extracted code from ``` delimiters, length:', extractedCode.length);
            return extractedCode;
        }
        
        // Method 2: If no delimiters, check if response looks like code
        const trimmedText = text.trim();
        
        // Check if it's an error message
        if (trimmedText.startsWith('//') && trimmedText.includes('Error:')) {
            console.log('[WriteWithAI] Response is an error message');
            return trimmedText;  // Return error as-is
        }
        
        // Check if it looks like code (has code patterns)
        const hasCodePatterns = /(?:#include|import|function|def|class|public|private|const|let|var|program|\bif\b|\bfor\b|\bwhile\b|\breturn\b|\{|\}|;)/.test(trimmedText);
        
        if (hasCodePatterns && trimmedText.length > 10) {
            console.log('[WriteWithAI] Treating entire response as code');
            return trimmedText;
        }
        
        // No valid code found
        console.log('[WriteWithAI] No valid code could be extracted');
        return '';
    };

    // Simplified helper function that doesn't modify the code
    const removeInlineComments = (code: string): string => {
        // For now, just return the code as-is
        // We might want to add comment removal logic later if needed
        return code;
    };

    const handleCopyToCodeEntry = () => {
        // Check if we have valid code (not empty and not an error message)
        const isValidCode = generatedCode && 
                           generatedCode.trim().length > 0 && 
                           !generatedCode.startsWith('//') && 
                           !generatedCode.includes('Error:');
        
        if (isValidCode) {
            console.log('[WriteWithAI] Copying code to Code Entry, length:', generatedCode.length);
            navigate('/code-entry', { state: { code: generatedCode } });
        } else {
            console.warn('[WriteWithAI] Cannot copy - invalid or error code');
        }
    };

    const handleRunOllamaModel = async () => {
        // If LLM is already running, stop it
        if (ollamaRunning) {
            setOllamaRunning(false);
            return;
        }

        // If LLM is not running, start it
        try {
            setGenerating(true);
            const ok = await ollamaHealth();
            if (!ok) {
                alert('Ollama daemon is not reachable at http://localhost:11434. Please start Ollama first.');
                setGenerating(false);
                return;
            }
            let names = models;
            if (names.length === 0) {
                const tags = await ollamaListModels();
                names = tags.map(m => m.name || m.model).filter(Boolean);
                setModels(names);
            }
            let modelToUse = selectedModel || names[0] || '';
            if (!modelToUse) {
                alert('No Ollama model available. Please pull a model using Ollama CLI.');
                setGenerating(false);
                return;
            }
            setSelectedModel(modelToUse);
            // Ensure the model is present and ready by pulling it
            await ollamaPullModel(modelToUse);
            setOllamaRunning(true);
            alert(`Ollama model "${modelToUse}" is now ready for code generation!`);
        } catch (e: any) {
            console.error('Failed to prepare Ollama model:', e);
            alert(`Failed to prepare Ollama: ${e?.message || String(e)}`);
        } finally {
            setGenerating(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleGenerateCode();
        }
    };

    // Function to add a message to the chat
    const addMessage = (role: 'user' | 'ai', content: string) => {
      // For user messages, we just add them directly
      if (role === 'user') {
        setChatMessages(prev => [...prev, { role, content }]);
        return;
      }
      
      // For AI messages, we need to parse the content for code blocks
      const parsedResponse = parseAIResponse(content);
      setAiResponses(prev => [...prev, parsedResponse]);
    };






    return (
        <Container>
            <Box sx={{ maxWidth: 1300, mx: 'auto', p: 4 }}>
                <Box sx={{ position: 'fixed', top: 16, left: 16, zIndex: 10 }}>
                    <BackButton onClick={() => navigate(-1)} />
                </Box>
                <ThemeSwitch />
            <Typography variant="h4" align="center" gutterBottom fontWeight={700}>
                Write with AI
            </Typography>
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', gap: 4, mb: 3 }}>
                    {/* Left panel - Write Your Prompt (no changes needed) */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                            Write Your Prompt
                        </Typography>
                        <ChatContainer>
                            <ChatMessages ref={chatMessagesRef}>
                                {chatMessages.map((msg, index) => (
                                    <ChatMessage key={index} className={msg.role}>
                                        <Typography variant="body2">{msg.content}</Typography>
                                    </ChatMessage>
                                ))}
                                {generating && (
                                    <ChatMessage className="ai">
                                        <Typography variant="body2">Generating code...</Typography>
                                    </ChatMessage>
                                )}
                            </ChatMessages>
                            <ChatInputContainer>
                                <TextField
                                    fullWidth
                                    multiline
                                    maxRows={3}
                                    value={promptText}
                                    onChange={(e) => setPromptText(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Describe the code you want to generate..."
                                    variant="outlined"
                                    size="small"
                                    sx={{ 
                                        backgroundColor: '#333',
                                        borderRadius: '4px',
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: '#555',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: '#777',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#007acc',
                                            },
                                        },
                                    }}
                                    InputProps={{
                                        style: { color: 'white' }
                                    }}
                                />
                                <IconButton 
                                    color="primary" 
                                    onClick={handleGenerateCode}
                                    disabled={!promptText.trim() || generating}
                                    sx={{ ml: 1 }}
                                >
                                    <FaPaperPlane color="white" />
                                </IconButton>
                            </ChatInputContainer>
                        </ChatContainer>
                    </Box>
                    
                    {/* Right panel - Generated Code (restored to Monaco Editor) */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                            Generated Code
                        </Typography>
                        <Box sx={{ height: '600px', border: '1px solid #333', borderRadius: '4px', overflow: 'hidden' }}>
                            <MonacoEditor
                                height="100%"
                                language={detectedLanguage}
                                value={generatedCode}
                                theme="vs-dark"
                                options={{
                                    readOnly: true,
                                    minimap: { enabled: false },
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                }}
                            />
                        </Box>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Button
                        variant="contained"
                        color="secondary"
                        size="large"
                        onClick={handleCopyToCodeEntry}
                        disabled={
                            !generatedCode || 
                            generatedCode.trim().length === 0 || 
                            generatedCode.startsWith('//') || 
                            generatedCode.includes('Error:') ||
                            generating
                        }
                        sx={{ minWidth: 200 }}
                    >
                        Copy to Code Entry
                    </Button>
                </Box>
            </Paper>
        </Box>
    </Container>
  );
};

export default WriteWithAI;