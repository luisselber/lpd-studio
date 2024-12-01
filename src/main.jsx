import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "./theme.js";
import { BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <ChakraProvider theme={theme}>
        <BrowserRouter>
          <App /> 
        </BrowserRouter>
      </ChakraProvider>
    </React.StrictMode>
);
