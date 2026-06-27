'use client';

import { useEffect, useState } from 'react';
import { Button, Input, Loader, Modal, Toast } from '@/components/ui';
import type { ToastVariant } from '@/components/ui';

export default function ShowcasePage() {
  const [isDark, setIsDark] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastVariant, setToastVariant] = useState<ToastVariant>('success');
  const [toastMessage, setToastMessage] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  const showToast = (variant: ToastVariant, message: string) => {
    setToastVariant(variant);
    setToastMessage(message);
    setToastVisible(true);
  };

  const validateEmail = () => {
    if (!email.trim()) {
      setEmailError('Email is required.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    setEmailError('');
    showToast('success', 'Email validation passed!');
  };

  return (
    <main className="w-full flex-1 bg-gray-50 px-4 py-8 transition-colors dark:bg-gray-900 sm:px-6 lg:px-8">
      <div className="mx-auto w-full md:max-w-4xl">
        <header className="mb-8 flex flex-col gap-4 border-b border-gray-200 pb-6 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl">
              UI Component Showcase
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Week 3 assignment evaluation demo — interactive test cards for grading reviewers.
            </p>
          </div>
          <Button variant="secondary" size="md" onClick={toggleTheme}>
            {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </Button>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Button</h2>
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                <Button variant="primary" size="sm">Primary SM</Button>
                <Button variant="primary" size="md">Primary MD</Button>
                <Button variant="primary" size="lg">Primary LG</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" size="md">Secondary</Button>
                <Button variant="danger" size="md">Danger</Button>
                <Button variant="primary" size="md" disabled>Disabled</Button>
              </div>
              <Button variant="primary" size="md" onClick={() => setIsModalOpen(true)}>
                Open Modal
              </Button>
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Input</h2>
            <div className="flex flex-col gap-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError('');
                }}
                error={emailError}
              />
              <Button variant="primary" size="md" onClick={validateEmail}>
                Validate Email
              </Button>
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Modal</h2>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Click &quot;Open Modal&quot; in the Button card or the button below.
            </p>
            <Button variant="secondary" size="md" onClick={() => setIsModalOpen(true)}>
              Show Modal
            </Button>
            <Modal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              title="EcoStay Explorer"
            >
              <p className="mb-4">
                Dialog with backdrop blur, body scroll lock, and onClose callback.
              </p>
              <Button variant="primary" size="md" onClick={() => setIsModalOpen(false)}>
                Close Modal
              </Button>
            </Modal>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Toast</h2>
            <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
              Auto-dismisses after 4 seconds via duration timer hook.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => showToast('success', 'Booking confirmed successfully!')}
              >
                Success
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => showToast('info', 'New eco-stays available near you.')}
              >
                Info
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => showToast('error', 'Unable to process your request.')}
              >
                Error
              </Button>
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:col-span-2 dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Loader</h2>
              <Button variant="secondary" size="sm" onClick={() => setShowLoader((prev) => !prev)}>
                {showLoader ? 'Hide Loader' : 'Show Loader'}
              </Button>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-10 py-6">
              {showLoader && <Loader label="Loading eco-stays..." size="md" />}
              <Loader size="sm" />
              <Loader size="lg" />
            </div>
          </section>
        </div>
      </div>

      <Toast
        message={toastMessage}
        variant={toastVariant}
        visible={toastVisible}
        onDismiss={() => setToastVisible(false)}
      />
    </main>
  );
}
