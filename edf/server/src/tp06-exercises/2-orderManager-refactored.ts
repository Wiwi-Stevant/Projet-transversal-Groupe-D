/**
 * APRÈS REFACTORING - orderManager-refactored.ts
 *
 * Améliorations:
 * 1. Séparation des responsabilités en 4 Services
 * 2. DTOs pour les données (CreateOrderDTO)
 * 3. Interfaces claires (ILogger, IEmailService, IPaymentService)
 * 4. Aucune duplication de code
 */

import console from "console";

// ============================================
// INTERFACES & TYPES
// ============================================

export interface CreateOrderDTO {
  customerId: number;
  customerName: string;
  customerEmail: string;
  customerCredit: number;
  items: OrderItem[];
  discountCode: string | null;
  shippingAddress: string;
  isExpressShipping: boolean;
  paymentMethod: "credit_card" | "paypal" | "bank_transfer";
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  creditScore: number;
}

export interface Order {
  id: number;
  customerId: number;
  items: OrderItem[];
  totalPrice: number;
  status: "pending" | "confirmed" | "shipped" | "delivered";
  createdAt: Date;
}

export interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

// ============================================
// LOGGER SERVICE (Responsabilité: Logging)
// ============================================

interface ILogger {
  log(message: string): void;
  error(message: string): void;
}

class ConsoleLogger implements ILogger {
  log(message: string): void {
    console.log(`[LOG] ${message}`);
  }

  error(message: string): void {
    console.error(`[ERROR] ${message}`);
  }
}

// ============================================
// EMAIL SERVICE (Responsabilité: Envoyer des emails)
// ============================================

interface IEmailService {
  sendOrderConfirmation(order: Order, customerEmail: string): void;
  sendStatusUpdate(order: Order, customerEmail: string): void;
}

class EmailService implements IEmailService {
  private logger: ILogger;

  constructor(logger: ILogger) {
    this.logger = logger;
  }

  sendOrderConfirmation(order: Order, customerEmail: string): void {
    this.logger.log(
      `Sending confirmation email to ${customerEmail} for order #${order.id}`
    );
    console.log(`[EMAIL] To: ${customerEmail}`);
    console.log(`[EMAIL] Subject: Order #${order.id} confirmed`);
    console.log(
      `[EMAIL] Body: Your order for $${order.totalPrice} has been created`
    );
  }

  sendStatusUpdate(order: Order, customerEmail: string): void {
    this.logger.log(
      `Sending status update email to ${customerEmail} for order #${order.id}`
    );
    console.log(`[EMAIL] To: ${customerEmail}`);
    console.log(`[EMAIL] Subject: Order #${order.id} is now ${order.status}`);
    console.log(`[EMAIL] Body: Your order status: ${order.status}`);
  }
}

// ============================================
// PAYMENT SERVICE (Responsabilité: Traiter les paiements)
// ============================================

interface IPaymentService {
  processPayment(
    amount: number,
    method: "credit_card" | "paypal" | "bank_transfer"
  ): boolean;
}

class PaymentService implements IPaymentService {
  private logger: ILogger;

  constructor(logger: ILogger) {
    this.logger = logger;
  }

  processPayment(
    amount: number,
    method: "credit_card" | "paypal" | "bank_transfer"
  ): boolean {
    this.logger.log(`Processing payment of $${amount} via ${method}`);

    switch (method) {
      case "credit_card":
        console.log("[PAYMENT] Charging credit card...");
        break;
      case "paypal":
        console.log("[PAYMENT] Redirecting to PayPal...");
        break;
      case "bank_transfer":
        console.log("[PAYMENT] Initiating bank transfer...");
        break;
    }

    return true; // Simulé
  }
}

// ============================================
// PRICE CALCULATOR SERVICE (Responsabilité: Calcul des prix)
// ============================================

interface IPriceCalculator {
  calculateTotal(
    items: OrderItem[],
    isExpressShipping: boolean,
    discountCode: string | null
  ): number;
}

class PriceCalculator implements IPriceCalculator {
  private STANDARD_SHIPPING = 10;
  private EXPRESS_SHIPPING = 25;
  private DISCOUNT_CODES: Record<string, number> = {
    SAVE10: 0.1,
    SAVE20: 0.2,
  };

  calculateTotal(
    items: OrderItem[],
    isExpressShipping: boolean,
    discountCode: string | null
  ): number {
    // Calculer le sous-total
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Ajouter les frais de port
    const shipping = isExpressShipping
      ? this.EXPRESS_SHIPPING
      : this.STANDARD_SHIPPING;

    // Calculer avant remise
    const beforeDiscount = subtotal + shipping;

    // Appliquer la remise
    const discountRate = discountCode
      ? this.DISCOUNT_CODES[discountCode] ?? 0
      : 0;
    const finalTotal = beforeDiscount * (1 - discountRate);

    return Math.round(finalTotal * 100) / 100; // Arrondir à 2 décimales
  }
}

