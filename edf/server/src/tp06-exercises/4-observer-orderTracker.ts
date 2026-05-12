/**
 * OBSERVER PATTERN - Suivi de statut de commande
 *
 * Problème:
 * - Quand une commande change de statut, plusieurs services doivent être notifiés:
 *   1. Service de notification mobile (push)
 *   2. Service CRM (mise à jour du dossier)
 *   3. Service d'email (notification client)
 *
 * AVANT Observer: OrderTracker connaissait tous ces services (couplage fort)
 * APRÈS Observer: OrderTracker ne connaît que l'interface IOrderObserver
 *                Extensible sans modification!
 */

// ============================================
// SUJETS & OBSERVATEURS (INTERFACES)
// ============================================

/**
 * Interface pour tout observateur de changement de statut
 */
interface IOrderObserver {
  update(status: string): void;
}

// ============================================
// OBSERVATEURS CONCRETS
// ============================================

/**
 * Service 1: Notifications mobiles
 */
class MobileNotificationService implements IOrderObserver {
  update(status: string): void {
    console.log(
      `📱 [Mobile] Sending push notification: Order status is now "${status}"`
    );
  }
}

/**
 * Service 2: CRM (Customer Relationship Management)
 */
class CRMService implements IOrderObserver {
  update(status: string): void {
    console.log(
      `📊 [CRM] Updating customer file: Order status changed to "${status}"`
    );
  }
}

/**
 * Service 3: Email
 */
class EmailNotificationService implements IOrderObserver {
  update(status: string): void {
    console.log(
      `📧 [Email] Sending email to customer: "Your order is now ${status}"`
    );
  }
}

/**
 * Service 4: SMS (Pour montrer l'extensibilité!)
 */
class SMSNotificationService implements IOrderObserver {
  update(status: string): void {
    console.log(
      `💬 [SMS] Sending SMS to customer: Order status is now "${status}"`
    );
  }
}

// ============================================
// SUJET (OBSERVABLE)
// ============================================

interface IOrderTracker {
  attach(observer: IOrderObserver): void;
  detach(observer: IOrderObserver): void;
  setStatus(status: string): void;
}

/**
 * OrderTracker - Le sujet qui notifie les observateurs
 * Découplement complet: ne connaît que l'interface IOrderObserver
 */
class OrderTracker implements IOrderTracker {
  private observers: IOrderObserver[] = [];
  private currentStatus: string = "pending";

  /**
   * Ajouter un observateur
   */
  attach(observer: IOrderObserver): void {
    if (!this.observers.includes(observer)) {
      this.observers.push(observer);
      console.log(
        `✅ Observer attached: ${observer.constructor.name}\n`
      );
    }
  }

  /**
   * Retirer un observateur
   */
  detach(observer: IOrderObserver): void {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
      console.log(
        `❌ Observer detached: ${observer.constructor.name}\n`
      );
    }
  }

  /**
   * Changer le statut et notifier tous les observateurs
   */
  setStatus(status: string): void {
    if (this.currentStatus !== status) {
      console.log(
        `\n🔄 Order status changing from "${this.currentStatus}" to "${status}"\n`
      );
      this.currentStatus = status;
      this.notifyObservers();
    }
  }

  /**
   * Notifier tous les observateurs
   */
  private notifyObservers(): void {
    for (const observer of this.observers) {
      observer.update(this.currentStatus);
    }
  }

  getStatus(): string {
    return this.currentStatus;
  }
}

// ============================================
// EXÉCUTION
// ============================================

console.log("=== OBSERVER PATTERN DEMO ===\n");

// 1. Créer le tracker (sujet)
const orderTracker = new OrderTracker();

// 2. Créer les observateurs (services)
const mobileService = new MobileNotificationService();
const crmService = new CRMService();
const emailService = new EmailNotificationService();
const smsService = new SMSNotificationService();

// 3. Attacher les observateurs au tracker
console.log("📌 Attaching observers...\n");
orderTracker.attach(mobileService);
orderTracker.attach(crmService);
orderTracker.attach(emailService);
orderTracker.attach(smsService);

// 4. Changer le statut et voir tous les services être notifiés
console.log("---\n");
orderTracker.setStatus("confirmed");

console.log("---\n");
orderTracker.setStatus("shipped");

// 5. Détacher un observateur (ex: le client n'a plus demandé les SMS)
console.log("---\n");
console.log("❌ Removing SMS service...\n");
orderTracker.detach(smsService);

console.log("---\n");
orderTracker.setStatus("delivered");

console.log("\n✅ Observer Pattern completed!");
console.log("\n💡 Avantages:");
console.log("  1. Nouveau service (ex: Webhook)? Juste ajouter attach()");
console.log("  2. OrderTracker n'a JAMAIS changé");
console.log("  3. Services complètement découplés");
console.log("  4. Facilement testable et extensible!");
