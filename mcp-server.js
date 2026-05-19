/**
 * SIFT Digital Forensics Model Context Protocol (MCP) Server
 * Specifications: JSON-RPC 2.0 Stdio, Version 2024-11-05
 * Focus: Security, Safety, Rigorous Schemas, Chain of Custody Ledgers
 */

const readline = require('readline');
const crypto = require('crypto');
const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');

// Parse flags
const isDemoMode = process.argv.includes('--demo-mode');
const isReplayMode = process.argv.includes('--replay');

// Strict Allowlist Mapping of Pre-Approved Forensic Binaries on SIFT VM
const ALLOWED_FORENSIC_TOOLS = {
  volatility3: '/usr/bin/volatility3',
  volatility2: '/usr/bin/volatility',
  fls: '/usr/bin/fls',
  amcache: '/usr/share/sift/tools/amcache.py',
  regripper: '/usr/share/sift/tools/rip.pl'
};

// Strict Argument Regex Grammars to Prevent Shell / Argument Injection
const ARGUMENT_PATTERNS = {
  imagePath: /^\/evidence\/[a-zA-Z0-9_\-\.]+\.(raw|img|dd|E01)$/,
  prefetchDir: /^\/mnt\/[a-zA-Z0-9_\-\.]+\/Windows\/Prefetch$/
};

// In-Memory Tamper-Evident Append-Only Chain of Custody Log (Chained Ledger)
const chainOfCustodyLedger = [];

// Helper to calculate ledger chain hash
function calculateEntryHash(entry) {
  const dataString = JSON.stringify({
    timestamp: entry.timestamp,
    evidenceId: entry.evidenceId,
    sourcePath: entry.sourcePath,
    acquisitionMethod: entry.acquisitionMethod,
    operatorId: entry.operatorId,
    prevHash: entry.prevHash
  });
  return crypto.createHash('sha256').update(dataString).digest('hex');
}

// Initial Chain Seed
const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

// Register initial seed in Ledger
chainOfCustodyLedger.push({
  timestamp: new Date('2026-05-18T10:00:00Z').toISOString(),
  evidenceId: 'GENESIS-SEED',
  sourcePath: '/dev/null',
  acquisitionMethod: 'SYSTEM_STARTUP',
  operatorId: 'SYSTEM-DAEMON',
  prevHash: '0000000000000000000000000000000000000000000000000000000000000000',
  currentHash: GENESIS_HASH
});

// JSON-RPC Error Builders
function buildError(code, message, id = null, data = null) {
  return {
    jsonrpc: '2.0',
    id,
    error: {
      code,
      message,
      ...(data && { data })
    }
  };
}

// High-Performance Atomic JSONL Log Writer
// Decoupled from sequence assignment to prevent multi-process append contentions!
function logMcpEvent(eventType, eventData) {
  try {
    const jsonlPath = path.join(__dirname, 'forensics-events.jsonl');
    
    const payload = {
      event: eventType,
      incidentId: 'prod-db01',
      timestamp: new Date().toISOString(),
      data: eventData
    };

    // Atomic complete newline-terminated JSONL flush
    fs.appendFileSync(jsonlPath, JSON.stringify(payload) + '\n', 'utf-8');
  } catch (err) {
    // Silence errors to protect stdout JSON-RPC stream
  }
}

