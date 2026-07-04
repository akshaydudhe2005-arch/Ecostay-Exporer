'use client';

import { useState } from 'react';
import { Button, Input, Modal, Toast } from '@/components/ui';

export default function ShowcasePage() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Modal display states
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  // Email evaluation state
  const [emailInput, setEmailInput] = useState('');

  // Toast alert system states
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState<'success' | 'info' | 'error'>('success');

  // Trigger notification utility
  const triggerToast = (message: string, variant: 'success' | 'info' | 'error') => {
    setToastMessage(message);
    setToastVariant(variant);
    setToastVisible(true);
  };

  // Basic email pattern check
  const handleValidateEmail = () => {
    if (!emailInput.trim()) {
      triggerToast('Please enter an email address first.', 'info');
      return;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailPattern.test(emailInput)) {
      triggerToast('Valid email layout confirmed!', 'success');
    } else {
      triggerToast('Invalid email structural format.', 'error');
    }
  };

  return (
    <main className={`min-h-screen p-8 transition-colors duration-200 ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <div className="mx-auto max-w-5xl space-y-8">
        
        {/* Header Block */}
        <header className="flex flex-col justify-between gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-center dark:border-gray-700">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">UI Component Showcase</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Week 3 assignment evaluation demo — interactive test cards for grading reviewers.
            </p>
          </div>
          <Button 
            variant="secondary" 
            size="md" 
            onClick={() => {
              setIsDarkMode(!isDarkMode);
              triggerToast(`Switched to ${!isDarkMode ? 'Dark' : 'Light'} Mode`, 'info');
            }}
          >
            {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </Button>
        </header>

        {/* Dynamic Grid Matrix */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          
          {/* Button Interactive Frame */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-850 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Button</h2>
            <div className="flex flex-wrap gap-2">
              <Button variant="primary" size="sm" onClick={() => triggerToast('Small Primary Clicked', 'success')}>Primary SM</Button>
              <Button variant="primary" size="md" onClick={() => triggerToast('Medium Primary Clicked', 'success')}>Primary MD</Button>
              <Button variant="primary" size="lg" onClick={() => triggerToast('Large Primary Clicked', 'success')}>Primary LG</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="md" onClick={() => triggerToast('Secondary Action Registered', 'info')}>Secondary</Button>
              <Button variant="danger" size="md" onClick={() => triggerToast('Dangerous Path Confirmed', 'error')}>Danger</Button>
              <Button variant="primary" size="md" disabled>Disabled</Button>
            </div>
            <Button variant="primary" size="md" className="w-full" onClick={() => setIsDemoModalOpen(true)}>
              Open Modal
            </Button>
          </section>

          {/* Input Control Frame */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-850 flex flex-col justify-between">
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Input</h2>
              <Input
                label="EMAIL ADDRESS"
                type="email"
                placeholder="you@example.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
              />
            </div>
            <Button variant="primary" size="md" className="w-full mt-4" onClick={handleValidateEmail}>
              Validate Email
            </Button>
          </section>

          {/* Modal Testing Frame */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-850 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Modal</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Click &quot;Open Modal&quot; in the Button card or the button below.
            </p>
            <Button variant="secondary" size="md" onClick={() => setIsDemoModalOpen(true)}>
              Show Modal
            </Button>
          </section>

          {/* Toast Event Fire Frame */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-850 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Toast</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Auto-dismisses after 4 seconds via duration timer hook.
            </p>
            <div className="flex gap-2">
              <Button variant="primary" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white border-none" onClick={() => triggerToast('Operation completed successfully!', 'success')}>Success</Button>
              <Button variant="secondary" size="sm" onClick={() => triggerToast('System status information update.', 'info')}>Info</Button>
              <Button variant="danger" size="sm" onClick={() => triggerToast('An operational malfunction occurred.', 'error')}>Error</Button>
            </div>
          </section>

        </div>
      </div>

      {/* Global Portal Overlay Container Components */}
      <Modal 
        isOpen={isDemoModalOpen} 
        onClose={() => setIsDemoModalOpen(false)} 
        title="Interactive Component Test"
      >
        <div className="space-y-4 mt-2">
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            This modular popup test environment confirms that your state management overlays overlay perfectly above lower-level DOM nodes.
          </p>
          <div className="flex justify-end pt-2">
            <Button variant="primary" size="md" onClick={() => setIsDemoModalOpen(false)}>
              Close Window
            </Button>
          </div>
        </div>
      </Modal>

      <Toast
        message={toastMessage}
        variant={toastVariant}
        visible={toastVisible}
        onDismiss={() => setToastVisible(false)}
      />
    </main>
  );
}