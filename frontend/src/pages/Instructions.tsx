import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowRight, FiCode, FiFileText, FiZap } from 'react-icons/fi';
import styles from '../styles/Welcome.module.css';
import ThemeSwitch from '../components/ThemeSwitchButton';
import styledComp from 'styled-components';

const Container = styledComp.div<{ theme?: { background: string, text: string } }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: ${props => props.theme?.background || '#f3f4f6'};
  padding: 1rem;
  color: ${props => props.theme?.text || '#222'};
`;

const Title = styledComp.h1<{ theme?: { text: string } }>`
  font-size: 2.5rem;
  font-weight: bold;
  color: ${props => props.theme?.text || '#1f2937'};
  margin-bottom: 1rem;
`;

const Subtitle = styledComp.p<{ theme?: { text: string } }>`
  font-size: 1.5rem;
  color: ${props => props.theme?.text || '#4b5563'};
  margin-bottom: 2rem;
  text-align: center;
`;

const Instructions: React.FC = () => {
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate('/code-entry');
  };

  return (
    <Container>
      <ThemeSwitch />
      <header className={styles.header}>
        <Title>How to Use This Tool</Title>
        <Subtitle>
          Follow these simple steps to convert your code into beautiful flowcharts
        </Subtitle>
      </header>

      <section style={{ maxWidth: 800, margin: '32px auto', padding: '0 16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {/* Step 1 */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div style={{ 
              background: 'rgba(0, 122, 204, 0.2)', 
              border: '1px solid rgba(0, 122, 204, 0.3)',
              width: 40, 
              height: 40, 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <span style={{ fontWeight: 'bold', color: '#007acc' }}>1</span>
            </div>
            <div>
              <h3 style={{ margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiCode />
                Enter Your Code
              </h3>
              <p style={{ margin: 0, opacity: 0.8, lineHeight: 1.5 }}>
                Paste your source code into the editor or import a file. 
                Supported languages include JavaScript, TypeScript, Python, Java, C/C++, Pascal, and Fortran.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div style={{ 
              background: 'rgba(0, 122, 204, 0.2)', 
              border: '1px solid rgba(0, 122, 204, 0.3)',
              width: 40, 
              height: 40, 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <span style={{ fontWeight: 'bold', color: '#007acc' }}>2</span>
            </div>
            <div>
              <h3 style={{ margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiFileText />
                Select Language & Convert
              </h3>
              <p style={{ margin: 0, opacity: 0.8, lineHeight: 1.5 }}>
                Choose the correct programming language from the dropdown. 
                The tool will validate your selection against the code and generate a Mermaid flowchart.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div style={{ 
              background: 'rgba(0, 122, 204, 0.2)', 
              border: '1px solid rgba(0, 122, 204, 0.3)',
              width: 40, 
              height: 40, 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <span style={{ fontWeight: 'bold', color: '#007acc' }}>3</span>
            </div>
            <div>
              <h3 style={{ margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiZap />
                Render & Export
              </h3>
              <p style={{ margin: 0, opacity: 0.8, lineHeight: 1.5 }}>
                Click "Render Diagram" to visualize your flowchart. 
                You can then copy the Mermaid code or export as SVG, PNG, JPG, or PDF.
              </p>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <button onClick={handleContinue} className={styles.button}>
            Continue to Code Editor
            <FiArrowRight style={{ marginLeft: 8 }} />
          </button>
        </div>
      </section>

      <section style={{ 
        maxWidth: 800, 
        margin: '48px auto 0', 
        padding: '24px 16px', 
        background: 'rgba(255,255,255,0.06)', 
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12
      }}>
        <h3 style={{ margin: '0 0 16px 0', textAlign: 'center' }}>Tips for Best Results</h3>
        <ul style={{ 
          textAlign: 'left', 
          maxWidth: 600, 
          margin: '0 auto',
          padding: '0 16px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 16
        }}>
          <li style={{ lineHeight: 1.5 }}>Ensure your code is syntactically correct</li>
          <li style={{ lineHeight: 1.5 }}>Use clear, descriptive function and variable names</li>
          <li style={{ lineHeight: 1.5 }}>Break complex logic into smaller functions</li>
          <li style={{ lineHeight: 1.5 }}>Comment your code for better understanding</li>
        </ul>
      </section>
    </Container>
  );
};

export default Instructions;