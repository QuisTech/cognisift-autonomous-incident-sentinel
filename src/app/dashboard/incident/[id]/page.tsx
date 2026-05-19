'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AgentStatusHUD } from '@/components/dashboard/AgentStatusHUD';
import { Code, CheckCircle2, Shield, XCircle, Clock, Database, AlertTriangle, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TimelineItem {
  id: number;
  sequence: number;
  type: string;
  message: string;
  timestamp: string;
  agent: string;
  details?: Record<string, any>;
}

interface CustodyRecord {
  id: number;
  sequence: number;
  timestamp: string;
  evidenceId: string;
  prevHash: string;
  currentHash: string;
  status: 'success' | 'warning' | 'error';
}

export default function LiveIncidentAnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const incidentId = params.id as string;

  // Monotonic State Machine: OPEN -> TRIAGE -> ANALYSIS -> CONFIRMED -> CLOSED
  const [socState, setSocState] = useState<'OPEN' | 'TRIAGE' | 'ANALYSIS' | 'CONFIRMED' | 'CLOSED'>('OPEN');
  
  // Last processed sequence to enforce monotonic ordering guarantees
  const [lastSequence, setLastSequence] = useState<number>(0);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [custodyLedger, setCustodyLedger] = useState<CustodyRecord[]>([
    {
      id: 1,
      sequence: 0,
      timestamp: '10:00:00',
      evidenceId: 'GENESIS-SEED',
      prevHash: '0000000000000000000000000000000000000000000000000000000000000000',
      currentHash: '0000000000000000000000000000000000000000000000000000000000000000',
      status: 'success'
    }
  ]);

  const [compromisedProcesses, setCompromisedProcesses] = useState<any[]>([]);
  const [memoryInjections, setMemoryInjections] = useState<any[]>([]);

  useEffect(() => {
    // Connect to thin-proxy SSE stream
    const eventSource = new EventSource('/api/forensics/stream');

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const sequence = payload.sequence;

        // Ordering Guarantee: Discard out-of-order or duplicate packets
        if (sequence <= lastSequence) {
          console.warn(`[Forensics Stream] Out-of-order packet rejected: received Seq ${sequence}, last was Seq ${lastSequence}`);
          return;
        }

        setLastSequence(sequence);
        const timestamp = new Date(payload.timestamp).toLocaleTimeString();
        const data = payload.data || {};

        // Align State Machine dynamically based on SIFT tool execution phase
        if (data.state) {
          setSocState(data.state);
        }

        // Process discrete event types
        switch (payload.event) {
          case 'analysis_started':
            setTimeline(prev => [
              ...prev,
              {
                id: prev.length + 1,
                sequence,
                type: 'SYSTEM',
                message: data.message,
                timestamp: payload.timestamp,
                agent: 'OrchestratorMaster'
              }
            ]);
            break;

          case 'tool_invoked':
            setTimeline(prev => [
              ...prev,
              {
                id: prev.length + 1,
                sequence,
                type: 'INVOCATION',
                message: data.message,
                timestamp: payload.timestamp,
                agent: data.tool
              }
            ]);
            break;

          case 'process_detected':
            if (data.suspicious) {
              setCompromisedProcesses(prev => [...prev, data]);
            }
            setTimeline(prev => [
              ...prev,
              {
                id: prev.length + 1,
                sequence,
                type: 'FINDING',
                message: `Anomalous process tree: Detected '${data.name}' (PID: ${data.pid}) running out of non-standard directory: ${data.path}`,
                timestamp: payload.timestamp,
                agent: data.tool
              }
            ]);
            break;

          case 'memory_anomaly':
            setMemoryInjections(prev => [...prev, data]);
            setTimeline(prev => [
              ...prev,
              {
                id: prev.length + 1,
                sequence,
                type: 'ANOMALY',
                message: `Injected Code Block RWX Signature matched: Process '${data.pid}' contains unbacked executable segments.`,
                timestamp: payload.timestamp,
                agent: data.tool
              }
            ]);
            break;

          case 'timeline_event':
            setTimeline(prev => [
              ...prev,
              {
                id: prev.length + 1,
                sequence,
                type: 'TIMELINE',
                message: data.message,
                timestamp: payload.timestamp,
                agent: data.tool || 'ReportingAgent'
              }
            ]);

            // If custody data is included, link and hash in Chain of Custody ledger
            if (data.evidenceId) {
              setCustodyLedger(prev => [
                ...prev,
                {
                  id: prev.length + 1,
                  sequence,
                  timestamp,
                  evidenceId: data.evidenceId,
                  prevHash: data.prevHash,
                  currentHash: data.currentHash,
                  status: data.status || 'success'
                }
              ]);
            }
            break;

          case 'analysis_complete':
            setTimeline(prev => [
              ...prev,
              {
                id: prev.length + 1,
                sequence,
                type: 'COMPLETE',
                message: data.message,
                timestamp: payload.timestamp,
                agent: 'System'
              }
            ]);
            break;

          default:
            break;
        }
      } catch (err) {
        console.error('Failed to parse SSE payload:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('EventSource connection error:', err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [lastSequence]);

  const getStatusIcon = (status: 'success' | 'warning' | 'error') => {
    switch (status) {
      case 'success': return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getLifecycleBadgeColor = (state: string) => {
    switch (state) {
      case 'OPEN': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'TRIAGE': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'ANALYSIS': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'CONFIRMED': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'CLOSED': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => router.push('/dashboard')}
            className="flex items-center text-slate-400 hover:text-white transition-colors gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-900 border border-slate-800"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </button>
          <div className="flex items-center gap-3">
            <span className="text-slate-500 text-sm">Lifecycle State:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getLifecycleBadgeColor(socState)} transition-all duration-500`}>
              {socState}
            </span>
          </div>
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-white flex items-center gap-3">
          <Database className="h-9 w-9 text-cyan-500" /> SIFT Sentinel: Autonomous Forensic Analysis
        </h1>
        <p className="text-slate-400 mb-8 max-w-2xl">
          Real-time incident response telemetry streamed directly from secure SIFT workstation MCP binaries. Enforcing absolute evidence integrity.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Telemetry & Timelines */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Real-time Incident HUD */}
            <AgentStatusHUD incidentId={incidentId} />

            {/* Evidence Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/50 backdrop-blur-md p-6 rounded-xl border border-slate-800 h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-slate-950"
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center text-white gap-2">
                <Clock className="h-6 w-6 text-cyan-500" /> Evidence Timeline
              </h2>
              <div className="relative border-l border-slate-800 ml-4 pl-6 space-y-6">
                <AnimatePresence>
                  {timeline.map((item) => (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="relative"
                    >
                      <div className="absolute w-3.5 h-3.5 bg-cyan-500/20 border-2 border-cyan-500 rounded-full -left-[33px] top-1.5 shadow-[0_0_10px_rgba(6,182,212,0.3)]" />
                      <div className="text-slate-500 text-xs font-mono">{new Date(item.timestamp).toLocaleTimeString()} · Sequence {item.sequence}</div>
                      <h3 className="text-md font-semibold text-white mt-0.5">{item.message}</h3>
                      <div className="text-xs text-slate-400 mt-1">
                        Forensic Agent: <span className="font-mono text-cyan-400 font-semibold">{item.agent}</span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Anomaly & Process Tree Analyzer */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/50 backdrop-blur-md p-6 rounded-xl border border-slate-800"
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center text-white gap-2">
                <Code className="h-6 w-6 text-purple-500" /> Active Anomaly Process Analyzer
              </h2>
              <div className="space-y-4">
                {compromisedProcesses.length === 0 && memoryInjections.length === 0 ? (
                  <div className="h-32 bg-slate-950/60 rounded-lg flex items-center justify-center border border-slate-800 border-dashed text-slate-500 text-sm">
                    Awaiting target process diagnostics scan...
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {compromisedProcesses.map((proc, i) => (
                      <div key={i} className="bg-slate-950/80 p-4 rounded-lg border border-red-500/30 bg-gradient-to-br from-red-500/5 to-transparent">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold px-2 py-0.5 bg-red-500/20 border border-red-500/30 text-red-400 rounded-full">Process Masquerading</span>
                          <span className="text-slate-500 text-xs font-mono">PID: {proc.pid}</span>
                        </div>
                        <h4 className="font-bold text-white text-md">{proc.name}</h4>
                        <div className="text-slate-400 text-xs mt-1">Path: <span className="font-mono text-slate-300">{proc.path}</span></div>
                        <div className="text-red-400 text-xs mt-2 font-semibold bg-red-950/30 p-2 rounded border border-red-900/20">
                          {proc.reason}
                        </div>
                      </div>
                    ))}
                    {memoryInjections.map((inj, i) => (
                      <div key={i} className="bg-slate-950/80 p-4 rounded-lg border border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-transparent">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-full">Code Injection</span>
                          <span className="text-slate-500 text-xs font-mono">Addr: {inj.address}</span>
                        </div>
                        <h4 className="font-bold text-white text-md">Target: {inj.process}</h4>
                        <div className="text-slate-400 text-xs mt-1">Permission: <span className="font-mono text-amber-400 font-semibold">{inj.permissions}</span></div>
                        <div className="mt-2 space-y-1">
                          <div className="text-slate-500 text-[10px] font-mono">HEXDUMP HEADER:</div>
                          <div className="font-mono text-[11px] text-purple-300 bg-slate-900 p-1.5 rounded">{inj.hexdump_header}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Forensic Registry Ledger (Chain of Custody) */}
          <div className="lg:col-span-1 space-y-8">
            <motion.div
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-slate-900/50 backdrop-blur-md p-6 rounded-xl border border-slate-800 h-full max-h-[700px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-slate-950"
            >
              <h2 className="text-2xl font-bold mb-4 flex items-center text-white gap-2">
                <Shield className="h-6 w-6 text-emerald-500" /> Forensic Custody Registry
              </h2>
              <p className="text-slate-400 text-xs mb-6">
                Tamper-evident append-only hash chain verifying mathematical forensic integrity. Each link references the parent cryptographic block.
              </p>
              
              <div className="space-y-4">
                {custodyLedger.map((log, idx) => (
                  <div key={log.id} className="bg-slate-950/60 p-4 rounded-lg border border-slate-800 relative">
                    {idx > 0 && (
                      <div className="absolute -top-[17px] left-6 w-[2px] h-[17px] bg-emerald-500/30" />
                    )}
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(log.status)}
                      <span className="text-xs font-bold text-white">ID: {log.evidenceId}</span>
                      <span className="text-[10px] text-slate-500 font-mono ml-auto">{log.timestamp}</span>
                    </div>
                    
                    <div className="space-y-2 text-[11px]">
                      <div>
                        <span className="text-slate-500 font-mono block">CURRENT BLOCK HASH:</span>
                        <span className="font-mono text-emerald-400 break-all select-all block bg-slate-900/80 p-1.5 rounded">{log.currentHash}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-mono block">PREVIOUS PARENT LINK:</span>
                        <span className="font-mono text-slate-500 break-all select-all block bg-slate-900/50 p-1 rounded">{log.prevHash}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
