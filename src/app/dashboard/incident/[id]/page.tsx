'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { AgentStatusHUD } from '@/components/dashboard/AgentStatusHUD';
import { Code, CheckCircle2, ShieldEllipsis, XCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LiveIncidentAnalysisPage() {
  const params = useParams();
  const incidentId = params.id as string;

  // Mock incident data
  const [incident, setIncident] = useState({
    id: incidentId,
    name: `Incident ${incidentId}: Server Breach - Prod-DB01`,
    status: 'Active',
    description: 'Ongoing investigation into a potential server breach on the production database server. Suspicious login attempts and unusual data egress detected.',
    timeline: [
      { id: 1, type: 'Event', message: 'Alert triggered: High volume outbound traffic', timestamp: '2023-10-27T10:00:00Z', agent: 'OrchestrationMaster' },
      { id: 2, type: 'Action', message: 'Data Ingestion Agent started', timestamp: '2023-10-27T10:01:15Z', agent: 'DataIngestionNormalizationAgent' },
      { id: 3, type: 'Finding', message: 'Parsed 10GB of log data from Prod-DB01', timestamp: '2023-10-27T10:05:30Z', agent: 'DataIngestionNormalizationAgent' },
      { id: 4, type: 'Hypothesis', message: 'Initial hypothesis: Possible SQL Injection leading to data exfiltration.', timestamp: '2023-10-27T10:10:00Z', agent: 'ForensicHypothesisAgent' },
      { id: 5, type: 'Action', message: 'Tactical Agent running SIFT query for SQLi patterns', timestamp: '2023-10-27T10:12:45Z', agent: 'TacticalExecutionAgent' },
    ],
  });

  const [auditLog, setAuditLog] = useState<{
    id: number;
    timestamp: string;
    agent: string;
    action: string;
    status: 'success' | 'warning' | 'error';
  }[]>([
    { id: 1, timestamp: '10:01:15', agent: 'OrchestrationMaster', action: 'Assigned task to DataIngestionAgent', status: 'success' },
    { id: 2, timestamp: '10:03:00', agent: 'EvidenceIntegrityAgent', action: 'Monitored data ingestion', status: 'success' },
    { id: 3, timestamp: '10:15:30', agent: 'TacticalExecutionAgent', action: 'Attempted destructive operation (blocked)', status: 'warning' },
    { id: 4, timestamp: '10:15:31', agent: 'EvidenceIntegrityAgent', action: 'Flagged potential evidence spoliation', status: 'error' },
    { id: 5, timestamp: '10:20:00', agent: 'CognitiveReflectionAgent', action: 'Reviewed hypothesis and suggested alternative', status: 'success' },
  ]);

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      // Add more mock data for demonstration
      setIncident(prev => ({
        ...prev,
        timeline: [...prev.timeline, { id: prev.timeline.length + 1, type: 'Event', message: `New update: ${new Date().toLocaleTimeString()}`, timestamp: new Date().toISOString(), agent: 'System' }]
      }));
      setAuditLog(prev => ([...prev, {
        id: prev.length + 1, timestamp: new Date().toLocaleTimeString(), agent: 'EvidenceIntegrityAgent',
        action: `Integrity check #${prev.length + 1} passed`, status: 'success'
      }]));
    }, 10000); // Every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: 'success' | 'warning' | 'error') => {
    switch (status) {
      case 'success': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'warning': return <ShieldEllipsis className="h-5 w-5 text-yellow-500" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-background-dark text-text-dark p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Live Incident Analysis: {incident.name}</h1>
        <p className="text-text-muted mb-8">Incident ID: {incident.id}</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Agent Status HUD & Live Reasoning Log */}
            <AgentStatusHUD incidentId={incidentId} />

            {/* Evidence Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-surface-dark p-6 rounded-lg shadow-lg border border-slate-700 h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800"
            >
              <h2 className="text-2xl font-semibold mb-4 flex items-center"><Clock className="h-6 w-6 mr-2 text-primary-dark" /> Evidence Timeline</h2>
              <ol className="relative border-l border-slate-600 ml-4">
                {incident.timeline.map((item, index) => (
                  <li key={item.id} className="mb-6 ml-6">
                    <div className="absolute w-3 h-3 bg-primary-dark rounded-full mt-1.5 -left-1.5 border border-slate-700" />
                    <time className="mb-1 text-sm font-normal leading-none text-text-muted">{new Date(item.timestamp).toLocaleTimeString()}</time>
                    <h3 className="text-lg font-semibold text-white">{item.type}: {item.message}</h3>
                    <p className="text-sm text-text-muted">Assisted by: <span className="font-medium text-primary-dark">{item.agent}</span></p>
                  </li>
                ))}
              </ol>
            </motion.div>

            {/* Anomaly Detection View */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-surface-dark p-6 rounded-lg shadow-lg border border-slate-700"
            >
              <h2 className="text-2xl font-semibold mb-4 flex items-center"><Code className="h-6 w-6 mr-2 text-accent-dark" /> Anomaly Detection View</h2>
              <div className="h-48 bg-slate-800 rounded-md flex items-center justify-center text-text-muted">
                [Visualizations of suspicious activity detected by agents - e.g., graph, heatmaps]
              </div>
            </motion.div>

            {/* Action/Recommendation Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-surface-dark p-6 rounded-lg shadow-lg border border-slate-700"
            >
              <h2 className="text-2xl font-semibold mb-4 flex items-center"><CheckCircle2 className="h-6 w-6 mr-2 text-secondary-dark" /> Actions & Recommendations</h2>
              <p className="text-text-muted mb-4">Validated remediation steps and options for user intervention/approval.</p>
              <div className="space-y-3">
                <div className="flex items-center bg-slate-800 p-4 rounded-md border border-slate-700">
                  <span className="flex-shrink-0 text-green-500 mr-3"><CheckCircle2 /></span>
                  <span>Agent suggests isolating affected server `Prod-DB01` from the network.</span>
                  <button className="ml-auto bg-primary hover:bg-primary-dark text-white text-sm py-1.5 px-4 rounded-md transition-colors">Approve</button>
                </div>
                <div className="flex items-center bg-slate-800 p-4 rounded-md border border-slate-700">
                  <span className="flex-shrink-0 text-yellow-500 mr-3"><ShieldEllipsis /></span>
                  <span>Cognitive Reflection Agent recommends deeper analysis on user `john.doe` activity.</span>
                  <button className="ml-auto bg-primary hover:bg-primary-dark text-white text-sm py-1.5 px-4 rounded-md transition-colors">Investigate</button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar Area (Evidence Integrity Monitor) */}
          <div className="lg:col-span-1 space-y-8">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-surface-dark p-6 rounded-lg shadow-lg border border-slate-700 h-full max-h-[700px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800"
            >
              <h2 className="text-2xl font-semibold mb-4 flex items-center"><ShieldEllipsis className="h-6 w-6 mr-2 text-secondary-dark" /> Evidence Integrity Monitor</h2>
              <p className="text-text-muted mb-4">Real-time display confirming non-destructive operations and audit trail status.</p>
              <div className="space-y-4">
                {auditLog.map((log) => (
                  <div key={log.id} className="flex items-start text-sm">
                    <div className="mt-1 mr-2 flex-shrink-0">{getStatusIcon(log.status)}</div>
                    <div>
                      <span className="font-bold text-white">[{log.timestamp}]</span> <span className="text-primary-dark">{log.agent}:</span> {log.action}
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
