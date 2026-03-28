import React from 'react';
import { Shield, Clock, Download, Trash2, ExternalLink, Github } from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  return (
    <div className="min-h-screen bg-[#f9fafb] text-[#111827] font-sans selection:bg-blue-100">
      {/* Hero Section */}
      <header className="max-w-5xl mx-auto px-6 pt-24 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-medium mb-6">
            <Shield size={16} />
            <span>Chrome & Edge Compatible</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-gray-900 to-gray-600">
            Browser Activity Tracker
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            A lightweight, privacy-first browser extension to monitor your digital footprint. 
            Track time spent on websites, filter noise, and export your data anytime.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="px-8 py-4 bg-red-50 border border-red-100 text-red-600 rounded-xl font-semibold flex items-center gap-2">
              <Clock size={20} />
              Important: Re-export ZIP after any changes
            </div>
            <button className="px-8 py-4 bg-white border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center gap-2">
              <Github size={20} />
              View Source
            </button>
          </div>
        </motion.div>
      </header>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Clock className="text-blue-500" />}
            title="Floating Clock"
            description="A draggable, real-time dial that appears on your pages to help you stay mindful of your time."
          />
          <FeatureCard 
            icon={<Shield className="text-green-500" />}
            title="Privacy First"
            description="All data stays in your browser's local storage. No servers, no tracking, no data leaks."
          />
          <FeatureCard 
            icon={<Download className="text-purple-500" />}
            title="Export & Reset"
            description="Download your complete history as a JSON file or wipe it clean with a single click."
          />
        </div>
      </section>

      {/* Safety & Isolation */}
      <section className="max-w-4xl mx-auto px-6 py-20 border-t border-gray-100">
        <div className="bg-blue-50 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row gap-8 items-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-200">
            <Shield className="text-white" size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4">Safety & Isolation Guarantee</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              This extension operates in a strict <strong>Sandbox Environment</strong>. It is technically impossible for it to access or modify your browser's core data outside of its own storage.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 text-sm font-medium">
              <div className="flex items-center gap-2 text-green-600">
                <div className="w-1.5 h-1.5 rounded-full bg-green-600" />
                No access to Passwords
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <div className="w-1.5 h-1.5 rounded-full bg-green-600" />
                No access to Bookmarks
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <div className="w-1.5 h-1.5 rounded-full bg-green-600" />
                Won't touch Browser History
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <div className="w-1.5 h-1.5 rounded-full bg-green-600" />
                Isolated from other Extensions
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* User Guide */}
      <section className="max-w-4xl mx-auto px-6 py-20 border-t border-gray-100 bg-white rounded-3xl my-12 shadow-sm">
        <h2 className="text-3xl font-bold mb-8 text-center">User Guide</h2>
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <ExternalLink className="text-blue-500" size={20} />
              How it tracks
            </h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span><strong>Active Only:</strong> It only counts time when the tab is active and the window is focused.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span><strong>3s Filter:</strong> Visits shorter than 3 seconds are ignored to prevent noise.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span><strong>Idle Pause:</strong> If you don't move your mouse for 10 minutes, tracking pauses automatically.</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Download className="text-green-500" size={20} />
              Managing Data
            </h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span><strong>View Top 5:</strong> Click the extension icon in your toolbar to see your most visited sites.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span><strong>Export:</strong> Use the "Export JSON" button in the popup to save your history locally.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span><strong>Reset:</strong> Clear all your tracking data anytime with the "Reset" button.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Installation Guide */}
      <section className="max-w-4xl mx-auto px-6 py-20 border-t border-gray-100">
        <h2 className="text-3xl font-bold mb-12 text-center">How to Install</h2>
        <div className="space-y-8">
          <Step 
            number="01" 
            title="Re-export the Project" 
            description="Since I just fixed the icon error, you MUST click the 'Settings' (gear icon) -> 'Export to ZIP' again to get the updated files."
          />
          <Step 
            number="02" 
            title="Open Extensions Page" 
            description="Go to chrome://extensions (Chrome) or edge://extensions (Edge) in your browser."
          />
          <Step 
            number="03" 
            title="Enable Developer Mode" 
            description="Toggle the 'Developer mode' switch in the top right corner."
          />
          <Step 
            number="04" 
            title="Load the 'public' Folder" 
            description="Click 'Load unpacked' and select the 'public' folder inside the extracted project directory. This folder contains the manifest.json file."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-6 py-12 border-t border-gray-100 text-center text-gray-500 text-sm">
        <p>© 2026 Browser Activity Tracker. Built for privacy.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-8 bg-white rounded-2xl border border-gray-100 shadow-sm"
    >
      <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </motion.div>
  );
}

function Step({ number, title, description }) {
  return (
    <div className="flex gap-6 items-start">
      <span className="text-4xl font-black text-gray-100 select-none">{number}</span>
      <div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
}
