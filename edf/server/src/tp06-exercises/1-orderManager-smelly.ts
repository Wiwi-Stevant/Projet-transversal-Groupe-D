/**
 * AVANT REFACTORING - orderManager.ts
 *
 * Cette classe contient plusieurs Code Smells majeurs:
 * 1. God Class - Gère trop de responsabilités à la fois
 * 2. Méthode trop longue - createOrder fait trop de choses
 * 3. Trop de paramètres - Fonctions surchargées
 * 4. Duplication de code - Les logs et validations se répètent
 */

import console from "console";

// Simule une "base de données"
const ordersDatabase: Record<number, Order> = {};
const customersDatabase: Record<number, Customer> = {};

interface Customer {
  id: number;
  name: string;
  email: string;
  creditScore: number;
}

interface Order {
  id: number;
  customerId: number;
  items: OrderItem[];
  totalPrice: number;
  status: "pending" | "confirmed" | "shipped" | "delivered";
  createdAt: Date;
}

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

/**
 * ❌ CODE SMELL #1: GOD CLASS
 * Cette classe gère trop de responsabilités:
 * - Gestion des commandes
 * - Gestion des clients
 * - Calcul des prix
 * - Envoi d'emails
 * - Logs
 * - Notifications
 */
export class OrderManagerSmelly {
  // ❌ CODE SMELL #3: TROP DE PARAMÈTRES
  createOrder(
    customerId: number,
    customerName: string,
    customerEmail: string,
    customerCredit: number,
    items: OrderItem[],
    discountCode: string | null,
    shippingAddress: string,
    isExpressShipping: boolean,
    paymentMethod: string,
    notificationEmail: string,
    logFile: string
  ): Order {
    // ❌ CODE SMELL #2: MÉTHODE TROP LONGUE
    // Validation
    console.log(`[LOG] Validating order for customer ${customerName}...`);
    if (!customerName || customerName.trim() === "") {
      throw new Error("Customer name is required");
    }

    if (!customerEmail || customerEmail.trim() === "") {
      throw new Error("Customer email is required");
    }

    if (items.length === 0) {
      throw new Error("Order must have at least one item");
    }

    // ❌ CODE SMELL #4: DUPLICATION - Calcul du prix réutilisé par copy-paste
    let totalPrice = 0;
    for (const item of items) {
      totalPrice += item.price * item.quantity;
    }

    let shippingCost = 10;
    if (isExpressShipping) {
      shippingCost = 25;
    }
    totalPrice += shippingCost;

    // Appliquer une remise (duplication flagrante)
    if (discountCode === "SAVE10") {
      totalPrice = totalPrice * 0.9;
    } else if (discountCode === "SAVE20") {
      totalPrice = totalPrice * 0.8;
    }

    // ❌ CODE SMELL #4: DUPLICATION - Vérification du crédit
    if (customerCredit < totalPrice) {
      console.log(
        `[LOG] Customer ${customerName} has insufficient credit (${customerCredit} < ${totalPrice})`
      );
      throw new Error("Insufficient credit");
    }

    // Créer la commande
    const orderId = Math.max(...Object.keys(ordersDatabase).map(Number), 0) + 1;
    const order: Order = {
      id: orderId,
      customerId,
      items,
      totalPrice,
      status: "pending",
      createdAt: new Date(),
    };

    ordersDatabase[orderId] = order;

    // ❌ Trop de responsabilités: Envoyer un email
    console.log(
      `[EMAIL] Sending confirmation email to ${notificationEmail}...`
    );
    console.log(`[EMAIL] Subject: Order #${orderId} confirmed`);
    console.log(`[EMAIL] Body: Your order for $${totalPrice} has been created`);

    // ❌ Trop de responsabilités: Faire un log dans un fichier
    const logEntry = `[${new Date().toISOString()}] Order ${orderId} created for ${customerName} - Total: $${totalPrice}`;
    console.log(`[FILE-LOG] Writing to ${logFile}: ${logEntry}`);

    // ❌ Trop de responsabilités: Notifier le système de paiement
    console.log(
      `[PAYMENT] Processing payment via ${paymentMethod} for $${totalPrice}`
    );
    if (paymentMethod === "credit_card") {
      console.log(`[PAYMENT] Charging credit card...`);
    } else if (paymentMethod === "paypal") {
      console.log(`[PAYMENT] Redirecting to PayPal...`);
    }

    return order;
  }

  // ❌ CODE SMELL #2: MÉTHODE TROP LONGUE (suite avec duplication)
  updateOrderStatus(
    orderId: number,
    newStatus: "pending" | "confirmed" | "shipped" | "delivered"
  ): Order {
    const order = ordersDatabase[orderId];

    if (!order) {
      console.log(`[LOG] Order ${orderId} not found`);
      throw new Error("Order not found");
    }

    order.status = newStatus;

    // ❌ DUPLICATION: Les mêmes logs et notifications se répètent
    console.log(`[LOG] Order ${orderId} status updated to ${newStatus}`);
    console.log(
      `[EMAIL] Sending status update email for order ${orderId}...`
    );
    const customer = customersDatabase[order.customerId];
    if (customer) {
      console.log(`[EMAIL] To: ${customer.email}`);
      console.log(`[EMAIL] Subject: Order #${orderId} is now ${newStatus}`);
      console.log(`[EMAIL] Body: Your order status: ${newStatus}`);
    }

    return order;
  }

  // ❌ DUPLICATION: Même pattern que createOrder
  getOrdersForCustomer(
    customerId: number,
    customerName: string,
    customerEmail: string
  ): Order[] {
    console.log(
      `[LOG] Fetching orders for customer ${customerName} (${customerId})`
    );

    if (!customerName || customerName.trim() === "") {
      throw new Error("Customer name is required");
    }

    if (!customerEmail || customerEmail.trim() === "") {
      throw new Error("Customer email is required");
    }

    return Object.values(ordersDatabase).filter(
      (order) => order.customerId === customerId
    );
  }

  calculateOrderTotal(
    items: OrderItem[],
    isExpressShipping: boolean,
    discountCode: string | null
  ): number {
    // ❌ DUPLICATION EXACTE du calcul de prix (ligne 60-75)
    let totalPrice = 0;
    for (const item of items) {
      totalPrice += item.price * item.quantity;
    }

    let shippingCost = 10;
    if (isExpressShipping) {
      shippingCost = 25;
    }
    totalPrice += shippingCost;

    if (discountCode === "SAVE10") {
      totalPrice = totalPrice * 0.9;
    } else if (discountCode === "SAVE20") {
      totalPrice = totalPrice * 0.8;
    }

    return totalPrice;
  }
}

// Exemple d'utilisation (impossible à utiliser car trop de paramètres!)
const manager = new OrderManagerSmelly();

try {
  const order = manager.createOrder(
    1, // customerId
    "John Doe", // customerName
    "john@example.com", // customerEmail
    500, // customerCredit
    [
      { name: "Laptop", price: 800, quantity: 1 },
      { name: "Mouse", price: 30, quantity: 2 },
    ], // items
    "SAVE10", // discountCode
    "123 Main St", // shippingAddress
    true, // isExpressShipping
    "credit_card", // paymentMethod
    "john@example.com", // notificationEmail
    "/var/log/orders.log" // logFile
  );
  console.log("Order created:", order);
} catch (error) {
  console.error("Error:", error);
}
