import React, { memo, useState, useEffect, useRef, useCallback } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import QRScanner from './QRScanner';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (bioId: string) => void;
}

const QRScannerModal: React.FC<QRScannerModalProps> = memo(({ isOpen, onClose, onScan }) => {
  const [error, setError] = useState<string | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const handleClose = useCallback(() => {
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
    setError(null);
    onClose();
  }, [onClose]);

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  // Handle cleanup when the modal closes
  useEffect(() => {
    if (!isOpen && cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
  }, [isOpen]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, []);

  const setCleanupFunction = useCallback((cleanup: () => void) => {
    cleanupRef.current = cleanup;
  }, []);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog 
        as="div" 
        className="relative z-50" 
        onClose={handleClose}
        static
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/75" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Scan BioID QR Code
                  </Dialog.Title>
                  <button
                    onClick={handleClose}
                    type="button"
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <div className="mt-4">
                  {isOpen && (
                    <QRScanner 
                      onScan={(scannedBioId) => {
                        if (cleanupRef.current) {
                          cleanupRef.current();
                          cleanupRef.current = null;
                        }
                        setError(null);
                        onScan(scannedBioId);
                        handleClose();
                      }}
                      onError={handleError}
                      onClose={handleClose}
                    />
                  )}
                </div>

                <div className="mt-4 pt-3 border-t">
                  <p className="text-sm text-gray-500 mb-4">
                    Make sure your camera has permission and the QR code is clearly visible.
                  </p>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                    onClick={handleClose}
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
});

QRScannerModal.displayName = 'QRScannerModal';

export default QRScannerModal;