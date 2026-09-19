import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, Terminal, AlertTriangle, CheckCircle2, Info, Loader2 } from 'lucide-react';
import Button from '../ui/Button';

export default function AIActionConfirmation({
  isOpen,
  onClose,
  onConfirm,
  action = {
    actionType: 'Create Task',
    title: 'Follow-up Task for Event Logistics',
    details: '—',
    target: '—',
  },
}) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isExecuting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isExecuting]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsExecuting(true);
    setFeedback(null);
    try {
      if (onConfirm) {
        await onConfirm(action);
      }
      setFeedback({
        type: 'success',
        message: `Action "${action.title || action.actionType}" confirmed and executed successfully!`,
      });
      setTimeout(() => {
        setIsExecuting(false);
        setFeedback(null);
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Action execution failed:', err);
      setFeedback({
        type: 'error',
        message: err.message || 'Action execution failed. Please check parameters and retry.',
      });
      setIsExecuting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={() => !isExecuting && onClose()}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-[#111827] border border-[#263247] rounded-2xl shadow-2xl overflow-hidden my-8 z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#263247] bg-[#151D2E]/80">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Confirm AI Action</h3>
              <p className="text-xs text-gray-400">Human-in-the-loop authorization</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isExecuting}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#263247] transition-colors disabled:opacity-50"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feedback Banner */}
        {feedback && (
          <div className={`mx-6 mt-4 p-3.5 rounded-xl flex items-start space-x-2.5 text-xs ${
            feedback.type === 'success'
              ? 'bg-emerald-950/50 border border-emerald-500/30 text-emerald-200'
              : feedback.type === 'error'
              ? 'bg-rose-950/50 border border-rose-500/30 text-rose-200'
              : 'bg-purple-950/50 border border-purple-500/30 text-purple-200'
          }`}>
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : feedback.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            ) : (
              <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            )}
            <div>
              <span className="font-semibold text-white">Status: </span>
              {feedback.message}
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <div className="text-xs text-gray-400">
            ClubOps AI wants to perform the following operational mutation:
          </div>

          <div className="p-4 rounded-xl bg-[#151D2E] border border-[#263247] space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#263247]/60">
              <span className="text-gray-400">Action</span>
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-purple-400" />
                {action.actionType || 'Create Task'}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-gray-400 block">Proposed Title</span>
              <span className="text-gray-200 font-medium block">
                {action.title || 'Action title pending'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <span className="text-gray-400 block text-[11px]">Target Module</span>
                <span className="text-indigo-400 font-mono text-[11px]">
                  {action.target || action.targetModule || '—'}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block text-[11px]">Parameters</span>
                <span className="text-gray-300 font-mono text-[11px]">
                  {action.details || '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Security & Scope Notice */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start space-x-2.5 text-xs text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-amber-300">Workspace Impact: </span>
              This action will modify your club workspace records once confirmed.
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-[#263247] bg-[#151D2E]/60">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isExecuting}
          >
            Cancel
          </Button>
          <Button
            variant="ai"
            size="sm"
            onClick={handleConfirm}
            isLoading={isExecuting}
          >
            Confirm Action
          </Button>
        </div>
      </div>
    </div>
  );
}