// ============================================
// ORDER SERVICE (Responsabilité: Logique métier des commandes)
// ============================================

interface IOrderService {
  createOrder(dto: CreateOrderDTO): Order;
  updateOrderStatus(
    orderId: number,
    newStatus: Order["status"]
  ): Order;
  getOrdersForCustomer(customerId: number): Order[];
}

class OrderService implements IOrderService {
  private logger: ILogger;
  private emailService: IEmailService;
  private paymentService: IPaymentService;
  private priceCalculator: IPriceCalculator;

  private ordersDatabase: Record<number, Order> = {};
  private customersDatabase: Record<number, Customer> = {};

  constructor(
    logger: ILogger,
    emailService: IEmailService,
    paymentService: IPaymentService,
    priceCalculator: IPriceCalculator
  ) {
    this.logger = logger;
    this.emailService = emailService;
    this.paymentService = paymentService;
    this.priceCalculator = priceCalculator;
  }

  createOrder(dto: CreateOrderDTO): Order {
    // Validation
    this._validateCustomerData(dto);
    this._validateItems(dto.items);

    // Calculer le total (UNE SEULE FOIS!)
    const totalPrice = this.priceCalculator.calculateTotal(
      dto.items,
      dto.isExpressShipping,
      dto.discountCode
    );

    // Vérifier le crédit (UNE SEULE FOIS!)
    this._validateCredit(dto.customerCredit, totalPrice);

    // Créer la commande
    const order: Order = {
      id: this._generateOrderId(),
      customerId: dto.customerId,
      items: dto.items,
      totalPrice,
      status: "pending",
      createdAt: new Date(),
    };

    this.ordersDatabase[order.id] = order;

    // Déléguer aux Services spécialisés
    this.paymentService.processPayment(totalPrice, dto.paymentMethod);
    this.emailService.sendOrderConfirmation(order, dto.customerEmail);
    this.logger.log(
      `Order #${order.id} created for ${dto.customerName} - Total: $${totalPrice}`
    );

    return order;
  }

  updateOrderStatus(
    orderId: number,
    newStatus: Order["status"]
  ): Order {
    const order = this.ordersDatabase[orderId];

    if (!order) {
      throw new Error("Order not found");
    }

    order.status = newStatus;

    // Déléguer aux Services spécialisés
    const customer = this.customersDatabase[order.customerId];
    if (customer) {
      this.emailService.sendStatusUpdate(order, customer.email);
    }

    this.logger.log(`Order #${orderId} status updated to ${newStatus}`);

    return order;
  }

  getOrdersForCustomer(customerId: number): Order[] {
    this.logger.log(`Fetching orders for customer ${customerId}`);
    return Object.values(this.ordersDatabase).filter(
      (order) => order.customerId === customerId
    );
  }

  // Méthodes privées (validations séparées)
  private _validateCustomerData(dto: CreateOrderDTO): void {
    if (!dto.customerName || dto.customerName.trim() === "") {
      throw new Error("Customer name is required");
    }
    if (!dto.customerEmail || dto.customerEmail.trim() === "") {
      throw new Error("Customer email is required");
    }
  }

  private _validateItems(items: OrderItem[]): void {
    if (items.length === 0) {
      throw new Error("Order must have at least one item");
    }
  }

  private _validateCredit(credit: number, totalPrice: number): void {
    if (credit < totalPrice) {
      throw new Error("Insufficient credit");
    }
  }

  private _generateOrderId(): number {
    return (
      Math.max(...Object.keys(this.ordersDatabase).map(Number), 0) + 1
    );
  }
}

// ============================================
// UTILISATION (Injection de dépendances)
// ============================================

const logger = new ConsoleLogger();
const emailService = new EmailService(logger);
const paymentService = new PaymentService(logger);
const priceCalculator = new PriceCalculator();

const orderService = new OrderService(
  logger,
  emailService,
  paymentService,
  priceCalculator
);

// Maintenant on utilise le service avec un DTO simple!
const createOrderDTO: CreateOrderDTO = {
  customerId: 1,
  customerName: "John Doe",
  customerEmail: "john@example.com",
  customerCredit: 1000, // Suffisant pour couvrir la commande
  items: [
    { name: "Laptop", price: 800, quantity: 1 },
    { name: "Mouse", price: 30, quantity: 2 },
  ],
  discountCode: "SAVE10",
  shippingAddress: "123 Main St",
  isExpressShipping: true,
  paymentMethod: "credit_card",
};

try {
  const order = orderService.createOrder(createOrderDTO);
  console.log("\n✅ Order created successfully:", order);
} catch (error) {
  console.error("❌ Error:", error);
}
