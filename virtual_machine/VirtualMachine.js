// VirtualMachine.js
export class VirtualMachine {
  constructor() {
    this.commands = [];
    this.nullMarks = [];
    this.memory = new Array(2000).fill('');
    this.p = 0;
    this.s = -1;
    this.outputBuffer = [];
    this.isRunning = false;
  }

  searchMark(markToSearch) {
    for (const mark of this.nullMarks) {
      if (mark.rot === markToSearch) {
        return parseInt(mark.pos);
      }
    }
    return -1;
  }

  async executeCommand(rot, com, mem1, mem2) {
    let aux = 0;
    let aux2 = 0;

    switch (com) {
      case 'LDC':
        this.s++;
        this.memory[this.s] = mem1;
        break;

      case 'LDV':
        aux = parseInt(mem1);
        this.s++;
        this.memory[this.s] = this.memory[aux];
        break;

      case 'ADD':
        aux = parseInt(this.memory[this.s - 1]);
        aux2 = parseInt(this.memory[this.s]);
        aux = aux + aux2;
        this.memory[this.s - 1] = aux.toString();
        this.s--;
        break;

      case 'MULT':
        aux = parseInt(this.memory[this.s - 1]);
        aux2 = parseInt(this.memory[this.s]);
        aux = aux * aux2;
        this.memory[this.s - 1] = aux.toString();
        this.s--;
        break;

      case 'SUB':
        aux = parseInt(this.memory[this.s - 1]);
        aux2 = parseInt(this.memory[this.s]);
        aux = aux - aux2;
        this.memory[this.s - 1] = aux.toString();
        this.s--;
        break;

      case 'DIVI':
        aux = parseInt(this.memory[this.s - 1]);
        aux2 = parseInt(this.memory[this.s]);
        if (aux2 === 0) {
          throw new Error('Division by zero');
        }
        aux = Math.floor(aux / aux2);
        this.memory[this.s - 1] = aux.toString();
        this.s--;
        break;

      case 'INV':
        aux = parseInt(this.memory[this.s]);
        aux = -aux;
        this.memory[this.s] = aux.toString();
        break;

      case 'AND':
        aux = parseInt(this.memory[this.s - 1]);
        aux2 = parseInt(this.memory[this.s]);
        this.memory[this.s - 1] = (aux === 1 && aux2 === 1) ? '1' : '0';
        this.s--;
        break;

      case 'OR':
        aux = parseInt(this.memory[this.s - 1]);
        aux2 = parseInt(this.memory[this.s]);
        this.memory[this.s - 1] = (aux === 1 || aux2 === 1) ? '1' : '0';
        this.s--;
        break;

      case 'NEG':
        aux = parseInt(this.memory[this.s]);
        aux = 1 - aux;
        this.memory[this.s] = aux.toString();
        break;

      case 'CME':
        aux = parseInt(this.memory[this.s - 1]);
        aux2 = parseInt(this.memory[this.s]);
        this.memory[this.s - 1] = (aux < aux2) ? '1' : '0';
        this.s--;
        break;

      case 'CMA':
        aux = parseInt(this.memory[this.s - 1]);
        aux2 = parseInt(this.memory[this.s]);
        this.memory[this.s - 1] = (aux > aux2) ? '1' : '0';
        this.s--;
        break;

      case 'CEQ':
        aux = parseInt(this.memory[this.s - 1]);
        aux2 = parseInt(this.memory[this.s]);
        this.memory[this.s - 1] = (aux === aux2) ? '1' : '0';
        this.s--;
        break;

      case 'CDIF':
        aux = parseInt(this.memory[this.s - 1]);
        aux2 = parseInt(this.memory[this.s]);
        this.memory[this.s - 1] = (aux !== aux2) ? '1' : '0';
        this.s--;
        break;

      case 'CMEQ':
        aux = parseInt(this.memory[this.s - 1]);
        aux2 = parseInt(this.memory[this.s]);
        this.memory[this.s - 1] = (aux <= aux2) ? '1' : '0';
        this.s--;
        break;

      case 'CMAQ':
        aux = parseInt(this.memory[this.s - 1]);
        aux2 = parseInt(this.memory[this.s]);
        this.memory[this.s - 1] = (aux >= aux2) ? '1' : '0';
        this.s--;
        break;

      case 'STR':
        aux = parseInt(mem1);
        this.memory[aux] = this.memory[this.s];
        this.s--;
        break;

      case 'RD':
        this.s++;
        // Using prompt for input
        const input = prompt('Entrada de dados:');
        if (input === null) {
          throw new Error('Execução cancelada pelo usuário');
        }
        const numInput = parseInt(input);
        if (isNaN(numInput)) {
          throw new Error('Input inválido: por favor insira um número');
        }
        this.memory[this.s] = numInput.toString();
        break;

      case 'PRN':
        // Add to output buffer and show alert
        const output = `Res: ${this.memory[this.s]}`;
        this.outputBuffer.push(output);
        alert(output);
        this.s--;
        break;

      case 'CALL':
        aux = this.searchMark(mem1);
        this.s++;
        this.memory[this.s] = this.p.toString();
        this.p = aux - 1;
        break;

      case 'RETURN':
        this.p = parseInt(this.memory[this.s]);
        this.s--;
        break;

      case 'JMPF':
        aux = this.searchMark(mem1);
        aux2 = parseInt(this.memory[this.s]);
        if (aux2 === 0) {
          this.p = aux - 1;
        }
        this.s--;
        break;

      case 'JMP':
        aux = this.searchMark(mem1);
        this.p = aux - 1;
        break;

      case 'ALLOC':
        aux = parseInt(mem1);
        aux2 = parseInt(mem2);
        for (let i = 0; i < aux2; i++) {
          this.s++;
          this.memory[this.s] = this.memory[aux + i];
        }
        break;

      case 'DALLOC':
        aux = parseInt(mem1);
        aux2 = parseInt(mem2);
        for (let i = aux2 - 1; i >= 0; i--) {
          this.memory[aux + i] = this.memory[this.s];
          this.s--;
        }
        break;
    }
  }

  async executeInstructions(objCode) {
    // Reset state
    this.commands = [];
    this.nullMarks = [];
    this.memory = new Array(100).fill('');
    this.p = 0;
    this.s = -1;
    this.outputBuffer = [];
    this.isRunning = true;

    try {
      const lines = objCode.split('\n').filter(line => line.trim());

      // Parse commands and null marks
      for (const line of lines) {
        if (line.length < 20) continue;
        
        const rot = line.substring(0, 4).trim();
        const com = line.substring(4, 12).trim();
        const mem1 = line.substring(12, 16).trim();
        const mem2 = line.substring(16, 20).trim();

        this.commands.push({ rot, com, mem1, mem2 });

        if (com === 'NULL') {
          this.nullMarks.push({
            rot,
            pos: (this.commands.length - 1).toString()
          });
        }
      }

      // Execute instructions
      while (this.p < this.commands.length && this.isRunning) {
        const cmd = this.commands[this.p];
        
        if (cmd.com === 'HLT') {
          break;
        }

        await this.executeCommand(cmd.rot, cmd.com, cmd.mem1, cmd.mem2);
        this.p++;
      }

      return {
        success: true,
        output: this.outputBuffer.join('\n'),
        error: null
      };

    } catch (error) {
      return {
        success: false,
        output: this.outputBuffer.join('\n'),
        error: error.message
      };
    } finally {
      this.isRunning = false;
    }
  }

  stop() {
    this.isRunning = false;
  }
}

export default VirtualMachine;
