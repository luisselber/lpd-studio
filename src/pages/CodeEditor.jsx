import { useRef, useState, useEffect } from "react";
import {
  Box,
  Text,
  HStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuItemOption,
  MenuGroup,
  MenuOptionGroup,
  MenuDivider,
  Icon,
  Button,
  useToast,
} from "@chakra-ui/react";
import { Editor } from "@monaco-editor/react";
import { CODE_SNIPPETS } from "../constants";
import Output from "../components/code_editor/Output";
import { FiUpload, FiDownload, FiFilePlus } from "react-icons/fi";
import { LuFile, LuFilePlus, LuFolder, LuFolderOpen, LuDownload, LuHelpCircle } from "react-icons/lu";
import { useHotkeys } from 'react-hotkeys-hook';

const CodeEditor = () => {
  const editorRef = useRef();
  const fileInputRef = useRef();
  const [value, setValue] = useState("");
  const [language] = useState("lpd");
  const [isDragging, setIsDragging] = useState(false);
  const toast = useToast();

  // Add keyboard shortcuts
  useHotkeys('mod+alt+s', () => handleFileExport())
  useHotkeys('ctrl+alt+n', () => handleNewFile())
  useHotkeys('mod+alt+o', () => fileInputRef.current.click())
  useHotkeys('ctrl+alt+h', () => {
    window.open('https://rowan-marquis-824.notion.site/Documenta-o-137ef3e8a9d6807291ecc0709e900272?pvs=4', '_blank');
  });

  const onMount = (editor, monaco) => {
    editorRef.current = editor;
    editor.focus();

    monaco.languages.register({ id: "lpd" });

    let keywords = [
      "e",
      "inicio",
      "booleano",
      "div",
      "faca",
      "senao",
      "fim",
      "falso",
      "funcao",
      "se",
      "inteiro",
      "nao",
      "ou",
      "procedimento",
      "programa",
      "leia",
      "entao",
      "verdadeiro",
      "var",
      "enquanto",
      "escreva",
    ];

    let operators = ["=", "<", ">", "<=", ">=", "!=", "*", "div", "+", "-"];

    monaco.languages.setMonarchTokensProvider("lpd", {
      keywords: keywords,
      operators: operators,
      symbols: /[=><!~?:&|+\-*/^%]+/,
      tokenizer: {
        root: [
          // Identifiers and keywords
          [
            /[a-zA-Z_]\w*/,
            {
              cases: {
                "@keywords": "keyword",
                "@default": "identifier",
              },
            },
          ],

          // Whitespace
          { include: "@whitespace" },

          // Comments
          [/{/, "comment", "@comment"],

          // Strings
          [/"/, "string", "@string"],

          // Operators and symbols
          [/[()]/, "@brackets"],
          [
            /@symbols/,
            {
              cases: {
                "@operators": "operator",
                "@default": "",
              },
            },
          ],

          // Numbers
          [/\d+\.\d+/, "number.float"],
          [/\d+/, "number"],
        ],

        comment: [
          [/[^{}]+/, "comment"],
          [/}/, "comment", "@pop"],
          [/{/, "comment"], // Nested comments not supported
          [/./, "comment"],
        ],

        string: [
          [/[^"]+/, "string"],
          [/"/, "string", "@pop"],
          [/"/, "string"],
        ],

        whitespace: [[/\s+/, "white"]],
      },
    });

    // Language configuration for auto-closing brackets and comments
    monaco.languages.setLanguageConfiguration("lpd", {
      comments: {
        blockComment: ["{", "}"],
      },
      brackets: [["(", ")"]],
      autoClosingPairs: [
        { open: "{", close: "}" },
        { open: "(", close: ")" },
        { open: '"', close: '"' },
      ],
    });

    monaco.languages.registerCompletionItemProvider("lpd", {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        // Define keywords and operators for auto-completion
        const suggestions = [
          // Keywords
          ...keywords.map((keyword) => ({
            label: keyword,
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: keyword,
            range: range,
          })),

          // Operators
          ...operators.map((operator) => ({
            label: operator,
            kind: monaco.languages.CompletionItemKind.Operator,
            insertText: operator,
            range: range,
          })),
        ];

        return { suggestions: suggestions };
      },
    });
  };

  // File input handler
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.name.endsWith(".txt")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        setValue(content);
        if (editorRef.current) {
          editorRef.current.setValue(content);
        }
        // Reset the file input's value to allow re-uploading the same file
        event.target.value = null;
      };
      reader.readAsText(file);
    } else {
      toast({
        title: "Tipo de arquivo inválido.",
        description: "Por favor, selecione um arquivo .txt válido.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      // Reset the file input's value in case of an invalid file
      event.target.value = null;
    }
  };

  // File export handler
  const handleFileExport = () => {
    const content = editorRef.current ? editorRef.current.getValue() : '';
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'lpd_code.txt';
    document.body.appendChild(link); // Append link to body
    link.click();
    document.body.removeChild(link); // Remove link after download
    URL.revokeObjectURL(link.href);
  };

  // New file handler
  const handleNewFile = () => {
    setValue("");
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
    if (file && file.name.endsWith(".txt")) {
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
        title: "Tipo de arquivo inválido.",
        description: "Por favor, solte um arquivo .txt válido.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box>
      <HStack spacing={4}>
        <Box w="50%" position="relative">
          {/* Title */}
          <Text mb={2} fontSize="lg">
            Editor
          </Text>
          {/* Toolbar */}
          <HStack mb={2} justifyContent="flex-start" alignItems="center">
            {/* Arquivo Menu */}
            <Menu>
              <MenuButton as={Button} rightIcon={<LuFile />}>
                Arquivo
              </MenuButton>
              <MenuList>
                {/* Hidden File Input */}
                <input
                  type="file"
                  accept=".txt"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleFileUpload}
                />
                <MenuItem
                  icon={<LuFilePlus />}
                  command="^⌥N"
                  onClick={handleNewFile}
                >
                  Novo Arquivo
                </MenuItem>
                <MenuItem
                  icon={<LuFolderOpen />}
                  command="⌘⌥O"
                  onClick={() => fileInputRef.current.click()}
                >
                  Abrir...
                </MenuItem>
                <MenuItem
                  icon={<LuDownload />}
                  command="⌘⌥S"
                  onClick={handleFileExport}
                >
                  Salvar
                </MenuItem>
                <MenuItem
                  icon={<LuHelpCircle />}
                  command="⌘⌥H"
                  as="a"
                  href="https://rowan-marquis-824.notion.site/Documenta-o-137ef3e8a9d6807291ecc0709e900272?pvs=4"
                  target="_blank"
                >
                  Ajuda
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>

          {/* Editor with Drag-and-Drop */}
          <Box
            position="relative"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Editor
              options={{
                minimap: {
                  enabled: false,
                },
              }}
              height="75vh"
              theme="vs-dark"
              language={language}
              defaultValue={CODE_SNIPPETS[language]}
              value={value}
              onMount={onMount}
              onChange={(value) => setValue(value)}
            />
            {/* Optional visual feedback for drag-and-drop */}
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
        <Output editorRef={editorRef} language={language} />
      </HStack>
    </Box>
  );
};


export default CodeEditor;