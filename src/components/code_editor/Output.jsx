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

  // Keyboard shortcuts
  useHotkeys('f5', () => runCode());
  useHotkeys('mod+k', () => handleClearOutput());
  useHotkeys('f7', () => navigate('/vm'));

  const downloadObjFile = (content, filename = 'program.obj') => {
    try {
      // Create blob with proper encoding
      const blob = new Blob([content], { 
        type: 'text/plain;charset=utf-8'
      });
      
      // Create object URL
      const url = window.URL.createObjectURL(blob);
      
      // Create temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      
      // Append to document, trigger click, and clean up
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: 'Erro ao baixar arquivo',
        description: 'Não foi possível baixar o arquivo objeto.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const runCode = async () => {
    const sourceCode = editorRef.current?.getValue();
    
    if (!sourceCode?.trim()) {
      toast({
        title: 'Nenhum código para compilar',
        description: 'Por favor, forneça algum código antes de compilar.',
        status: 'warning',
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await executeCode(sourceCode);
      const combinedOutput = [result.output, result.error]
        .filter(Boolean)
        .join('\n');
      
      setOutput(combinedOutput || 'Compilação concluída sem output.');

      // Handle successful compilation with object file
      if (result.success && result.objFile) {
        downloadObjFile(result.objFile);
        toast({
          title: 'Código compilado com sucesso',
          description: 'Código intermediário (program.obj) baixado com sucesso',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error executing code:', error);
      toast({
        title: 'Erro na execução',
        description: 'Não foi possível executar o código.',
        status: 'error',
        duration: 6000,
        isClosable: true,
      });
      setOutput('Falha ao executar o código.');
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

    return output.split('\n').map((line, index) => {
      const errorMatch = line.match(/ERRO: (.*?) -- linha: (\d+)/);

      if (errorMatch) {
        const [, errorMessage, lineNumber] = errorMatch;
        return (
          <Text key={index} color="red.500">
            ERRO: {errorMessage} --{' '}
            <Text
              as="span"
              color="blue.500"
              cursor="pointer"
              textDecoration="underline"
              onClick={() => handleLineClick(parseInt(lineNumber, 10))}
            >
              linha: {lineNumber}
            </Text>
          </Text>
        );
      }
      return <Text key={index}>{line}</Text>;
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
          <MenuItem icon={<LuFileDigit />} command='F5' onClick={runCode}>
            Compilar
          </MenuItem>
          <MenuItem icon={<GrClearOption />} onClick={handleClearOutput} command='⌘K'>
            Limpar Output
          </MenuItem>
          <MenuItem icon={<GrVirtualMachine />} onClick={() => navigate("/vm")} command='F7'>
            Máquina Virtual
          </MenuItem>
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