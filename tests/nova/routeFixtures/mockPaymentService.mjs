export class PaymentService {
  static async deductAiCredit() {
    return { success: true, remainingCredits: 10 };
  }
}