// Tool definitions and validation schemas
const TOOLS = [
  {
    name: 'volatility_pslist',
    description: 'Lists running processes from memory capture to identify active PIDs, PPIDs, and execution paths.',
    inputSchema: {
      type: 'object',
      properties: {
        imagePath: { 
          type: 'string', 
          pattern: ARGUMENT_PATTERNS.imagePath.source,
          description: 'Absolute path to raw memory image (must reside in /evidence/ and end in .raw/.img)' 
        }
      },
      required: ['imagePath']
    }
  },
  {
    name: 'volatility_malfind',
    description: 'Scans memory pages for injected code, hidden/hollowed processes, and page permissions like PAGE_EXECUTE_READWRITE.',
    inputSchema: {
      type: 'object',
      properties: {
        imagePath: { 
          type: 'string', 
          pattern: ARGUMENT_PATTERNS.imagePath.source,
          description: 'Absolute path to memory capture file.' 
        }
      },
      required: ['imagePath']
    }
  },
  {
    name: 'suspicious_parent_child_analyzer',
    description: 'Analyzes process tree hierarchy from memory to identify process masquerading (e.g. lsass running from Temp).',
    inputSchema: {
      type: 'object',
      properties: {
        imagePath: { 
          type: 'string', 
          pattern: ARGUMENT_PATTERNS.imagePath.source,
          description: 'Absolute path to memory dump.' 
        }
      },
      required: ['imagePath']
    }
  },
  {
    name: 'get_amcache',
    description: 'Parses Amcache registry hive execution history to trace previously run binaries, compile dates, and SHA-1 hashes.',
    inputSchema: {
      type: 'object',
      properties: {
        imagePath: { 
          type: 'string', 
          pattern: ARGUMENT_PATTERNS.imagePath.source,
          description: 'Absolute path to forensic disk image.' 
        }
      },
      required: ['imagePath']
    }
  },
  {
    name: 'extract_mft_timeline',
    description: 'Uses Sleuth Kit (fls) to parse NTFS $MFT logs and extract creation, modification, and access timestamps.',
    inputSchema: {
      type: 'object',
      properties: {
        imagePath: { 
          type: 'string', 
          pattern: ARGUMENT_PATTERNS.imagePath.source,
          description: 'Absolute path to forensic disk image.' 
        }
      },
      required: ['imagePath']
    }
  },
  {
    name: 'chain_of_custody_register',
    description: 'Registers a new forensic artifact into the append-only tamper-evident blockchain ledger.',
    inputSchema: {
      type: 'object',
      properties: {
        evidenceId: { type: 'string', description: 'Unique identification code for evidence (e.g. IMG-PROD-DB01).' },
        sourcePath: { type: 'string', description: 'Original source file system location.' },
        acquisitionMethod: { type: 'string', description: 'Method of acquisition (e.g. dd physical dump, ftk imager).' },
        operatorId: { type: 'string', description: 'Identification code of investigator (e.g. OP-AVA-74).' }
      },
      required: ['evidenceId', 'sourcePath', 'acquisitionMethod', 'operatorId']
    }
  }
];

// Handles executing SIFT CLI utilities via secure Allowlist execution
function executeSiftTool(toolKey, argsArray, callback) {
  const binaryPath = ALLOWED_FORENSIC_TOOLS[toolKey];
  if (!binaryPath) {
    return callback(new Error(`Tool ${toolKey} not supported in allowed list.`));
  }
  
  // Safe execFile configuration (specifying absolute path, preventing shell expansion)
  execFile(binaryPath, argsArray, { timeout: 30000 }, (error, stdout, stderr) => {
    if (error) {
      return callback(error);
    }
    callback(null, stdout);
  });
}

