const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { spawn } = require('child_process');
const fs = require('fs');
const tmp = require('tmp');
const path = require('path');

const app = express();
app.use(bodyParser.json({ limit: '10mb' }));
app.use(cors());

app.post('/compile', (req, res) => {
  const sourceCode = req.body.code;

  if (!sourceCode) {
    return res.status(400).json({ error: 'No source code provided.' });
  }

  // Write the source code to a temporary file
  const tempFile = tmp.fileSync({ postfix: '.lpd' });
  fs.writeFileSync(tempFile.name, sourceCode);

  // Path to your compiler executable
  const compilerExecutable = '../compiler/compiler'; 

  // Spawn the compiler process
  const compilerProcess = spawn(compilerExecutable, [tempFile.name]);

  let compilerOutput = '';
  let compilerError = '';

  compilerProcess.stdout.on('data', (data) => {
    compilerOutput += data.toString();
  });

  compilerProcess.stderr.on('data', (data) => {
    compilerError += data.toString();
  });

  compilerProcess.on('close', (code) => {
    const hasErrors = compilerOutput.includes('ERRO:');
    let objContent = null;

    // Only try to read program.obj if there are no compilation errors
    if (!hasErrors) {
      const objPath = path.join(__dirname, 'program.obj');
      if (fs.existsSync(objPath)) {
        try {
          objContent = fs.readFileSync(objPath, 'utf8');
          fs.unlinkSync(objPath); // Clean up the object file
        } catch (err) {
          console.error('Error handling program.obj:', err);
        }
      }
    }

    // Clean up the temporary file
    tempFile.removeCallback();

    // Send the response back to the frontend
    res.json({
      success: !hasErrors,
      output: compilerOutput,
      error: compilerError,
      exitCode: code,
      objFile: objContent,
      hasErrors
    });
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Compiler server is running on port ${PORT}`);
});

// import express from 'express';
// import bodyParser from 'body-parser';
// import cors from 'cors';
// import { spawn } from 'child_process';
// import fs from 'fs/promises';
// import tmp from 'tmp-promise';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import { dirname } from 'path';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// const app = express();

// // Middleware
// app.use(bodyParser.json({ limit: '10mb' }));
// app.use(cors());

// app.post('/compile', async (req, res) => {
//   const { code } = req.body;

//   if (!code) {
//     return res.status(400).json({ error: 'No source code provided.' });
//   }

//   let tempFile;
//   try {
//     // Create temporary file with cleanup
//     tempFile = await tmp.file({ postfix: '.lpd' });
//     await fs.writeFile(tempFile.path, code);

//     // Spawn compiler process
//     const compilerProcess = spawn('../compiler/compiler', [tempFile.path]);

//     let compilerOutput = '';
//     let compilerError = '';

//     compilerProcess.stdout.on('data', (data) => {
//       compilerOutput += data.toString();
//     });

//     compilerProcess.stderr.on('data', (data) => {
//       compilerError += data.toString();
//     });

//     // Handle process completion
//     const exitCode = await new Promise((resolve) => {
//       compilerProcess.on('close', resolve);
//     });

//     // Check for compilation errors
//     const hasErrors = compilerOutput.includes('ERRO:');

//     // Read object file if compilation was successful
//     let objContent = null;
//     if (!hasErrors) {
//       const objPath = path.join(__dirname, 'program.obj');
//       try {
//         objContent = await fs.readFile(objPath, 'utf8');
//         await fs.unlink(objPath); // Clean up object file
//       } catch (err) {
//         console.error('Error handling program.obj:', err);
//       }
//     }

//     // Send response
//     res.json({
//       success: !hasErrors,
//       output: compilerOutput,
//       error: compilerError,
//       exitCode,
//       objFile: objContent,
//       hasErrors
//     });

//   } catch (error) {
//     console.error('Compilation error:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Internal server error during compilation'
//     });
//   } finally {
//     // Clean up temporary file
//     if (tempFile) {
//       await tempFile.cleanup();
//     }
//   }
// });

// const PORT = process.env.PORT || 3001;

// // Improved error handling for server
// const server = app.listen(PORT, () => {
//   console.log(`Compiler server is running on port ${PORT}`);
// });

// server.on('error', (error) => {
//   console.error('Server error:', error);
//   process.exit(1);
// });

// process.on('unhandledRejection', (reason, promise) => {
//   console.error('Unhandled Rejection at:', promise, 'reason:', reason);
//   process.exit(1);
// });

// const express = require('express');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const { spawn } = require('child_process');
// const fs = require('fs');
// const tmp = require('tmp');

// const app = express();
// app.use(bodyParser.json({ limit: '10mb' }));
// app.use(cors());

// app.post('/compile', (req, res) => {
//   const sourceCode = req.body.code;

//   if (!sourceCode) {
//     return res.status(400).json({ error: 'No source code provided.' });
//   }

//   // Write the source code to a temporary file
//   const tempFile = tmp.fileSync({ postfix: '.lpd' });
//   fs.writeFileSync(tempFile.name, sourceCode);

//   // Path to your compiler executable
//   const compilerExecutable = '../compiler/compiler'; // Update this path

//   // Spawn the compiler process
//   const compilerProcess = spawn(compilerExecutable, [tempFile.name]);

//   let compilerOutput = '';
//   let compilerError = '';

//   compilerProcess.stdout.on('data', (data) => {
//     compilerOutput += data.toString();
//   });

//   compilerProcess.stderr.on('data', (data) => {
//     compilerError += data.toString();
//   });

//   compilerProcess.on('close', (code) => {
//     // Clean up the temporary file
//     tempFile.removeCallback();

//     // Send the compiler output back to the frontend
//     res.json({
//       output: compilerOutput,
//       error: compilerError,
//       exitCode: code,
//     });
//   });
// });

// const PORT = process.env.PORT || 3001;
// app.listen(PORT, () => {
//   console.log(`Compiler server is running on port ${PORT}`);
// });

// // server.js
// const express = require('express');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const { spawn } = require('child_process');
// const fs = require('fs');
// const tmp = require('tmp');
// const path = require('path');

// const app = express();
// app.use(bodyParser.json({ limit: '10mb' }));
// app.use(cors());

// app.post('/compile', (req, res) => {
//   const sourceCode = req.body.code;

//   if (!sourceCode) {
//     return res.status(400).json({ error: 'No source code provided.' });
//   }

//   const tempFile = tmp.fileSync({ postfix: '.lpd' });
//   fs.writeFileSync(tempFile.name, sourceCode);

//   const compilerExecutable = '../compiler/compiler';
//   const compilerProcess = spawn(compilerExecutable, [tempFile.name]);

//   let compilerOutput = '';
//   let compilerError = '';

//   compilerProcess.stdout.on('data', (data) => {
//     compilerOutput += data.toString();
//   });

//   compilerProcess.stderr.on('data', (data) => {
//     compilerError += data.toString();
//   });

//   compilerProcess.on('close', (code) => {
//     let objContent = null;
//     const hasErrors = compilerOutput.includes('ERRO:');

//     // Only read program.obj if there are no compilation errors
//     if (!hasErrors) {
//       const objPath = path.join(__dirname, 'program.obj');
//       if (fs.existsSync(objPath)) {
//         try {
//           objContent = fs.readFileSync(objPath, 'utf8');
//           fs.unlinkSync(objPath);
//         } catch (err) {
//           console.error('Error handling program.obj:', err);
//         }
//       }
//     }

//     tempFile.removeCallback();

//     res.json({
//       output: compilerOutput,
//       error: compilerError,
//       exitCode: code,
//       objFile: objContent,
//       hasErrors: hasErrors
//     });
//   });
// });

// const PORT = process.env.PORT || 3001;
// app.listen(PORT, () => {
//   console.log(`Compiler server is running on port ${PORT}`);
// });

// import express from 'express';
// import bodyParser from 'body-parser';
// import cors from 'cors';
// import { spawn } from 'child_process';
// import fs from 'fs';
// import tmp from 'tmp';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import { dirname } from 'path';
// import VirtualMachine from '../virtual_machine/VirtualMachine.js';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// const app = express();
// app.use(bodyParser.json({ limit: '10mb' }));
// app.use(cors());

// app.post('/compile', (req, res) => {
//   const sourceCode = req.body.code;

//   if (!sourceCode) {
//     return res.status(400).json({ error: 'No source code provided.' });
//   }

//   const tempFile = tmp.fileSync({ postfix: '.lpd' });
//   fs.writeFileSync(tempFile.name, sourceCode);

//   const compilerExecutable = '../compiler/compiler';
//   const compilerProcess = spawn(compilerExecutable, [tempFile.name]);

//   let compilerOutput = '';
//   let compilerError = '';

//   compilerProcess.stdout.on('data', (data) => {
//     compilerOutput += data.toString();
//   });

//   compilerProcess.stderr.on('data', (data) => {
//     compilerError += data.toString();
//   });

//   compilerProcess.on('close', (code) => {
//     let objContent = null;
//     const hasErrors = compilerOutput.includes('ERRO:');

//     if (!hasErrors) {
//       const objPath = path.join(__dirname, 'program.obj');
//       if (fs.existsSync(objPath)) {
//         try {
//           objContent = fs.readFileSync(objPath, 'utf8');
//           fs.unlinkSync(objPath);
//         } catch (err) {
//           console.error('Error handling program.obj:', err);
//         }
//       }
//     }

//     tempFile.removeCallback();

//     res.json({
//       output: compilerOutput,
//       error: compilerError,
//       exitCode: code,
//       objFile: objContent,
//       hasErrors: hasErrors
//     });
//   });
// });

// app.post('/execute', (req, res) => {
//   const { objCode } = req.body;

//   if (!objCode) {
//     return res.status(400).json({ error: 'No object code provided.' });
//   }

//   try {
//     const vm = new VirtualMachine();
//     const output = vm.executeInstructions(objCode);
    
//     res.json({
//       success: true,
//       output: output.map(out => out.value).join('\n'),
//       error: null
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       output: null,
//       error: error.message
//     });
//   }
// });

// const PORT = process.env.PORT || 3001;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });