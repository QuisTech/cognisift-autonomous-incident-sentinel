import { BarChart, Clock, FolderKanban, PlusCircle, Search } from 'lucide-react';
import Link from 'next/link';

interface IncidentSummary {
  id: string;
  name: string;
  status: 'Active' | 'Resolved' | 'Pending Review';
  lastUpdated: string;
  priority: 'High' | 'Medium' | 'Low';
}

const mockIncidents: IncidentSummary[] = [
  { id: 'inc-001', name: 'Server Breach on Prod-DB01', status: 'Active', lastUpdated: '2 hours ago', priority: 'High' },
  { id: 'inc-002', name: 'Phishing Campaign Detected', status: 'Pending Review', lastUpdated: '1 day ago', priority: 'Medium' },
  { id: 'inc-003', name: 'Malware Infection - Workstation', status: 'Resolved', lastUpdated: '3 days ago', priority: 'Low' },
  { id: 'inc-004', name: 'Unauthorized Access Attempt', status: 'Active', lastUpdated: '1 hour ago', priority: 'High' },
  { id: 'inc-005', name: 'DDoS Attack on Public API', status: 'Resolved', lastUpdated: '5 days ago', priority: 'High' },
];

const statusColors = {
  Active: 'bg-accent-dark', // Red
  'Pending Review': 'bg-primary-dark', // Indigo
  Resolved: 'bg-secondary-dark', // Green
};

export default function DashboardOverviewPage() {
  return (
    <div className="min-h-screen bg-background-dark text-text-dark p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Dashboard Overview</h1>

        {/* Quick Actions & Search */}
        <div className="flex justify-between items-center mb-8">
          <div className="relative flex-grow mr-4">
            <input
              type="text"
              placeholder="Search incidents..."
              className="w-full p-3 pl-10 rounded-lg bg-surface-dark border border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-dark text-text-dark"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted h-5 w-5" />
          </div>
          <Link href="#">
            <button className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-lg flex items-center shadow-md transition-all duration-300">
              <PlusCircle className="h-5 w-5 mr-2" /> New Incident
            </button>
          </Link>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-surface-dark p-6 rounded-lg shadow-md border border-slate-700 flex items-center space-x-4">
            <FolderKanban className="h-10 w-10 text-primary-dark" />
            <div>
              <p className="text-text-muted text-sm">Active Incidents</p>
              <p className="text-3xl font-bold text-white">{mockIncidents.filter(i => i.status === 'Active').length}</p>
            </div>
          </div>
          <div className="bg-surface-dark p-6 rounded-lg shadow-md border border-slate-700 flex items-center space-x-4">
            <Clock className="h-10 w-10 text-secondary-dark" />
            <div>
              <p className="text-text-muted text-sm">Avg. Resolution Time</p>
              <p className="text-3xl font-bold text-white">4.2 hrs</p>
            </div>
          </div>
          <div className="bg-surface-dark p-6 rounded-lg shadow-md border border-slate-700 flex items-center space-x-4">
            <BarChart className="h-10 w-10 text-accent-dark" />
            <div>
              <p className="text-text-muted text-sm">Anomalies Detected (24h)</p>
              <p className="text-3xl font-bold text-white">17</p>
            </div>
          </div>
        </div>

        {/* Incident List */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Recent Incidents</h2>
          <div className="bg-surface-dark rounded-lg shadow-md border border-slate-700 overflow-hidden">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Incident Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Priority</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Last Updated</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {mockIncidents.map((incident) => (
                  <tr key={incident.id} className="hover:bg-slate-800 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-text-dark font-medium">
                      <Link href={`/dashboard/incident/${incident.id}`} className="hover:text-primary-dark transition-colors">
                        {incident.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[incident.status]} text-white`}>
                        {incident.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-text-dark">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${incident.priority === 'High' ? 'bg-red-500' : incident.priority === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'} text-white`}>
                        {incident.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-text-muted">{incident.lastUpdated}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/dashboard/incident/${incident.id}`} className="text-primary-dark hover:text-primary transition-colors">
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