// Generate highly structured, tags-encased, forensic-grade simulated responses
function getMockForensicData(toolName, args) {
  const timestamp = new Date().toISOString();
  
  switch (toolName) {
    case 'volatility_pslist':
      return {
        tool: 'volatility_pslist',
        mode: 'demo',
        synthetic_demo_evidence: true,
        warning: 'synthetic training data',
        timestamp,
        imagePath: args.imagePath,
        processes: [
          { pid: 4, ppid: 0, name: 'System', path: 'Kernel Space', suspicious: false },
          { pid: 884, ppid: 624, name: 'services.exe', path: 'C:\\Windows\\System32\\services.exe', suspicious: false },
          { pid: 748, ppid: 884, name: 'lsass.exe', path: 'C:\\Windows\\System32\\lsass.exe', suspicious: false },
          { pid: 1048, ppid: 884, name: 'lsass_evil.exe', path: 'C:\\Windows\\Temp\\lsass_evil.exe', suspicious: true, reason: 'Masquerading as system lsass from Temp directory.' }
        ]
      };
    
    case 'volatility_malfind':
      return {
        tool: 'volatility_malfind',
        mode: 'demo',
        synthetic_demo_evidence: true,
        warning: 'synthetic training data',
        timestamp,
        imagePath: args.imagePath,
        injections: [
          {
            pid: 1048,
            process: 'lsass_evil.exe',
            address: '0x0000021c35e80000',
            permissions: 'PAGE_EXECUTE_READWRITE',
            hexdump_header: '55 89 e5 6a 00 68 00 10 00 00',
            instruction_disassembly: 'push ebp; mov ebp, esp; push 0; push 0x1000',
            suspicious: true
          }
        ]
      };

    case 'suspicious_parent_child_analyzer':
      return {
        tool: 'suspicious_parent_child_analyzer',
        mode: 'demo',
        synthetic_demo_evidence: true,
        warning: 'synthetic training data',
        timestamp,
        imagePath: args.imagePath,
        anomalies: [
          {
            pid: 1048,
            name: 'lsass_evil.exe',
            ppid: 884,
            parentName: 'services.exe',
            path: 'C:\\Windows\\Temp\\lsass_evil.exe',
            severity: 'CRITICAL',
            details: 'Spawns malicious binary masquerading as Windows Security subsystem. Spawning PID corresponds to Service Control Manager instead of wininit.exe.'
          }
        ]
      };

    case 'get_amcache':
      return {
        tool: 'get_amcache',
        mode: 'demo',
        synthetic_demo_evidence: true,
        warning: 'synthetic training data',
        timestamp,
        imagePath: args.imagePath,
        executions: [
          {
            binaryName: 'lsass_evil.exe',
            filePath: 'C:\\Windows\\Temp\\lsass_evil.exe',
            sha1: 'e4d909c290d21a20ee4e4e9f9bb49ec884d5df68',
            compileTime: '2026-05-18T09:12:00Z',
            installTime: '2026-05-18T09:14:30Z',
            suspicious: true
          }
        ]
      };

    case 'extract_mft_timeline':
      return {
        tool: 'extract_mft_timeline',
        mode: 'demo',
        synthetic_demo_evidence: true,
        warning: 'synthetic training data',
        timestamp,
        imagePath: args.imagePath,
        timeline: [
          { timestamp: '2026-05-18T09:14:30Z', type: 'MACB', action: 'File Created (lsass_evil.exe)', path: 'C:\\Windows\\Temp\\lsass_evil.exe' },
          { timestamp: '2026-05-18T09:15:02Z', type: 'M..B', action: 'System Hosts File Modified', path: 'C:\\Windows\\System32\\drivers\\etc\\hosts' }
        ]
      };
    
    default:
      throw new Error(`Tool ${toolName} has no registered mock data.`);
  }
}

// Stdio Handlers conforming to specification
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', (line) => {
  if (!line.trim()) return;
  
  let request;
  try {
    request = JSON.parse(line);
  } catch (err) {
    console.log(JSON.stringify(buildError(-32700, 'Parse error')));
    return;
  }
  
  if (request.jsonrpc !== '2.0') {
    console.log(JSON.stringify(buildError(-32600, 'Invalid Request', request.id)));
    return;
  }

  const { method, params, id } = request;
  
  switch (method) {
    case 'initialize':
      console.log(JSON.stringify({
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {}
          },
          serverInfo: {
            name: 'cognisift-sift-mcp',
            version: '1.0.0'
          }
        }
      }));
      break;

    case 'tools/list':
      console.log(JSON.stringify({
        jsonrpc: '2.0',
        id,
        result: {
          tools: TOOLS
        }
      }));
      break;

    case 'tools/call':
      handleToolCall(request);
      break;

    default:
      console.log(JSON.stringify(buildError(-32601, 'Method not found', id)));
  }
});

