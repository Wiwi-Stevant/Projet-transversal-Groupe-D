# TP06 - Refactoring, Code Smells & Design Patterns

## 📋 Résumé des modifications

### 1️⃣ Refactorisation du code existant

#### Problèmes identifiés (Code Smells):
- **Duplication de code** dans les try-catch des contrôleurs
- **Validation d'ID** répétée dans toggleUserActive et deleteUserController
- **Service pas encore une classe** (fonctions dispersées)
- **Pas d'Error Handler middleware** centralisé
- **Séparation HTTP/Métier** incomplète

#### Solutions appliquées:
✅ **UserService** - Transformé en classe avec méthodes asynchrones
✅ **asyncErrorHandler** - Middleware pour capturer les erreurs automatiquement
✅ **Contrôleurs simplifiés** - Suppression du try-catch (délégué au middleware)
✅ **Routes wrappées** - Tous les handlers passent par asyncHandler

**Avant (70 lignes, duplication):**
```typescript
export const toggleUserActive = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Identifiant invalide." });
    return;
  }
  try {
    const user = await toggleActive(id);
    res.status(200).json(user);
  } catch (error) {
    if (error instanceof HttpError) {
      res.status(error.status).json({ error: error.message });
      return;
    }
    console.error(error);
    res.status(500).json({ error: "..." });
  }
};
```

**Après (15 lignes, propre):**
```typescript
export const toggleUserActive = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    throw new HttpError(400, "Identifiant invalide.");
  }
  const user = await userService.toggleActive(id);
  res.status(200).json(user);
};
```

---

### 2️⃣ Singleton Pattern - Database

**Fichier modifié:** `server/src/config/database.ts`

**Objectif:** Garantir une seule instance de la connexion Sequelize

```typescript
class DatabaseConnection {
  private static instance: Sequelize | null = null;

  private constructor() {} // Empêche new DatabaseConnection()

  public static getInstance(): Sequelize {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = DatabaseConnection.createConnection();
    }
    return DatabaseConnection.instance;
  }
}

// Utilisation
const db1 = DatabaseConnection.getInstance();
const db2 = DatabaseConnection.getInstance();
console.log(db1 === db2); // true - même instance!
```

