/**
 * ADAPTER PATTERN - Paiements
 *
 * Problème:
 * - On a un CheckoutService qui utilise l'ancienne API Paypal (LegacyPaypal)
 * - Le manager veut intégrer Stripe (StripeModernAPI) mais ses méthodes sont différentes
 * - Stripe demande les montants en centimes et la devise
 * - On n'a pas le droit de modifier CheckoutService ni Stripe
 *
 * Solution:
 * Créer un StripeAdapter qui implémente l'interface IPaymentProcessor
 * L'adaptateur enveloppe Stripe et le rend compatible avec notre système
 */

// ============================================
// INTERFACES
// ============================================

/**
 * Interface standard du système existant
 */
interface IPaymentProcessor {
  pay(amountInEuros: number): Promise<void>;
}

// ============================================
// ANCIENNES API (LEGACY)
// ============================================

/**
 * Ancienne API Paypal - fonctionne avec des euros
 */
class LegacyPaypal implements IPaymentProcessor {
  async pay(amountInEuros: number): Promise<void> {
    console.log(
      `[LegacyPaypal] Processing payment of €${amountInEuros.toFixed(2)}`
    );
    // Logic ancienne de Paypal...
    await new Promise((resolve) => setTimeout(resolve, 100));
    console.log(`[LegacyPaypal] Payment successful!`);
  }
}

// ============================================
// NOUVELLE API (À ADAPTER)
// ============================================

/**
 * Nouvelle API Stripe - incompatible!
 * - Demande montant en centimes
 * - Demande la devise
 * - Méthode différente
 */
class StripeModernAPI {
  async charge(amountInCents: number, currency: string): Promise<void> {
    console.log(
      `[StripeModernAPI] Charging ${(amountInCents / 100).toFixed(2)} ${currency}`
    );
    // Logic moderne de Stripe...
    await new Promise((resolve) => setTimeout(resolve, 150));
    console.log(`[StripeModernAPI] Charge successful!`);
  }
}

// ============================================
// ADAPTER PATTERN
// ============================================

/**
 * StripeAdapter - Enveloppe Stripe pour le rendre compatible
 * Implémente IPaymentProcessor mais encapsule StripeModernAPI
 */
class StripeAdapter implements IPaymentProcessor {
  private stripe: StripeModernAPI;

  constructor(stripe: StripeModernAPI) {
    this.stripe = stripe;
  }

  async pay(amountInEuros: number): Promise<void> {
    // Conversion: Euros → Centimes
    const amountInCents = Math.round(amountInEuros * 100);

    // Appeler Stripe avec la bonne signature
    await this.stripe.charge(amountInCents, "EUR");
  }
}

// ============================================
// SERVICE QUI UTILISE LE PAYMENT PROCESSOR
// ============================================

class CheckoutService {
  private paymentProcessor: IPaymentProcessor;

  constructor(paymentProcessor: IPaymentProcessor) {
    this.paymentProcessor = paymentProcessor;
  }

  async checkout(amount: number): Promise<void> {
    console.log(`\n[Checkout] Processing order for €${amount.toFixed(2)}`);
    await this.paymentProcessor.pay(amount);
    console.log(`[Checkout] Order completed!\n`);
  }
}

// ============================================
// EXÉCUTION
// ============================================

console.log("=== ADAPTER PATTERN DEMO ===\n");

// 1. Avec l'ANCIEN système Paypal
console.log("1️⃣ Using LEGACY Paypal:");
const legacyPaypal = new LegacyPaypal();
const checkoutWithPaypal = new CheckoutService(legacyPaypal);
await checkoutWithPaypal.checkout(99.99);

// 2. Avec le NOUVEAU système Stripe via l'Adaptateur
console.log("2️⃣ Using NEW Stripe (via Adapter):");
const stripeAPI = new StripeModernAPI();
const stripeAdapter = new StripeAdapter(stripeAPI);
const checkoutWithStripe = new CheckoutService(stripeAdapter);
await checkoutWithStripe.checkout(99.99);

console.log("✅ Adapter Pattern completed!");
console.log("Note: CheckoutService n'a JAMAIS changé, mais fonctionne avec Stripe!");