// Primary tool execution handler with explicit loud validation failures
function handleToolCall(request) {
  const { params, id } = request;
  const { name, arguments: args } = params || {};
  
  const tool = TOOLS.find(t => t.name === name);
  if (!tool) {
    console.log(JSON.stringify(buildError(-32601, 'Tool not found', id)));
    return;
  }

  // Schema Validation (Inputs checked before execution)
  for (const prop of tool.inputSchema.required) {
    if (!args || args[prop] === undefined) {
      console.log(JSON.stringify(buildError(-32602, `Invalid parameters: Missing required field '${prop}'`, id, { tool: name })));
      return;
    }
  }

  // Strict regex path checks & Canonicalization to prevent directory traversal bypasses
  if (args.imagePath) {
    if (!ARGUMENT_PATTERNS.imagePath.test(args.imagePath)) {
      console.log(JSON.stringify(buildError(-32602, `Invalid parameters: parameter 'imagePath' fails regex grammar check. Path must be under '/evidence/' and end in raw/img/dd/E01.`, id, { tool: name })));
      return;
    }
    
    // Canonicalize path and verify it strictly starts with the evidence base path
    const normalizedPath = path.normalize(args.imagePath);
    if (!normalizedPath.startsWith('/evidence/') && !normalizedPath.startsWith('\\evidence\\')) {
      console.log(JSON.stringify(buildError(-32602, `Security Error: Path traversal attempt blocked. Parameter 'imagePath' must resolve within the strict '/evidence/' hierarchy.`, id, { tool: name })));
      return;
    }
  }

  // Special implementation for Custody Chain (Append-only chained list)
  if (name === 'chain_of_custody_register') {
    if (isDemoMode) {
      // Demo Mode explicitly tags and blocks custody registry pollution
      console.log(JSON.stringify({
        jsonrpc: '2.0',
        id,
        result: {
          status: 'failed',
          tool_mode: 'demo',
          synthetic_demo_evidence: true,
          reason: 'Chain of custody modification is blocked in demo mode.',
          isRetryable: false
        }
      }));
      return;
    }

    try {
      const prevEntry = chainOfCustodyLedger[chainOfCustodyLedger.length - 1];
      const newEntry = {
        timestamp: new Date().toISOString(),
        evidenceId: args.evidenceId,
        sourcePath: args.sourcePath,
        acquisitionMethod: args.acquisitionMethod,
        operatorId: args.operatorId,
        prevHash: prevEntry.currentHash
      };
      
      const newHash = calculateEntryHash(newEntry);
      newEntry.currentHash = newHash;
      
      chainOfCustodyLedger.push(newEntry);

      // Write Custody Event into JSONL stream dynamically
      logMcpEvent('tool_invoked', { tool: 'chain_of_custody_register', state: 'CONFIRMED', message: 'Invoked Chain of Custody ledger registry to sign and link the forensic evidence.' });
      logMcpEvent('timeline_event', {
        tool: 'chain_of_custody_register',
        state: 'CONFIRMED',
        message: 'Evidence registration success: Linked SHA-256 process evidence with cryptographic previous-hash reference in ledger.',
        status: 'success',
        evidenceId: newEntry.evidenceId,
        prevHash: newEntry.prevHash,
        currentHash: newEntry.currentHash,
        ledgerDepth: chainOfCustodyLedger.length
      });
      
      console.log(JSON.stringify({
        jsonrpc: '2.0',
        id,
        result: {
          status: 'success',
          registration: {
            evidenceId: newEntry.evidenceId,
            timestamp: newEntry.timestamp,
            prevHash: newEntry.prevHash,
            currentHash: newEntry.currentHash,
            tamperEvidentLedgerDepth: chainOfCustodyLedger.length
          }
        }
      }));
    } catch (err) {
      console.log(JSON.stringify({
        jsonrpc: '2.0',
        id,
        result: {
          status: 'failed',
          reason: `Failed to append custody link: ${err.message}`,
          isRetryable: false
        }
      }));
    }
    return;
  }

  // Run in Demo Mode if flagged or live-binaries are missing
  if (isDemoMode) {
    try {
      const mockResult = getMockForensicData(name, args);
      
      // Dynamic JSONL Logging: Write Invocation and Discovery events dynamically
      if (name === 'volatility_pslist') {
        logMcpEvent('tool_invoked', { tool: 'volatility_pslist', state: 'ANALYSIS', message: 'Invoked Volatility memory parser to list running processes.' });
        logMcpEvent('process_detected', { tool: 'volatility_pslist', state: 'ANALYSIS', message: "Suspicious process tree: Detected 'lsass_evil.exe' (PID: 1048) running out of non-standard directory: C:\\Windows\\Temp\\", pid: 1048, ppid: 884, name: 'lsass_evil.exe', path: 'C:\\Windows\\Temp\\lsass_evil.exe', suspicious: true, mode: 'demo' });
      } else if (name === 'volatility_malfind') {
        logMcpEvent('tool_invoked', { tool: 'volatility_malfind', state: 'ANALYSIS', message: 'Invoked Volatility malfind process injector scan.' });
        logMcpEvent('memory_anomaly', { tool: 'volatility_malfind', state: 'ANALYSIS', message: 'Injected memory block with PAGE_EXECUTE_READWRITE permissions found inside lsass_evil.exe.', pid: 1048, address: '0x0000021c35e80000', mode: 'demo' });
      } else if (name === 'suspicious_parent_child_analyzer') {
        logMcpEvent('tool_invoked', { tool: 'suspicious_parent_child_analyzer', state: 'ANALYSIS', message: 'Invoked suspicious parent-child analyzer to audit process hierarchy anomalies.' });
        logMcpEvent('timeline_event', { tool: 'suspicious_parent_child_analyzer', state: 'CONFIRMED', message: 'CRITICAL: Parent-Child anomaly logged. Services.exe spawned malicious Security Subsystem mock from Temp.', severity: 'CRITICAL', mode: 'demo' });
      } else {
        logMcpEvent('tool_invoked', { tool: name, state: 'ANALYSIS', message: `Invoked forensic tool: ${name}` });
        logMcpEvent('timeline_event', { tool: name, state: 'ANALYSIS', message: `Forensic findings collected from ${name}.`, mode: 'demo' });
      }

      console.log(JSON.stringify({
        jsonrpc: '2.0',
        id,
        result: mockResult
      }));
    } catch (err) {
      console.log(JSON.stringify({
        jsonrpc: '2.0',
        id,
        result: {
          status: 'failed',
          tool_mode: 'demo',
          synthetic_demo_evidence: true,
          reason: err.message,
          isRetryable: false
        }
      }));
    }
    return;
  }

  // Live SIFT Workstation Mode
  let binaryKey = name;
  let siftArgs = [];
  
  if (name.startsWith('volatility_')) {
    binaryKey = 'volatility3';
    siftArgs = ['-f', args.imagePath, name.replace('volatility_', '')];
  } else if (name === 'extract_mft_timeline') {
    binaryKey = 'fls';
    siftArgs = ['-r', '-m', 'C:', args.imagePath];
  } else if (name === 'get_amcache') {
    binaryKey = 'amcache';
    siftArgs = ['-f', args.imagePath];
  }

  logMcpEvent('tool_invoked', { tool: name, state: 'ANALYSIS', message: `Executing SIFT binary: ${binaryKey} ${siftArgs.join(' ')}` });

  executeSiftTool(binaryKey, siftArgs, (err, stdout) => {
    if (err) {
      logMcpEvent('timeline_event', { tool: name, state: 'ANALYSIS', message: `SIFT Binary execution failure: ${err.message}`, status: 'error' });
      
      console.log(JSON.stringify({
        jsonrpc: '2.0',
        id,
        result: {
          status: 'failed',
          reason: `SIFT binary invocation failed: ${err.message}`,
          partialOutput: stdout ? stdout.substring(0, 500) : null,
          isRetryable: false
        }
      }));
      return;
    }

    if (!stdout || stdout.trim().length === 0) {
      logMcpEvent('timeline_event', { tool: name, state: 'ANALYSIS', message: 'SIFT binary returned empty forensic telemetry streams.', status: 'error' });
      
      console.log(JSON.stringify({
        jsonrpc: '2.0',
        id,
        result: {
          status: 'failed',
          reason: 'Tool output rejected: Received completely empty stream from forensic binary.',
          isRetryable: false
        }
      }));
      return;
    }

    // Limit large log bursts to 10,000 characters to prevent browser memory stalls
    const sanitizedOutput = stdout.length > 10000 ? stdout.substring(0, 10000) + '\n[...TELEMETRY_TRUNCATED_TO_PREVENT_BROWSER_STALLS...]' : stdout;

    logMcpEvent('timeline_event', { 
      tool: name, 
      state: 'ANALYSIS', 
      message: `SIFT binary execution successful. Captured ${stdout.split('\n').length} telemetry lines.`,
      status: 'success'
    });

    console.log(JSON.stringify({
      jsonrpc: '2.0',
      id,
      result: {
        status: 'success',
        tool: name,
        rawOutput: sanitizedOutput
      }
    }));
  });
}
