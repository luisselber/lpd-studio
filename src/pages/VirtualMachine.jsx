import { useRef, useState, useEffect } from "react";
import {
  Box,
  Text,
  HStack,
  VStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Icon,
  Button,
  useToast,
} from "@chakra-ui/react";
import { Editor } from "@monaco-editor/react";
import CodeInsights from "../components/vm/CodeInsights";
import { FiUpload } from "react-icons/fi";
import { LuFile, LuFilePlus, LuFolderOpen, LuDownload, LuHelpCircle } from "react-icons/lu";
import { IoPlayOutline } from "react-icons/io5";
import { useHotkeys } from 'react-hotkeys-hook';
import { VirtualMachine } from "../../virtual_machine/VirtualMachine.js";

// import OutputTerminal from "../components/vm/OutputTerminal";

const CodeViewer = () => {
  const editorRef = useRef();
  const fileInputRef = useRef();
  const [value, setValue] = useState("");
  const [outputContent, setOutputContent] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const toast = useToast();

  // Add keyboard shortcuts
  useHotkeys('mod+alt+s', () => handleFileExport());
  useHotkeys('ctrl+alt+n', () => handleNewFile());
  useHotkeys('mod+alt+o', () => fileInputRef.current.click());
  useHotkeys('f5', () => handleExecute());
  useHotkeys('ctrl+alt+h', () => {
    window.open('https://rowan-marquis-824.notion.site/Documenta-o-137ef3e8a9d6807291ecc0709e900272?pvs=4', '_blank');
  });

  const handleExecute = async () => {
    const sourceCode = editorRef.current?.getValue();
    if (!sourceCode) {
      toast({
        title: 'Nenhum código para executar',
        description: 'Por favor carregue algum código .obj antes de executar.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsExecuting(true);
      setOutputContent(""); // Clear previous output

      const vm = new VirtualMachine();
      const result = await vm.executeInstructions(sourceCode);

      if (result.success) {
        setOutputContent(result.output || "Program executed successfully with no output.");
      } else {
        setOutputContent(`Error: ${result.error}\n${result.output}`);
        toast({
          title: 'Execution Error',
          description: result.error,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Execution error:', error);
      setOutputContent(`Failed to execute code: ${error.message}`);
      toast({
        title: 'Execution Failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsExecuting(false);
    }
  };

  // File input handler
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.name.endsWith(".obj")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        setValue(content);
        if (editorRef.current) {
          editorRef.current.setValue(content);
        }
        event.target.value = null;
      };
      reader.readAsText(file);
    } else {
      toast({
        title: "Tipo de arquivo inválido.",
        description: "Por favor, selecione um arquivo .obj válido.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      event.target.value = null;
    }
  };

  // File export handler
  const handleFileExport = () => {
    const content = editorRef.current ? editorRef.current.getValue() : '';
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'code.obj';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  // New file handler
  const handleNewFile = () => {
    setValue("");
    setOutputContent("");
    if (editorRef.current) {
      editorRef.current.setValue("");
    }
  };

  // Drag-and-drop handlers
  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const file = event.dataTransfer.files[0];
    if (file && file.name.endsWith(".obj")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        setValue(content);
        if (editorRef.current) {
          editorRef.current.setValue(content);
        }
      };
      reader.readAsText(file);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please drop a valid .obj file.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const onMount = (editor, monaco) => {
    editorRef.current = editor;
    editor.focus();

    monaco.languages.register({ id: "asm_didatico" });

    const keywords = [
      "LDC", "LDV", "ADD", "SUB", "MULT", "DIVI", "INV", "AND", "OR", 
      "NEG", "CME", "CMA", "CEQ", "CDIF", "CMEQ", "CMAQ", "STR", "JMP", 
      "JMPF", "RD", "PRN", "START", "ALLOC", "DALLOC", "HLT", "CALL", "RETURN"
    ];

    monaco.languages.setMonarchTokensProvider("asm_didatico", {
      keywords,
      symbols: /[=><!~?:&|+\-*/^%]+/,
      tokenizer: {
        root: [
          [/[a-zA-Z_]\w*/, { cases: { '@keywords': 'keyword', '@default': 'identifier' } }],
          { include: "@whitespace" },
          [/[()]/, "@brackets"],
          [/@symbols/, { cases: { '@default': "" } }],
          [/\d+/, "number"],
        ],
        whitespace: [[/\s+/, "white"]],
      },
    });
  };

  return (
    <HStack spacing={4} height="100%" alignItems="stretch">
      <Box flex="1">
        <VStack height="100%" spacing={4}>
          {/* Code Editor Section */}
          <Box width="100%" height="100%" borderWidth={1} borderColor="gray.600" borderRadius="md">
            <Box p={4}>
              <HStack justifyContent="space-between" alignItems="center">
                <Text fontSize="lg">Código Intermediário</Text>
                <HStack spacing={4}>
                  <HStack spacing={2} alignItems="center">
                    <Text fontSize="sm" color="gray.500">
                      {value.length} bytes
                    </Text>
                    <Box borderRadius="50%" backgroundColor="gray.300" width="4px" height="4px" />
                    <Text fontSize="sm" color="gray.500">
                      {value.split('\n').length} linhas
                    </Text>
                  </HStack>
                  <Button 
                    leftIcon={<IoPlayOutline />} 
                    variant="solid" 
                    size='sm'
                    onClick={handleExecute}
                    isLoading={isExecuting}
                  >
                    Executar
                  </Button>
                </HStack>
              </HStack>
            </Box>

            <Box
              position="relative"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              height="calc(100% - 64px)"
            >
              <Editor
                options={{
                  minimap: { enabled: false },
                  readOnly: true,
                }}
                height="100%"
                theme="vs-dark"
                language="asm_didatico"
                value={value}
                onMount={onMount}
                onChange={(newValue) => setValue(newValue)}
              />
              {isDragging && (
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  bottom={0}
                  backgroundColor="rgba(49, 130, 206, 0.1)"
                  zIndex={10}
                />
              )}
            </Box>
          </Box>

          {/* Terminal Section */}
          {/* <Box width="100%" height="40%" borderWidth={1} borderColor="gray.600" borderRadius="md">
            <OutputTerminal content={outputContent} />
          </Box> */}
        </VStack>
      </Box>

      {/* Code Insights Panel */}
      <Box width="30%" height="100%">
        <CodeInsights editorRef={editorRef} language="asm_didatico" />
      </Box>
    </HStack>
  );
};

export default CodeViewer;