✅ **Bénéfices:**
- Une seule connexion en mémoire
- Point d'accès global et contrôlé
- Facilite le testing (mock l'instance unique)

---

### 3️⃣ Exercice orderManager - Refactoring d'une God Class

**Fichiers créés:**
- `server/src/tp06-exercises/1-orderManager-smelly.ts` (❌ AVANT)
- `server/src/tp06-exercises/2-orderManager-refactored.ts` (✅ APRÈS)

#### Code Smells identifiés dans orderManager:

1. **GOD CLASS** - Gère trop de responsabilités (commandes, emails, paiement, logs)
2. **MÉTHODE TROP LONGUE** - createOrder fait 150+ lignes
3. **TROP DE PARAMÈTRES** - createOrder(12 paramètres)
4. **DUPLICATION** - Calcul du prix répété 2 fois exactement

#### Solution - Séparation des responsabilités:

```
❌ AVANT: OrderManagerSmelly
         ├─ Gestion commandes
         ├─ Calcul prix
         ├─ Envoyer emails
         ├─ Traiter paiement
         └─ Logger

✅ APRÈS:
    OrderService (Orchestrateur)
    ├─ PriceCalculator (Calcul seul)
    ├─ EmailService (Emails seul)
    ├─ PaymentService (Paiement seul)
    └─ Logger (Logs seuls)
```

**DTO pour les données:**
```typescript
interface CreateOrderDTO {
  customerId: number;
  customerName: string;
  // ... tous les paramètres dans un objet unique!
}
```

---

### 4️⃣ Adapter Pattern - Paiements Stripe

**Fichier:** `server/src/tp06-exercises/3-adapter-payment.ts`

**Cas réel:** Intégrer Stripe sans casser CheckoutService existant

```
Problème: Stripe et Paypal ont des signatures différentes!
  - Paypal: pay(montantEnEuros)
  - Stripe: charge(montantEnCentimes, devise)

Solution: StripeAdapter implémente IPaymentProcessor
          et enveloppe Stripe

CheckoutService --[reste identique]--> IPaymentProcessor
                                           ├─ LegacyPaypal  ✅
                                           └─ StripeAdapter --> Stripe ✅
```

**Code:**
```typescript
class StripeAdapter implements IPaymentProcessor {
  private stripe: StripeModernAPI;

  async pay(amountInEuros: number): Promise<void> {
    // Conversion: Euros → Centimes
    const amountInCents = Math.round(amountInEuros * 100);
    // Déléguer à Stripe
    await this.stripe.charge(amountInCents, "EUR");
  }
}
```

✅ **Bénéfices:**
- CheckoutService ne change PAS
- Stripe reste inchangé
- Ajouter Payoneer? Créer PayoneerAdapter!

---

### 5️⃣ Observer Pattern - Suivi de commande

**Fichier:** `server/src/tp06-exercises/4-observer-orderTracker.ts`

**Cas réel:** Notifier automatiquement multiple services quand le statut change

```
❌ AVANT: OrderTracker connaissait directement les services

    OrderTracker
    ├─ new MobileService()
    ├─ new CRMService()
    ├─ new EmailService()
    └─ notify() {
        mobileService.notify(status)
        crmService.notify(status)
        emailService.notify(status)
      }

✅ APRÈS: OrderTracker utilise l'interface Observer

    OrderTracker (Sujet)
    ├─ attach(IOrderObserver)
    ├─ detach(IOrderObserver)
    └─ notifyObservers()
    
    IOrderObserver (Interface)
    ├─ MobileNotificationService ✅
    ├─ CRMService ✅
    ├─ EmailService ✅
    └─ SMSService ✅ (facile à ajouter!)
```

**Avantage décisif:** Ajouter un nouveau service = juste attach(), sans modifier OrderTracker!

```typescript
// Facile d'ajouter un webhook service
class WebhookService implements IOrderObserver {
  update(status: string): void {
    // Appeler un webhook externe...
  }
}

orderTracker.attach(new WebhookService());
// C'est tout! OrderTracker ne change pas.
```

---

## 📚 Concepts clés du TP

### 1. POO - Les 4 piliers:
- **Encapsulation** - private/public/protected
- **Héritage** - extends pour réutiliser
- **Abstraction** - Interfaces, classes abstraites
- **Polymorphisme** - Plusieurs formes du même contrat

### 2. Code Smells - À chercher:
- ❌ Duplication de code
- ❌ Méthodes trop longues (>50 lignes)
- ❌ Trop de paramètres (>5)
- ❌ God Classes (trop de responsabilités)
- ❌ Message Chains (obj.parent.parent.name)

### 3. Refactoring - Processus:
1. Identifier les problèmes
2. **S'assurer d'avoir des tests** ✅
3. Petites modifications (une à la fois)
4. Tester après chaque modification
5. Commit

### 4. Design Patterns:

| Pattern | Type | Problème | Solution |
|---------|------|----------|----------|
| **Singleton** | Création | Une seule instance | Constructeur private + getInstance() |
| **Adapter** | Structurel | Interfaces incompatibles | Envelopper + adapter l'interface |
| **Observer** | Comportement | Couplage fort aux dépendances | Interface commune + subscribe/notify |

---

## ✅ Checklist complétée

- [x] Analyse des Code Smells du projet existant
- [x] Refactorisation des contrôleurs et services
- [x] Singleton Pattern sur Database
- [x] Exercice orderManager - Identification et refactoring des 4 Code Smells
- [x] Adapter Pattern - Paiements (Stripe/Paypal)
- [x] Observer Pattern - Suivi de commande
- [x] Compilation TypeScript réussie
- [x] Documentation complète

---

## 🚀 Comment utiliser les exemples

Pour tester les design patterns individuellement:

```bash
# Adapter Pattern
npx ts-node server/src/tp06-exercises/3-adapter-payment.ts

# Observer Pattern
npx ts-node server/src/tp06-exercises/4-observer-orderTracker.ts
```

---

## 💡 Points clés à retenir

1. **Les Tests sont essentiels** - Refactoriser sans tests = risqué
2. **Une responsabilité par classe** - Single Responsibility Principle
3. **Les interfaces, c'est cool** - Elles permettent le découplage
4. **Les patterns ne sont pas la solution à tout** - Les appliquer quand c'est utile
5. **Le refactoring c'est un processus** - Itératif et continu

---

**TP06 complété!** ✅
