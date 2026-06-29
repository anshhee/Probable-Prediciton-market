'use client';

import { useState, useEffect, FormEvent } from 'react';
import { isAddress } from 'viem';
import { useCreateMarket } from '@/hooks/useCreateMarket';
import styles from './CreateMarketForm.module.css';

interface CreateMarketFormProps {
  /** Called after a market is successfully confirmed on-chain. */
  onSuccess?: () => void;
}

interface FormErrors {
  question?: string;
  endTime?: string;
  oracle?: string;
}

/**
 * Presentational form for creating a new prediction market.
 *
 * Validation and submission state live here; all blockchain interaction
 * is delegated to the `useCreateMarket` hook.
 */
export default function CreateMarketForm({ onSuccess }: CreateMarketFormProps) {
  const [question, setQuestion] = useState('');
  const [endTime, setEndTime]   = useState('');
  const [oracle, setOracle]     = useState('');
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const {
    createMarket,
    isPending,
    isConfirming,
    isSuccess,
    error: contractError,
    reset,
  } = useCreateMarket();

  // ── Auto-reset form + notify parent after confirmed tx ──────────────────────
  useEffect(() => {
    if (isSuccess) {
      setQuestion('');
      setEndTime('');
      setOracle('');
      setFormErrors({});
      onSuccess?.();
      reset();
    }
  }, [isSuccess, onSuccess, reset]);

  // ── Client-side validation ───────────────────────────────────────────────────
  function validate(): boolean {
    const errors: FormErrors = {};

    if (!question.trim()) {
      errors.question = 'Question is required.';
    }

    if (!endTime) {
      errors.endTime = 'End time is required.';
    } else {
      const selectedMs = new Date(endTime).getTime();
      if (selectedMs <= Date.now()) {
        errors.endTime = 'End time must be in the future.';
      }
    }

    if (!oracle.trim()) {
      errors.oracle = 'Oracle address is required.';
    } else if (!isAddress(oracle)) {
      errors.oracle = 'Must be a valid Ethereum address (0x…).';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  // ── Submit handler ───────────────────────────────────────────────────────────
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;

    const endTimestamp = BigInt(Math.floor(new Date(endTime).getTime() / 1000));
    createMarket(question.trim(), endTimestamp, oracle as `0x${string}`);
  }

  const isBusy = isPending || isConfirming;

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <h2 className={styles.heading}>Create a Market</h2>

      {/* ── Question ──────────────────────────────────────────────────────── */}
      <div className={styles.field}>
        <label htmlFor="cm-question" className={styles.label}>
          Question
        </label>
        <input
          id="cm-question"
          type="text"
          className={`${styles.input} ${formErrors.question ? styles.inputError : ''}`}
          placeholder="Will ETH reach $5 000 by end of 2025?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={isBusy}
        />
        {formErrors.question && (
          <p className={styles.fieldError}>{formErrors.question}</p>
        )}
      </div>

      {/* ── End Time ──────────────────────────────────────────────────────── */}
      <div className={styles.field}>
        <label htmlFor="cm-endtime" className={styles.label}>
          End Time
        </label>
        <input
          id="cm-endtime"
          type="datetime-local"
          className={`${styles.input} ${formErrors.endTime ? styles.inputError : ''}`}
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          disabled={isBusy}
        />
        {formErrors.endTime && (
          <p className={styles.fieldError}>{formErrors.endTime}</p>
        )}
      </div>

      {/* ── Oracle Address ────────────────────────────────────────────────── */}
      <div className={styles.field}>
        <label htmlFor="cm-oracle" className={styles.label}>
          Oracle Address
        </label>
        <input
          id="cm-oracle"
          type="text"
          className={`${styles.input} ${formErrors.oracle ? styles.inputError : ''}`}
          placeholder="0x…"
          value={oracle}
          onChange={(e) => setOracle(e.target.value)}
          disabled={isBusy}
        />
        {formErrors.oracle && (
          <p className={styles.fieldError}>{formErrors.oracle}</p>
        )}
      </div>

      {/* ── Contract error ────────────────────────────────────────────────── */}
      {contractError && (
        <p className={styles.contractError}>
          {contractError.message.split('\n')[0]}
        </p>
      )}

      {/* ── Submit button ─────────────────────────────────────────────────── */}
      <button
        id="cm-submit"
        type="submit"
        className={styles.button}
        disabled={isBusy}
      >
        {isPending
          ? 'Confirm in wallet…'
          : isConfirming
          ? 'Mining…'
          : 'Create Market'}
      </button>
    </form>
  );
}
