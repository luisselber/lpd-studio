import { useState } from 'react';
import {
  Box,
  Button,
  Text,
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { executeCode } from '../../api';
import { LuCode2, LuFileDigit, LuFileTerminal } from "react-icons/lu";
import { GrClearOption, GrVirtualMachine } from "react-icons/gr";
import { useHotkeys } from 'react-hotkeys-hook';
import { useNavigate } from 'react-router-dom';

const Output = ({ editorRef }) => {
  const toast = useToast();
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Add keyboard shortcuts
  useHotkeys('f5', () => runCode());
  useHotkeys('mod+k', () => handleClearOutput());
  useHotkeys('f7', () => navigate('/vm'));

  const downloadObjFile = (content) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'program.obj';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const runCode = async () => {
    const sourceCode = editorRef.current.getValue();
    if (!sourceCode) {
      toast({
        title: 'Nenhum código para compilar.',
        description: 'Por favor, forneça algum código antes de compilar.',
        status: 'warning',
        duration: 4000,
        isClosable: true,
      });
      return;
    }
    try {
      setIsLoading(true);
      const result = await executeCode(sourceCode);
      const combinedOutput = (result.output || '') + (result.error || '');
      setOutput(combinedOutput || 'Compilation completed with no output.');

      // If compilation was successful and we have obj file content, download it
      if (result.objFile && !result.error) {
        downloadObjFile(result.objFile);
        toast({
          title: 'Código compilado com sucesso',
          description: 'Código intermediário (program.obj) instalado com sucesso',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error executing code:', error);
      toast({
        title: 'An error occurred.',
        description: 'Unable to run code.',
        status: 'error',
        duration: 6000,
        isClosable: true,
      });
      setOutput('Failed to execute code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLineClick = (lineNumber) => {
    if (editorRef.current && lineNumber) {
      const editor = editorRef.current;
      editor.revealLineInCenter(lineNumber);
      editor.setPosition({ lineNumber: lineNumber, column: 1 });
      editor.focus();
    }
  };

  const handleClearOutput = () => {
    setOutput('');
  };

  const renderOutput = () => {
    if (!output) {
      return 'Pressione "Compilar" para ver o output aqui';
    }

    const lines = output.split('\n');
    return lines.map((line, index) => {
      const errorRegex = /ERRO: (.*?) -- linha: (\d+)/;
      const match = line.match(errorRegex);

      if (match) {
        const errorMessage = match[1];
        const lineNumber = parseInt(match[2], 10);

        return (
          <Text key={index} color="red.500">
            ERRO: {errorMessage} --{' '}
            <Text
              as="span"
              color="blue.500"
              cursor="pointer"
              textDecoration="underline"
              onClick={() => handleLineClick(lineNumber)}
            >
              linha: {lineNumber}
            </Text>
          </Text>
        );
      } else {
        return <Text key={index}>{line}</Text>;
      }
    });
  };

  return (
    <Box w="50%">
      <Text mb={2} fontSize="lg">
        Output
      </Text>
      <Menu>
        <MenuButton as={Button} rightIcon={<LuCode2 />} mb={2} isLoading={isLoading}>
          Compilação
        </MenuButton>
        <MenuList>
          <MenuItem icon={<LuFileDigit />} command='F5' onClick={runCode}>Compilar</MenuItem>
          <MenuItem icon={<GrClearOption />} onClick={handleClearOutput} command='⌘K'>Limpar Output</MenuItem>
          <MenuItem icon={<GrVirtualMachine />} onClick={() => navigate("/vm")} command='F7'>Máquina Virtual</MenuItem>
        </MenuList>
      </Menu>
      <Box
        height="75vh"
        p={2}
        border="1px solid"
        borderRadius={4}
        borderColor="#333"
        overflowY="auto"
      >
        {renderOutput()}
      </Box>
    </Box>
  );
};

export default Output;