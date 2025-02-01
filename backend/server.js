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
