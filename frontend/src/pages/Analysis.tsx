import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Typography, Paper, TextField, IconButton } from '@mui/material';
import Editor from '@monaco-editor/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { health as ollamaHealth, listModels as ollamaListModels, pullModel as ollamaPullModel, ragConvert as ollamaRagConvert } from '../services/ollama';
import BackButton from '../components/BackButton';
import { FaPaperPlane } from 'react-icons/fa';
import { styled } from '@mui/material/styles';
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
    height: '400px',
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

const Analysis: React.FC = () => {
    const [inputCode, setInputCode] = useState('');
    const [outputCode, setOutputCode] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const [models, setModels] = useState<string[]>([]);
    const [selectedModel, setSelectedModel] = useState<string>('');
    const [generating, setGenerating] = useState(false);
    const [ollamaRunning, setOllamaRunning] = useState(false);
    const inputEditorRef = useRef<any>(null);
    const outputEditorRef = useRef<any>(null);
    const [hasAutoExplained, setHasAutoExplained] = useState(false);
    const [chatMessages, setChatMessages] = useState<Array<{ role: string, content: string }>>([]);
    const chatMessagesRef = useRef<HTMLDivElement>(null);
    const [question, setQuestion] = useState('');

    // Auto-scroll chat to bottom
    useEffect(() => {
        if (chatMessagesRef.current) {
            chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
        }
    }, [chatMessages]);

    useEffect(() => {
        (async () => {
            const tags = await ollamaListModels();
            const names = tags.map(m => m.name || m.model).filter(Boolean);
            setModels(names);
            if (!selectedModel) setSelectedModel(names[0] || '');
        })();
    }, []);

    // Handle incoming code from CodeEntry page
    useEffect(() => {
        const state = location.state as { code?: string } | null;
        if (state?.code && !hasAutoExplained) {
            setInputCode(state.code);
            setHasAutoExplained(true);
            // Automatically trigger explanation after a short delay to ensure models are loaded
            setTimeout(() => {
                handleConvert();
            }, 500);
        }
    }, [location.state, hasAutoExplained]);

    const handleConvert = async () => {
        const prompt = inputCode.trim();
        if (!prompt) return;
        try {
            setGenerating(true);
            setOutputCode('# ⚡ Analyzing code... Please wait');

            // Quick health check with timeout
            const healthPromise = ollamaHealth();
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Health check timeout')), 2000)
            );

            const ok = await Promise.race([healthPromise, timeoutPromise]).catch(() => false);
            if (!ok) {
                setOutputCode('// Error: Ollama daemon is not reachable at http://localhost:11434');
                setGenerating(false);
                setChatMessages(prev => [...prev, { role: 'ai', content: 'Error: Ollama daemon is not reachable at http://localhost:11434' }]);
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
                setOutputCode('// Error: No Ollama model available. Please pull a model in Ollama.');
                setGenerating(false);
                setChatMessages(prev => [...prev, { role: 'ai', content: 'Error: No Ollama model available. Please pull a model in Ollama.' }]);
                return;
            }
            setSelectedModel(modelToUse);

            // Show immediate feedback
            setOutputCode(`# ⚡ Analyzing with ${modelToUse}...\n\nGenerating concise explanation. This may take a few seconds.`);

            // Use RAG convert with 'explain' mode
            const response = await ollamaRagConvert(modelToUse, prompt, 'explain');
            console.log('[Analysis] Received response:', response?.substring(0, 100));
            // For explanation, we want the full text response
            const cleanResponse = response.trim() || '// No explanation generated';
            setOutputCode(cleanResponse);

            // Add to chat messages
            setChatMessages(prev => [...prev, { role: 'ai', content: 'Code analysis completed. See the explanation panel for details.' }]);
        } catch (e: any) {
            const errorMessage = `// Error during generation: ${e?.message || String(e)}`;
            setOutputCode(errorMessage);
            setChatMessages(prev => [...prev, { role: 'ai', content: `Error during generation: ${e?.message || String(e)}` }]);
        } finally {
            setGenerating(false);
        }
    };

    const handleAskQuestion = async () => {
        const questionText = question.trim();
        if (!questionText || !inputCode.trim()) return;

        // Add user question to chat
        const newMessages = [...chatMessages, { role: 'user', content: questionText }];
        setChatMessages(newMessages);
        setQuestion('');

        try {
            setGenerating(true);

            // Combine the code with the question
            const combinedPrompt = `Given this code:

${inputCode}

Answer this question: ${questionText}`;

            let names = models;
            if (names.length === 0) {
                const tags = await ollamaListModels();
                names = tags.map(m => m.name || m.model).filter(Boolean);
                setModels(names);
            }
            let modelToUse = selectedModel || names[0] || '';
            if (!modelToUse) {
                setChatMessages(prev => [...prev, { role: 'ai', content: 'Error: No Ollama model available. Please pull a model in Ollama.' }]);
                setGenerating(false);
                return;
            }
            setSelectedModel(modelToUse);

            // Use RAG convert with 'explain' mode
            const response = await ollamaRagConvert(modelToUse, combinedPrompt, 'explain');
            console.log('[Analysis] Received response:', response?.substring(0, 100));

            // Add AI response to chat
            setChatMessages([...newMessages, { role: 'ai', content: response.trim() || 'No response generated.' }]);
        } catch (e: any) {
            setChatMessages([...newMessages, { role: 'ai', content: `Error: ${e?.message || String(e)}` }]);
        } finally {
            setGenerating(false);
        }
    };

    const handleCopyAndOpenMermaid = () => {
        if (outputCode) {
            navigator.clipboard.writeText(outputCode);
            navigate('/mermaid-editor', { state: { mermaidCode: outputCode } });
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
            // Ensure the model is present and ready by pulling it (no generation here)
            await ollamaPullModel(modelToUse);
            setOllamaRunning(true); // Change to green when successfully started
            alert(`Ollama model "${modelToUse}" is now ready for code explanation!`);
        } catch (e: any) {
            // Swallow UI output; errors are not shown in the second editor by request
            // Optionally log for debugging
            console.error('Failed to prepare Ollama model:', e);
            alert(`Failed to prepare Ollama: ${e?.message || String(e)}`);
        } finally {
            setGenerating(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAskQuestion();
        }
    };

    return (
        <Container>
            <Box sx={{ maxWidth: 1300, mx: 'auto', p: 4 }}>
                <Box sx={{ position: 'fixed', top: 16, left: 16, zIndex: 10 }}>
                    <BackButton onClick={() => navigate(-1)} />
                </Box>
                <ThemeSwitch />
                    <Typography variant="h4" align="center" gutterBottom fontWeight={700}>
                Analyze Code
                    </Typography>
                            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                
                <Box sx={{ display: 'flex', gap: 4, mb: 3 }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                                        <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                                Input Programming Code
                            </Typography>
                                                        <Editor
                                height="400px"
                                language="javascript"
                                value={inputCode}
                                onChange={(value) => setInputCode(value || '')}
                                onMount={(editor) => {
                                    inputEditorRef.current = editor;
                                    editor.focus();
// Ensure editor is editable
                                    editor.updateOptions({ readOnly: false });
                                }}
                                theme="vs-dark"
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 15,
                                    lineNumbers: 'on',
                                    readOnly: false,
                                    automaticLayout: true,
                                    scrollBeyondLastLine: false,
                                    wordWrap: 'on',
                                    cursorBlinking: 'smooth',
                                selectOnLineNumbers: true,
                                glyphMargin: true,
                                    folding: true,
                                lineDecorationsWidth: 10,
                                lineNumbersMinChars: 3,
                                }}
                            />
                                            </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                                        <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                                Code Explanation
                            </Typography>
                                                        <Editor
                                height="400px"
                                language="``"
                                value={outputCode}
                                onChange={(value) => setOutputCode(value || '')}
                                onMount={(editor) => {
                                    outputEditorRef.current = editor;
// Ensure editor is editable
                                    editor.updateOptions({ readOnly: false });
                                }}
                                theme="vs-dark"
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 15,
                                    lineNumbers: 'on',
                                    readOnly: false,
                                    automaticLayout: true,
                                    scrollBeyondLastLine: false,
                                    wordWrap: 'on',
                                    cursorBlinking: 'smooth',
                                selectOnLineNumbers: true,
                                glyphMargin: true,
                                    folding: true,
                                lineDecorationsWidth: 10,
                                lineNumbersMinChars: 3,
                            }}
                        />
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Button
                        variant="contained"
color="primary"
                        size="large"
                        onClick={handleConvert}
                        disabled={!inputCode.trim() || generating}
                                                sx={{ minWidth: 260 }}
                    >
                        {generating ? 'Explaining...' : 'Explain Code'}
                    </Button>
                </Box>

                
            </Paper>
        </Box>
    </Container>
  );
};

export default Analysis;