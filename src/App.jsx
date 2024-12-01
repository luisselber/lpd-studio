import { Box } from "@chakra-ui/react";
import CodeEditor from "./pages/CodeEditor";
import CodeViewer from "./pages/VirtualMachine";
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <Box minH="100vh" bg="#0f0a19" color="gray.500" px={6} py={8}>
      <Routes>
        <Route path="/" element={<CodeEditor />} />
        <Route path="/vm" element={<CodeViewer />} />
      </Routes>
    </Box>
  );
}

export default App;