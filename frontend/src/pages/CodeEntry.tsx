import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Typography, Paper, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import Editor from '@monaco-editor/react';
import { useNavigate, useLocation } from 'react-router-dom';
import BackButton from '../components/BackButton';
import { convertCodeToMermaid } from '../services/api';
import { styled } from '@mui/material/styles';
import ThemeSwitch from '../components/ThemeSwitchButton';
import styledComp from 'styled-components';

const Container = styledComp.div<{ theme?: { background: string, text: string } }>`
  background-color: ${props => props.theme?.background || '#f5f7fa'};
  color: ${props => props.theme?.text || '#222'};
  min-height: 100vh;
`;

type LanguageType = 'select' | 'js' | 'ts' | 'python' | 'java' | 'c' | 'cpp' | 'pascal' | 'fortran';

const CodeEntry: React.FC = () => {
    const [inputCode, setInputCode] = useState('');
    const [outputCode, setOutputCode] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState<LanguageType>('select');
    const navigate = useNavigate();
    const location = useLocation();
    const inputEditorRef = useRef<any>(null);
    const outputEditorRef = useRef<any>(null);

    // Handle incoming code from WriteWithAI page
    useEffect(() => {
        const state = location.state as { code?: string } | null;
        if (state?.code) {
            setInputCode(state.code);
        }
    }, [location.state]);

    const getEditorLanguage = (): string => {
        const map: Record<string, string> = {
            js: 'javascript',
            ts: 'typescript',
            python: 'python',
            java: 'java',
            c: 'c',
            cpp: 'cpp',
            pascal: 'pascal',
            fortran: 'fortran'
        };
        return map[selectedLanguage] || 'plaintext';
    };

    const addColorsToMermaid = (mermaidCode: string): string => {
        if (!mermaidCode || mermaidCode.startsWith('//')) return mermaidCode;
        
        // Add style definitions and classDefs for different shapes
        const lines = mermaidCode.split('\n');
        const flowchartLine = lines.findIndex(line => line.trim().startsWith('flowchart') || line.trim().startsWith('graph'));
        
        if (flowchartLine === -1) return mermaidCode;
        
        // Define color styles for different node types
        const styleDefinitions = [
            '    %% Color definitions for different shapes',
            '    classDef startEndClass fill:#e3f2fd,stroke:#1976d2,stroke-width:2px,color:#000',
            '    classDef processClass fill:#fff3e0,stroke:#f57c00,stroke-width:2px,color:#000',
            '    classDef decisionClass fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:#000',
            '    classDef inputOutputClass fill:#e8f5e9,stroke:#388e3c,stroke-width:2px,color:#000',
            ''
        ];
        
        // Insert style definitions after the flowchart declaration
        lines.splice(flowchartLine + 1, 0, ...styleDefinitions);
        
        // Identify and classify nodes based on their shape
        const nodeClasses: { [key: string]: string } = {};
        
        lines.forEach((line, index) => {
            const trimmed = line.trim();
            
            // Start/End nodes (stadium shape [( )])
            const stadiumMatch = trimmed.match(/([A-Z0-9_]+)\[\(([^\)]+)\)\]/);
            if (stadiumMatch) {
                nodeClasses[stadiumMatch[1]] = 'startEndClass';
            }
            
            // Decision nodes (diamond { })
            const diamondMatch = trimmed.match(/([A-Z0-9_]+)\{([^\}]+)\}/);
            if (diamondMatch) {
                nodeClasses[diamondMatch[1]] = 'decisionClass';
            }
            
            // Process nodes (rectangle [ ])
            const rectMatch = trimmed.match(/([A-Z0-9_]+)\[([^\]]+)\]/);
            if (rectMatch && !stadiumMatch) {
                nodeClasses[rectMatch[1]] = 'processClass';
            }
            
            // Input/Output nodes (parallelogram [/ /] or [\ \\])
            const parallelMatch = trimmed.match(/([A-Z0-9_]+)\[\/([^\/]+)\/\]|([A-Z0-9_]+)\[\\\\([^\\]+)\\\\\]/);
            if (parallelMatch) {
                nodeClasses[parallelMatch[1] || parallelMatch[3]] = 'inputOutputClass';
            }
        });
        
        // Add class assignments at the end
        const classAssignments: string[] = [];
        Object.entries(nodeClasses).forEach(([nodeId, className]) => {
            classAssignments.push(`    class ${nodeId} ${className}`);
        });
        
        if (classAssignments.length > 0) {
            lines.push('', '    %% Apply styles to nodes', ...classAssignments);
        }
        
        return lines.join('\n');
    };

    const handleConvert = async () => {
        const code = inputCode.trim();
        if (!code) return;
        
        // Check if a language is selected
        if (selectedLanguage === 'select') {
            setOutputCode('// Error: Please select a language before converting');
            return;
        }
        
        try {
            // Directly convert using the user-selected language, without cross-verification
            setOutputCode('// Converting to Mermaid...');
            const mermaid = await convertCodeToMermaid(code, selectedLanguage as any);
            setOutputCode(mermaid || '');
        } catch (e: any) {
            setOutputCode(`// Error: ${e?.message || String(e)}`);
        }
    };

    const handleExplainCode = () => {
        if (inputCode.trim()) {
            navigate('/analysis', { state: { code: inputCode } });
        }
    };

    const handleCopyAndOpenMermaid = () => {
        if (outputCode) {
            // Add colors only when rendering the diagram
            const coloredMermaid = addColorsToMermaid(outputCode);
            navigator.clipboard.writeText(outputCode);
            navigate('/mermaid-editor', { state: { mermaidCode: coloredMermaid } });
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
                Code to Mermaid Flow Code Converter
            </Typography>
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', gap: 4, mb: 3 }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle1" fontWeight={600}>
                                Input Programming Code
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <FormControl sx={{ minWidth: 120 }} size="small">
                                    <InputLabel>Language</InputLabel>
                                    <Select
                                        value={selectedLanguage}
                                        label="Language"
                                        onChange={(e) => setSelectedLanguage(e.target.value as LanguageType)}
                                    >
                                        <MenuItem value="select">Select a language</MenuItem>
                                        <MenuItem value="js">JavaScript</MenuItem>
                                        <MenuItem value="ts">TypeScript</MenuItem>
                                        <MenuItem value="python">Python</MenuItem>
                                        <MenuItem value="java">Java</MenuItem>
                                        <MenuItem value="c">C</MenuItem>
                                        <MenuItem value="cpp">C++</MenuItem>
                                        <MenuItem value="pascal">Pascal</MenuItem>
                                        <MenuItem value="fortran">Fortran</MenuItem>
                                    </Select>
                                </FormControl>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => {
                                        const input = document.createElement('input');
                                        input.type = 'file';
                                        input.accept = '.js,.ts,.jsx,.tsx,.py,.java,.cpp,.c,.cs,.php,.rb,.go,.rs,.kt,.swift,.pas,.f,.f90,.f95';
                                        input.onchange = (e) => {
                                            const file = (e.target as HTMLInputElement).files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onload = (e) => {
                                                    setInputCode(e.target?.result as string || '');
                                                };
                                                reader.readAsText(file);
                                            }
                                        };
                                        input.click();
                                    }}
                                >
                                    Import
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => navigate('/write-with-ai')}
                                >
                                    AI
                                </Button>
                            </Box>
                        </Box>
                        <Editor
                            height="400px"
                            language={getEditorLanguage()}
                            value={inputCode}
                            onChange={(value) => setInputCode(value || '')}
                            onMount={(editor) => { inputEditorRef.current = editor; editor.focus(); }}
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
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
                            <Button
                                variant="contained"
                                color="primary"
                                size="large"
                                onClick={handleConvert}
                                disabled={!inputCode.trim()}
                                sx={{ minWidth: 200 }}
                            >
                                Convert
                            </Button>
                            <Button
                                variant="contained"
                                color="secondary"
                                size="large"
                                onClick={handleExplainCode}
                                disabled={!inputCode.trim()}
                                sx={{ minWidth: 200 }}
                            >
                                Explain Code
                            </Button>
                        </Box>
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                            Generated Mermaid Flow Code
                        </Typography>
                        <Editor
                            height="400px"
                            language="mermaid"
                            value={outputCode}
                            onChange={(value) => setOutputCode(value || '')}
                            onMount={(editor) => { outputEditorRef.current = editor; }}
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
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                            <Button
                                variant="contained"
                                color="secondary"
                                size="large"
                                onClick={handleCopyAndOpenMermaid}
                                disabled={!outputCode.trim()}
                                sx={{ minWidth: 260 }}
                            >
                                Render Diagram
                            </Button>
                        </Box>
                    </Box>
                </Box>
            
            </Paper>
        </Box>
    </Container>
  );
};

export default CodeEntry;