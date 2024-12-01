# LPD Compiler & Virtual Machine

An in-browser development environment for the LPD (Linguagem de Programação Didática) language. This project provides a complete environment for writing, compiling, and executing LPD programs directly in your browser.

## Features

- **Code Editor**
  - Syntax highlighting for LPD language
  - Line numbers and code folding
  - Error highlighting
  - Drag and drop file support
  - File import/export capabilities

- **Compiler**
  - Real-time compilation
  - Detailed error messages
  - Generation of intermediate code (.obj files)

- **Virtual Machine**
  - Execution of compiled LPD programs
  - Interactive input/output operations
  - Runtime error handling
  - Execution state visualization

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (version 14 or higher)
- npm (usually comes with Node.js)

## Installation

1. Navigate to the project directory:
```bash
cd lpd-compiler
```

2. Install dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd backend
npm install
```

## Running the Application

1. Start the backend server:
```bash
cd backend
node server.js
```

2. In a new terminal, start the frontend development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## Usage

1. Write your LPD code in the editor or load an existing .lpd file
2. Press "Compilar" to compile your code
3. If compilation is successful, your code will be automatically saved into your device
4. Open the virtual machine page and press "Executar" to run your program
5. Follow any prompts for input and check the output terminal for results

## Keyboard Shortcuts

- `F5`: Execute code
- `Ctrl+Alt+N`: New file
- `Cmd+Alt+O`: Open file
- `Cmd+Alt+S`: Save file
- `Cmd+K`: Clear output
- `Ctrl+Alt+H`: Open documentation

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Original LPD language design by [Author]
- Virtual Machine implementation based on [Reference]
- Built with React, Vite, and Chakra UI
