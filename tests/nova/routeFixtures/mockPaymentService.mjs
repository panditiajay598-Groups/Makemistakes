let deductionCallCount = 0;
let nextDeductResult = null;
let nextDeductError = null;

export class PaymentService {
  static async deductAiCredit() {
    deductionCallCount += 1;
    if (nextDeductError) {
      const err = nextDeductError;
      nextDeductError = null;
      throw err;
    }
    if (nextDeductResult !== null) {
      const result = nextDeductResult;
      nextDeductResult = null;
      return result;
    }
    return { success: true, remainingCredits: 10 };
  }

  static getDeductionCallCount() {
    return deductionCallCount;
  }

  static resetDeductionCallCount() {
    deductionCallCount = 0;
    nextDeductResult = null;
    nextDeductError = null;
  }

  static setNextDeductResult(result) {
    nextDeductResult = result;
  }

  static setNextDeductError(error) {
    nextDeductError = error;
  }
}
