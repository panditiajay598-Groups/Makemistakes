export interface DeductCreditResult {
  success: boolean;
  reason?:
    | "UNAUTHORIZED"
    | "INVALID_COST"
    | "INSUFFICIENT_CREDITS"
    | "USER_NOT_FOUND"
    | "TRANSACTION_FAILED";
  remainingCredits?: number;
}

export interface CreditStoreBalance {
  remainingCredits: number;
  totalCredits: number;
  usedCredits: number;
}

export interface CreditStore {
  /**
   * Atomically decrements remainingCredits by `cost` and increments usedCredits by `cost`
   * ONLY IF remainingCredits >= cost.
   * Must return true if exactly 1 document was updated, false if 0 updated.
   */
  decrementIfSufficient(userId: string, cost: number): Promise<boolean>;

  /**
   * Retrieves current balance fields for the given user.
   */
  getBalance(userId: string): Promise<CreditStoreBalance | null>;

  /**
   * Initializes missing balance record if not present (handles concurrency P2002).
   */
  initializeBalanceIfMissing?(userId: string, defaultCredits?: number): Promise<boolean>;

  /**
   * Records an audit log entry in the transaction history.
   */
  recordTransaction(
    userId: string,
    amount: number,
    type: string,
    referenceId: string,
    balanceAfter: number
  ): Promise<void>;
}

export interface DeductOptions {
  maxRetries?: number;
  retryDelayMs?: number;
  defaultInitialCredits?: number;
}

/**
 * Executes atomic AI credit deduction with guaranteed concurrency safety,
 * race-condition prevention, and automatic retry on transient failures.
 */
export async function deductCreditsAtomically(
  store: CreditStore,
  userId: string,
  cost: number = 1,
  reference: string = "nova_query",
  options: DeductOptions = {}
): Promise<DeductCreditResult> {
  const normalizedUserId = typeof userId === "string" ? userId.trim() : "";
  if (!normalizedUserId) {
    return { success: false, reason: "UNAUTHORIZED" };
  }

  if (typeof cost !== "number" || !Number.isInteger(cost) || cost <= 0) {
    return { success: false, reason: "INVALID_COST" };
  }

  const maxRetries = options.maxRetries ?? 3;
  const retryDelayMs = options.retryDelayMs ?? 10;
  const defaultInitialCredits = options.defaultInitialCredits ?? 100;

  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      // 1. Attempt atomic conditional decrement in the database
      const decremented = await store.decrementIfSufficient(normalizedUserId, cost);

      if (decremented) {
        // Atomic decrement succeeded. Get updated balance and record audit transaction.
        const current = await store.getBalance(normalizedUserId);
        const balanceAfter = current?.remainingCredits ?? 0;

        try {
          await store.recordTransaction(
            normalizedUserId,
            -cost,
            "NOVA_QUERY",
            reference,
            balanceAfter
          );
        } catch (txErr) {
          console.warn("[CreditDeduction] Failed to record credit transaction audit log:", txErr);
        }

        return {
          success: true,
          remainingCredits: balanceAfter,
        };
      }

      // 2. Decrement did not match: check if balance record exists vs insufficient credits
      const balance = await store.getBalance(normalizedUserId);

      if (!balance) {
        // Record does not exist yet. Attempt initialization if supported.
        if (store.initializeBalanceIfMissing) {
          try {
            await store.initializeBalanceIfMissing(normalizedUserId, defaultInitialCredits);
          } catch {
            // Concurrent initialization might have occurred; retry loop will verify
          }
          attempt++;
          if (attempt <= maxRetries) {
            if (retryDelayMs > 0) {
              await new Promise((r) => setTimeout(r, retryDelayMs));
            }
            continue;
          }
        }
        return {
          success: false,
          reason: "USER_NOT_FOUND",
          remainingCredits: 0,
        };
      }

      // Record exists and remainingCredits < cost -> Definite insufficient credits
      return {
        success: false,
        reason: "INSUFFICIENT_CREDITS",
        remainingCredits: balance.remainingCredits,
      };
    } catch (err: any) {
      attempt++;
      if (attempt <= maxRetries) {
        if (retryDelayMs > 0) {
          await new Promise((r) => setTimeout(r, retryDelayMs));
        }
        continue;
      }
      return {
        success: false,
        reason: "TRANSACTION_FAILED",
      };
    }
  }

  return {
    success: false,
    reason: "TRANSACTION_FAILED",
  };
}

