'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';
import { Play, Shield, Loader2, Terminal, Settings, RefreshCw, Link2, Key, Sparkles, ArrowRight, Plus, List } from 'lucide-react';
import { TabButton } from '../components/TabButton';

const CodeEditor = dynamic(() => import('../components/CodeEditor'), {
  ssr: false,
  loading: () => <div className="text-gray-500 p-4">Loading Editor...</div>
});

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'source' | 'tests' | 'config'>('source');
  const [sourceCode, setSourceCode] = useState('// Write your application logic here\nfunction add(a, b) {\n  return a + b;\n}');
  const [testCode, setTestCode] = useState('// Write your unit tests here\nconsole.log(add(1, 2));');

  // Jenkins & AI State
  const [jenkinsUrl, setJenkinsUrl] = useState('');
  const [jenkinsUser, setJenkinsUser] = useState('');
  const [jenkinsToken, setJenkinsToken] = useState('');
  const [jobName, setJobName] = useState('');
  const [customReqs, setCustomReqs] = useState('');
  const [availableJobs, setAvailableJobs] = useState<string[]>([]);
  const [isCustomJob, setIsCustomJob] = useState(false);

  // UI State
  const [isFetchingJobs, setIsFetchingJobs] = useState(false);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const addLog = (msg: string, type: 'info' | 'error' | 'warning' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
    setLogs(prev => [`[${timestamp}] ${prefix} ${msg}`, ...prev]);
  };

  // --- Handlers ---

  const handleAiCodeGeneration = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiGenerating(true);
    addLog(`Asking AI: "${aiPrompt}"...`);
    try {
      const { data } = await axios.post(`${API_URL}/ai/generate-code`, { prompt: aiPrompt });
      setSourceCode(data.code);
      addLog('AI generated code.', 'info');
      setAiPrompt('');
    } catch (error) { addLog('AI Generation failed.', 'error'); }
    finally { setIsAiGenerating(false); }
  };

  // RESTORED: Test Generation Handler
  const handleAiTestGeneration = async () => {
    if (!sourceCode.trim()) return;
    setIsAiGenerating(true);
    addLog(`Analyzing source code to generate tests...`);

    try {
      const { data } = await axios.post(`${API_URL}/ai/generate-tests`, { contextCode: sourceCode });
      setTestCode(data.code);
      addLog('AI generated unit tests successfully.', 'info');
    } catch (error) {
      addLog('Failed to generate tests via AI.', 'error');
    } finally {
      setIsAiGenerating(false);
    }
  };

  const fetchJenkinsJobs = async () => {
    if (!jenkinsUrl || !jenkinsUser || !jenkinsToken) return;
    setIsFetchingJobs(true);
    try {
      const { data } = await axios.get(`${API_URL}/jenkins/jobs`, {
        params: { url: jenkinsUrl, user: jenkinsUser, token: jenkinsToken }
      });
      if (Array.isArray(data)) {
        setAvailableJobs(data);
        if (data.length > 0 && !isCustomJob) setJobName(data[0]);
        addLog(`Connected: Found ${data.length} jobs.`, 'info');
      }
    } catch (error) { console.warn("Fetch jobs failed"); }
    finally { setIsFetchingJobs(false); }
  };

  const handleTriggerBuild = async () => {
    if (!jenkinsUrl || !jenkinsUser || !jenkinsToken) {
      addLog(`Missing Credentials. Check Config tab.`, 'error');
      setActiveTab('config');
      return;
    }

    if (!jobName) {
      addLog(`Please enter a Pipeline Name.`, 'warning');
      return;
    }

    setLoading(true);
    addLog(`Initiating build for: ${jobName}...`);

    try {
      const { data } = await axios.post(`${API_URL}/jenkins/build`, {
        sourceCode,
        testCode,
        jobName,
        jenkinsUrl,
        jenkinsUser,
        jenkinsToken,
        customRequirements: customReqs,
        provision: true
      });

      addLog(`SUCCESS: ${data.message}`, 'info');
      if (data.queueLocation) addLog(`Queue URL: ${data.queueLocation}`, 'info');

    } catch (error: any) {
      const errMsg = error.response?.data?.message || 'Connection Failed';
      addLog(`ERROR: ${errMsg}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderConfig = () => (
    <div className="p-8 space-y-6 bg-[#1e1e1e] h-full overflow-y-auto">
      <h2 className="text-xl font-bold border-b border-gray-700 pb-3">Jenkins Settings</h2>
      <div className="space-y-4">
        <label className="text-sm text-gray-300">Jenkins URL</label>
        <input type="url" value={jenkinsUrl} onChange={e => setJenkinsUrl(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-2 outline-none" placeholder="http://10.0.0.5:8080" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="text-sm text-gray-300">User</label><input type="text" value={jenkinsUser} onChange={e => setJenkinsUser(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-2 outline-none" /></div>
        <div><label className="text-sm text-gray-300">Token</label><input type="password" value={jenkinsToken} onChange={e => setJenkinsToken(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-2 outline-none" /></div>
      </div>
      <div className="flex justify-end">
        <button onClick={fetchJenkinsJobs} disabled={isFetchingJobs} className="flex items-center gap-2 rounded px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold">
          {isFetchingJobs ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />} Test Connection
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen flex-col bg-black text-gray-100 font-sans overflow-hidden">
      <header className="flex h-16 items-center justify-between border-b border-gray-800 bg-[#0d0d0d] px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
            <Link2 size={20} className="text-blue-500" />Code<span className="text-blue-500">Lens</span>
          </h1>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded bg-gray-900 px-3 py-1 border border-gray-800">
              <Settings size={14} className="text-gray-500" />

              {availableJobs.length > 0 && !isCustomJob ? (
                <>
                  <select
                    value={jobName}
                    onChange={e => setJobName(e.target.value)}
                    className="bg-transparent text-sm text-gray-300 outline-none w-32 cursor-pointer appearance-none"
                  >
                    {availableJobs.map(j => <option key={j} value={j} className="bg-gray-900">{j}</option>)}
                  </select>
                  <button
                    onClick={() => { setIsCustomJob(true); setJobName(''); }}
                    className="p-1 hover:bg-gray-800 rounded text-blue-400"
                    title="Create New Job"
                  >
                    <Plus size={14} />
                  </button>
                </>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="New Pipeline Name"
                    value={jobName}
                    onChange={e => setJobName(e.target.value)}
                    className="bg-transparent text-sm text-gray-300 outline-none w-36 placeholder:text-gray-600"
                  />
                  {availableJobs.length > 0 && (
                    <button
                      onClick={() => { setIsCustomJob(false); if (availableJobs.length > 0) setJobName(availableJobs[0]); }}
                      className="p-1 hover:bg-gray-800 rounded text-gray-400"
                      title="Back to List"
                    >
                      <List size={14} />
                    </button>
                  )}
                </>
              )}
            </div>

            <input
              type="text"
              placeholder="Custom requirements (e.g. 'Use node 18, install aws-cli')"
              value={customReqs}
              onChange={e => setCustomReqs(e.target.value)}
              className="bg-gray-900 border border-gray-800 rounded px-3 py-1 text-sm text-gray-300 w-64 focus:border-blue-500 outline-none placeholder:text-gray-600"
            />
          </div>
        </div>

        <button onClick={handleTriggerBuild} disabled={loading} className={`flex items-center gap-2 rounded px-5 py-2 text-sm font-bold ${loading ? 'bg-gray-800 text-gray-500' : 'bg-green-600 hover:bg-green-500 text-white'}`}>
          {loading ? <Loader2 className="animate-spin" size={16} /> : <Play size={16} />} {loading ? 'Building...' : 'Run Pipeline'}
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-16 flex flex-col items-center gap-2 border-r border-gray-800 bg-[#0d0d0d] py-4">
          <TabButton active={activeTab === 'source'} onClick={() => setActiveTab('source')} icon={<Terminal size={20} />} label="Code" />
          <TabButton active={activeTab === 'tests'} onClick={() => setActiveTab('tests')} icon={<Shield size={20} />} label="Tests" />
          <TabButton active={activeTab === 'config'} onClick={() => setActiveTab('config')} icon={<Key size={20} />} label="Config" />
        </aside>

        <main className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e]">
          {activeTab === 'config' ? renderConfig() : (
            <div className="flex-1 flex flex-col relative h-full">

              {/* Source Code AI Bar */}
              {activeTab === 'source' && (
                <div className="bg-[#141414] border-b border-gray-800 p-2 flex gap-2">
                  <div className="flex-1 flex items-center bg-gray-900 rounded-md border border-gray-700 px-3">
                    <Sparkles size={16} className="text-purple-400 mr-2" />
                    <input type="text" value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAiCodeGeneration()} placeholder="AI Generate Code..." className="flex-1 bg-transparent border-none outline-none text-sm text-gray-200 h-9" />
                  </div>
                  <button onClick={handleAiCodeGeneration} disabled={isAiGenerating} className="bg-purple-600 hover:bg-purple-500 text-white px-4 rounded-md text-sm font-medium flex items-center gap-2">
                    {isAiGenerating ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />} Generate
                  </button>
                </div>
              )}

              {/* RESTORED: Tests AI Bar */}
              {activeTab === 'tests' && (
                <div className="bg-[#141414] border-b border-gray-800 p-2 flex justify-between items-center px-4">
                  <span className="text-xs text-gray-400">Generate tests based on your source code.</span>
                  <button
                    onClick={handleAiTestGeneration}
                    disabled={isAiGenerating}
                    className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-1.5 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isAiGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                    Generate AI Tests
                  </button>
                </div>
              )}

              <div className="flex-1 overflow-hidden">
                <CodeEditor
                  code={activeTab === 'source' ? sourceCode : testCode}
                  onChange={(val) => activeTab === 'source' ? setSourceCode(val || '') : setTestCode(val || '')}
                  language="javascript"
                />
              </div>
            </div>
          )}

          <div className="h-48 border-t border-gray-800 bg-[#0d0d0d] flex flex-col">
            <div className="flex items-center px-4 py-2 border-b border-gray-800 bg-[#141414]"><span className="text-xs font-mono font-bold text-gray-500 uppercase">System Logs</span></div>
            <div className="flex-1 p-4 font-mono text-sm overflow-y-auto space-y-1">
              {logs.map((log, i) => <div key={i} className="text-gray-300 break-words">{log}</div>)}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}