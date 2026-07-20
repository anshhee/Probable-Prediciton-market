'use client';

import { useState, useEffect, FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { Market } from '@/types/market';
import { useBuyShares } from '@/hooks/useBuyShares';
import styles from './TradeModal.module.css';

interface TradeModalProps {
  market: Market;
  isYes: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Modal for buying YES or NO shares on a prediction market.
 *
 * Presentational layer only — all blockchain interaction is delegated
 * to the `useBuyShares` hook.
 */
export default function TradeModal({
  market,
  isYes,
  onClose,
  onSuccess,
}: TradeModalProps) {
  const [amount, setAmount] = useState('');
  const [amountError, setAmountError] = useState('');

  const {
    buyShares,
    isPending,
    isConfirming,
    isSuccess,
    error: contractError,
    reset,
  } = useBuyShares();

  // Close + refetch after confirmed transaction
  useEffect(() => {
    if (isSuccess) {
      onSuccess();
      onClose();
      reset();
    }
  }, [isSuccess, onSuccess, onClose, reset]);

  // Close on Escape key
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  function validate(): boolean {
    const parsed = parseFloat(amount);
    if (!amount || isNaN(parsed) || parsed <= 0) {
      setAmountError('Amount must be greater than zero.');
      return false;
    }
    setAmountError('');
    return true;
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;
    buyShares(market.id, isYes, amount);
  }

  const isBusy = isPending || isConfirming;

  const directionLabel = isYes ? 'YES' : 'NO';
  const submitBtnClass = `${styles.submitBtn} ${
    isYes ? styles.submitBtnYes : styles.submitBtnNo
  }`;

  const content = (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="trade-modal-title"
    >
      <div className={styles.modal}>
        {/* Header */}
        <header className={styles.modalHeader}>
          <h2 id="trade-modal-title" className={styles.modalTitle}>
            Buy Shares — Market #{market.id.toString()}
          </h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close modal"
            disabled={isBusy}
          >
            ✕
          </button>
        </header>

        {/* Direction badge */}
        <span
          className={`${styles.directionBadge} ${
            isYes ? styles.badgeYes : styles.badgeNo
          }`}
        >
          {directionLabel}
        </span>

        <form onSubmit={handleSubmit} noValidate>
          {/* ETH amount field */}
          <div className={styles.field}>
            <label htmlFor="trade-amount" className={styles.label}>
              ETH Amount
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="trade-amount"
                type="number"
                step="any"
                min="0"
                className={`${styles.input} ${amountError ? styles.inputError : ''}`}
                placeholder="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isBusy}
                autoFocus
              />
              <span className={styles.inputSuffix}>ETH</span>
            </div>
            {amountError && (
              <p className={styles.fieldError}>{amountError}</p>
            )}
          </div>

          {/* Contract-level error */}
          {contractError && (
            <p className={styles.contractError}>
              {contractError.message.split('\n')[0]}
            </p>
          )}

          {/* Actions */}
          <div className={styles.actions} style={{ marginTop: '1rem' }}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={isBusy}
            >
              Cancel
            </button>
            <button
              id="trade-submit"
              type="submit"
              className={submitBtnClass}
              disabled={isBusy}
            >
              {isPending
                ? 'Confirm in wallet…'
                : isConfirming
                ? 'Mining…'
                : `Buy ${directionLabel}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Render into document.body to escape any stacking context
  return createPortal(content, document.body);
}
