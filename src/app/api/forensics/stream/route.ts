import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

interface ForensicEvent {
  sequence: number;
  event: 'analysis_started' | 'tool_invoked' | 'process_detected' | 'memory_anomaly' | 'timeline_event' | 'analysis_complete';
  incidentId: string;
  timestamp: string;
  data: Record<string, any>;
}

// Seed data
const DEFAULT_PRESEEDED_EVENTS: Omit<ForensicEvent, 'sequence'>[] = [
  { event: 'analysis_started', incidentId: 'prod-db01', timestamp: new Date().toISOString(), data: { message: 'Forensic incident analysis initiated on target image.', state: 'TRIAGE', evidenceFile: '/evidence/prod-db01.raw', sha256: '4f7b2a9d6c1f8a3e7b2c9d6f1a3e7b2c9d6f1a3e7b2c9d6f1a3e7b2c9d6f1a3e' } },
  { event: 'tool_invoked', incidentId: 'prod-db01', timestamp: new Date().toISOString(), data: { tool: 'volatility_pslist', state: 'ANALYSIS', message: 'Invoked Volatility memory parser to list running processes.' } },
  { event: 'process_detected', incidentId: 'prod-db01', timestamp: new Date().toISOString(), data: { tool: 'volatility_pslist', state: 'ANALYSIS', message: 'Suspicious process detected executing from non-standard path.', pid: 1048, ppid: 884, name: 'lsass_evil.exe', path: 'C:\\Windows\\Temp\\lsass_evil.exe', suspicious: true, mode: 'demo' } },
  { event: 'tool_invoked', incidentId: 'prod-db01', timestamp: new Date().toISOString(), data: { tool: 'volatility_malfind', state: 'ANALYSIS', message: 'Invoked Volatility malfind to search for process memory injection signatures.' } },
  { event: 'memory_anomaly', incidentId: 'prod-db01', timestamp: new Date().toISOString(), data: { tool: 'volatility_malfind', state: 'ANALYSIS', message: 'Injected memory block with PAGE_EXECUTE_READWRITE permissions found inside lsass_evil.exe.', pid: 1048, address: '0x0000021c35e80000', mode: 'demo' } },
  { event: 'tool_invoked', incidentId: 'prod-db01', timestamp: new Date().toISOString(), data: { tool: 'suspicious_parent_child_analyzer', state: 'ANALYSIS', message: 'Invoked suspicious parent-child analyzer to audit process hierarchy anomalies.' } },
  { event: 'timeline_event', incidentId: 'prod-db01', timestamp: new Date().toISOString(), data: { tool: 'suspicious_parent_child_analyzer', state: 'CONFIRMED', message: 'CRITICAL: Parent-Child anomaly logged. Services.exe spawned malicious Security Subsystem mock from Temp.', severity: 'CRITICAL', mode: 'demo' } },
  { event: 'tool_invoked', incidentId: 'prod-db01', timestamp: new Date().toISOString(), data: { tool: 'chain_of_custody_register', state: 'CONFIRMED', message: 'Invoked Chain of Custody ledger registry to sign and link the forensic evidence.' } },
  { event: 'timeline_event', incidentId: 'prod-db01', timestamp: new Date().toISOString(), data: { tool: 'chain_of_custody_register', state: 'CONFIRMED', message: 'Evidence registration success: Linked SHA-256 process evidence with cryptographic previous-hash reference in ledger.', status: 'success', evidenceId: 'IMG-PROD-DB01', prevHash: '4f7b2a9d6c1f8a3e7b2c9d6f1a3e7b2c9d6f1a3e7b2c9d6f1a3e7b2c9d6f1a3e', currentHash: 'b5a8c6e2a9b3d1f4a7c8e9d0b1a2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0', ledgerDepth: 2 } },
  { event: 'analysis_complete', incidentId: 'prod-db01', timestamp: new Date().toISOString(), data: { message: 'Autonomous digital forensics scan finished. Incident confirmed as CRITICAL compromise.', state: 'CLOSED', remediationRequired: true } }
];

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  const jsonlPath = path.join(process.cwd(), 'forensics-events.jsonl');

  // Initialize the JSONL ledger file with pre-seeded demo runs if not present
  if (!fs.existsSync(jsonlPath)) {
    const defaultJsonlContent = DEFAULT_PRESEEDED_EVENTS.map(evt => JSON.stringify(evt)).join('\n') + '\n';
    fs.writeFileSync(jsonlPath, defaultJsonlContent, 'utf-8');
  }

  // Support offset resumption via standard Last-Event-ID or query parameter ?lastSeq=N
  const lastEventIdHeader = request.headers.get('last-event-id');
  const url = new URL(request.url);
  const lastSeqParam = url.searchParams.get('lastSeq');
  const lastResumedSequence = parseInt(lastEventIdHeader || lastSeqParam || '0', 10);

  let isAborted = false;
  request.signal.addEventListener('abort', () => {
    isAborted = true;
    console.log(`[Forensic Stream SSE] Client browser disconnected. Stopped stream telemetry. Resumed offset was: ${lastResumedSequence}`);
  });

  const customStream = new ReadableStream({
    async start(controller) {
      let byteOffset = 0;
      let sequenceCounter = 0;
      let lineBuffer = '';

      const pushEvent = (evt: ForensicEvent) => {
        if (!isAborted) {
          // Standard SSE protocol structure using 'id: [sequence]' and 'data: [json]'
          controller.enqueue(encoder.encode(`id: ${evt.sequence}\ndata: ${JSON.stringify(evt)}\n\n`));
        }
      };

      const tailFile = () => {
        if (isAborted) return;

        try {
          const stats = fs.statSync(jsonlPath);
          
          if (stats.size < byteOffset) {
            // Log rotation or truncation reset
            byteOffset = 0;
            sequenceCounter = 0;
            lineBuffer = '';
          }

          if (stats.size > byteOffset) {
            const fd = fs.openSync(jsonlPath, 'r');
            const length = stats.size - byteOffset;
            const buffer = Buffer.alloc(length);
            
            fs.readSync(fd, buffer, 0, length, byteOffset);
            fs.closeSync(fd);

            byteOffset = stats.size;
            lineBuffer += buffer.toString('utf-8');
            const lines = lineBuffer.split('\n');
            
            // Hold incomplete lines in buffer for subsequent poll cycles
            lineBuffer = lines.pop() || '';

            for (const line of lines) {
              if (!line.trim()) continue;

              try {
                const parsedEvent: Omit<ForensicEvent, 'sequence'> = JSON.parse(line);
                
                // Dynamically assign sequence counts in order of parsing/emission
                sequenceCounter++;

                // Enforce browser reconnect offsets: Skip sending if already rendered by client
                if (sequenceCounter > lastResumedSequence) {
                  const sequentialEvent: ForensicEvent = {
                    sequence: sequenceCounter,
                    event: parsedEvent.event,
                    incidentId: parsedEvent.incidentId,
                    timestamp: parsedEvent.timestamp || new Date().toISOString(),
                    data: parsedEvent.data
                  };

                  pushEvent(sequentialEvent);
                }
              } catch (parseErr) {
                // Graceful skip recovery: Skip corrupted or malformed lines cleanly
                console.warn('[Forensic Tailer] Graceful skip over corrupted JSONL line: ', parseErr);
              }
            }
          }
        } catch (err) {
          console.error('[Forensic Tailer] Event stream read error:', err);
        }
      };

      // Poll at a secure 300ms intervals
      const intervalId = setInterval(tailFile, 300);

      // Instantly load initial tail chunk on browser launch
      tailFile();

      // Monitor abort and clean interval resources immediately
      const abortWatch = setInterval(() => {
        if (isAborted) {
          clearInterval(intervalId);
          clearInterval(abortWatch);
          controller.close();
        }
      }, 500);
    }
  });

  return new Response(customStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive'
    }
  });
}
