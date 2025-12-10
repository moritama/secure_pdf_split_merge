import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import MergeView from './components/Merge/MergeView';
import SplitView from './components/Split/SplitView';
import { GlobalWorkerOptions } from 'pdfjs-dist';
// Import worker as URL
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min?url';

// Initialize PDF Worker
GlobalWorkerOptions.workerSrc = pdfWorker;

function App() {
  const [activeTab, setActiveTab] = useState('split');

  return (
    <>
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="layout-container animate-fade-in">
        {activeTab === 'merge' ? <MergeView /> : <SplitView />}
      </main>
    </>
  );
}

export default App;
