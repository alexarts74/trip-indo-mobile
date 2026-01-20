import { TripExportData, ParticipantInfo, ExpenseByCategory } from "../types/export";
import { Expense } from "../services/expenseService";
import { Destination } from "../types/destination";

const COLORS = {
  primary: "#f97316",
  primaryLight: "#fff7ed",
  text: "#1e293b",
  textSecondary: "#64748b",
  border: "#e2e8f0",
  success: "#22c55e",
  error: "#ef4444",
  white: "#ffffff",
  background: "#f8fafc",
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

function getParticipantDisplayName(participant: ParticipantInfo): string {
  if (participant.first_name && participant.last_name) {
    return `${participant.first_name} ${participant.last_name}`;
  }
  if (participant.first_name) {
    return participant.first_name;
  }
  return participant.email.split("@")[0];
}

function getExpensePayerName(expense: Expense): string {
  if (expense.paid_by_user?.first_name && expense.paid_by_user?.last_name) {
    return `${expense.paid_by_user.first_name} ${expense.paid_by_user.last_name}`;
  }
  if (expense.paid_by_user?.first_name) {
    return expense.paid_by_user.first_name;
  }
  if (expense.paid_by_user?.email) {
    return expense.paid_by_user.email.split("@")[0];
  }
  return "Inconnu";
}

function generateDestinationsHTML(destinations: Destination[]): string {
  if (destinations.length === 0) {
    return `
      <div class="empty-state">
        <p>Aucune destination ajoutée</p>
      </div>
    `;
  }

  return destinations
    .map(
      (dest) => `
      <div class="destination-item">
        <div class="destination-header">
          <h4>${dest.name}</h4>
          ${dest.price ? `<span class="price">${formatCurrency(dest.price)}</span>` : ""}
        </div>
        ${dest.description ? `<p class="description">${dest.description}</p>` : ""}
        ${dest.address ? `<p class="address">📍 ${dest.address}</p>` : ""}
      </div>
    `
    )
    .join("");
}

function generateCategoryBreakdownHTML(categories: ExpenseByCategory[]): string {
  if (categories.length === 0) {
    return "";
  }

  return `
    <div class="category-breakdown">
      <h4>Répartition par catégorie</h4>
      <div class="category-list">
        ${categories
          .map(
            (cat) => `
          <div class="category-item">
            <span class="category-name">${cat.category_icon} ${cat.category_name}</span>
            <span class="category-stats">${cat.count} dépense${cat.count > 1 ? "s" : ""}</span>
            <span class="category-total">${formatCurrency(cat.total)}</span>
          </div>
        `
          )
          .join("")}
      </div>
    </div>
  `;
}

function generateExpensesHTML(expenses: Expense[]): string {
  if (expenses.length === 0) {
    return `
      <div class="empty-state">
        <p>Aucune dépense enregistrée</p>
      </div>
    `;
  }

  return `
    <div class="expense-list">
      ${expenses
        .map(
          (expense) => `
        <div class="expense-item">
          <div class="expense-main">
            <div class="expense-info">
              <span class="expense-category">${expense.category?.icon || "💰"}</span>
              <div class="expense-details">
                <span class="expense-title">${expense.title}</span>
                <span class="expense-meta">
                  ${formatDate(expense.date)} • Payé par ${getExpensePayerName(expense)}
                </span>
              </div>
            </div>
            <span class="expense-amount">${formatCurrency(expense.amount)}</span>
          </div>
          ${expense.description ? `<p class="expense-description">${expense.description}</p>` : ""}
        </div>
      `
        )
        .join("")}
    </div>
  `;
}

function generateParticipantsHTML(participants: ParticipantInfo[]): string {
  if (participants.length === 0) {
    return `
      <div class="empty-state">
        <p>Aucun participant</p>
      </div>
    `;
  }

  return participants
    .map(
      (participant) => `
      <div class="participant-item">
        <div class="participant-info">
          <div class="participant-avatar">${getParticipantDisplayName(participant).charAt(0).toUpperCase()}</div>
          <div class="participant-details">
            <span class="participant-name">${getParticipantDisplayName(participant)}</span>
            <span class="participant-email">${participant.email}</span>
            <span class="participant-role ${participant.role === "creator" ? "role-creator" : "role-participant"}">
              ${participant.role === "creator" ? "Créateur" : "Participant"}
            </span>
          </div>
        </div>
        <div class="participant-balance">
          <div class="balance-row">
            <span class="balance-label">Payé:</span>
            <span class="balance-value">${formatCurrency(participant.totalPaid)}</span>
          </div>
          <div class="balance-row">
            <span class="balance-label">Dû:</span>
            <span class="balance-value">${formatCurrency(participant.totalOwed)}</span>
          </div>
          <div class="balance-row balance-total">
            <span class="balance-label">Solde:</span>
            <span class="balance-value ${participant.balance >= 0 ? "positive" : "negative"}">
              ${participant.balance >= 0 ? "+" : ""}${formatCurrency(participant.balance)}
            </span>
          </div>
        </div>
      </div>
    `
    )
    .join("");
}

export function generatePDFHTML(data: TripExportData): string {
  const { trip, destinations, expenses, expensesByCategory, participants, summary, generatedAt } = data;

  const budgetBarWidth = Math.min(summary.budgetUsagePercent, 100);
  const budgetBarColor =
    summary.budgetUsagePercent > 100
      ? COLORS.error
      : summary.budgetUsagePercent > 80
        ? "#eab308"
        : COLORS.success;

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${trip.title} - TripMate Export</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: ${COLORS.text};
      background-color: ${COLORS.white};
      line-height: 1.5;
      font-size: 14px;
    }

    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 30px;
    }

    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 24px;
      border-bottom: 2px solid ${COLORS.primary};
      margin-bottom: 32px;
    }

    .header-left h1 {
      font-size: 28px;
      font-weight: 700;
      color: ${COLORS.text};
      margin-bottom: 4px;
    }

    .header-left .dates {
      font-size: 15px;
      color: ${COLORS.textSecondary};
    }

    .header-right {
      text-align: right;
    }

    .header-right .logo {
      font-size: 20px;
      font-weight: 700;
      color: ${COLORS.primary};
      margin-bottom: 4px;
    }

    .header-right .generated {
      font-size: 12px;
      color: ${COLORS.textSecondary};
    }

    /* Section */
    .section {
      margin-bottom: 32px;
    }

    .section-title {
      font-size: 18px;
      font-weight: 700;
      color: ${COLORS.text};
      padding-bottom: 12px;
      border-bottom: 1px solid ${COLORS.border};
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .section-count {
      font-size: 14px;
      font-weight: 500;
      color: ${COLORS.textSecondary};
      background-color: ${COLORS.background};
      padding: 2px 10px;
      border-radius: 12px;
    }

    /* Overview Stats */
    .overview-stats {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;
    }

    .stat-card {
      flex: 1;
      background-color: ${COLORS.background};
      border-radius: 12px;
      padding: 16px;
      text-align: center;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: ${COLORS.text};
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 13px;
      color: ${COLORS.textSecondary};
    }

    .stat-value.positive { color: ${COLORS.success}; }
    .stat-value.negative { color: ${COLORS.error}; }

    /* Budget Bar */
    .budget-bar-container {
      background-color: ${COLORS.background};
      border-radius: 12px;
      padding: 16px;
    }

    .budget-bar-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .budget-bar-label {
      font-size: 13px;
      color: ${COLORS.textSecondary};
    }

    .budget-bar-percent {
      font-size: 13px;
      font-weight: 600;
      color: ${COLORS.text};
    }

    .budget-bar {
      height: 8px;
      background-color: ${COLORS.border};
      border-radius: 4px;
      overflow: hidden;
    }

    .budget-bar-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    /* Destinations */
    .destination-item {
      background-color: ${COLORS.background};
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 12px;
    }

    .destination-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .destination-header h4 {
      font-size: 16px;
      font-weight: 600;
      color: ${COLORS.text};
    }

    .destination-header .price {
      font-size: 15px;
      font-weight: 600;
      color: ${COLORS.primary};
    }

    .destination-item .description {
      font-size: 14px;
      color: ${COLORS.textSecondary};
      margin-bottom: 4px;
    }

    .destination-item .address {
      font-size: 13px;
      color: ${COLORS.textSecondary};
    }

    /* Category Breakdown */
    .category-breakdown {
      background-color: ${COLORS.primaryLight};
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 20px;
    }

    .category-breakdown h4 {
      font-size: 14px;
      font-weight: 600;
      color: ${COLORS.text};
      margin-bottom: 12px;
    }

    .category-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .category-item {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .category-name {
      flex: 1;
      font-size: 14px;
      color: ${COLORS.text};
    }

    .category-stats {
      font-size: 12px;
      color: ${COLORS.textSecondary};
    }

    .category-total {
      font-size: 14px;
      font-weight: 600;
      color: ${COLORS.text};
      min-width: 80px;
      text-align: right;
    }

    /* Expenses */
    .expense-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .expense-item {
      background-color: ${COLORS.background};
      border-radius: 12px;
      padding: 14px 16px;
    }

    .expense-main {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .expense-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .expense-category {
      font-size: 20px;
    }

    .expense-details {
      display: flex;
      flex-direction: column;
    }

    .expense-title {
      font-size: 15px;
      font-weight: 500;
      color: ${COLORS.text};
    }

    .expense-meta {
      font-size: 12px;
      color: ${COLORS.textSecondary};
    }

    .expense-amount {
      font-size: 16px;
      font-weight: 600;
      color: ${COLORS.text};
    }

    .expense-description {
      font-size: 13px;
      color: ${COLORS.textSecondary};
      margin-top: 8px;
      padding-left: 36px;
    }

    /* Participants */
    .participant-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: ${COLORS.background};
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 12px;
    }

    .participant-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .participant-avatar {
      width: 44px;
      height: 44px;
      border-radius: 22px;
      background-color: ${COLORS.primary};
      color: ${COLORS.white};
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: 600;
    }

    .participant-details {
      display: flex;
      flex-direction: column;
    }

    .participant-name {
      font-size: 15px;
      font-weight: 600;
      color: ${COLORS.text};
    }

    .participant-email {
      font-size: 13px;
      color: ${COLORS.textSecondary};
    }

    .participant-role {
      font-size: 11px;
      font-weight: 500;
      padding: 2px 8px;
      border-radius: 10px;
      display: inline-block;
      margin-top: 4px;
      width: fit-content;
    }

    .role-creator {
      background-color: ${COLORS.primaryLight};
      color: ${COLORS.primary};
    }

    .role-participant {
      background-color: ${COLORS.background};
      color: ${COLORS.textSecondary};
      border: 1px solid ${COLORS.border};
    }

    .participant-balance {
      text-align: right;
    }

    .balance-row {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 2px;
    }

    .balance-label {
      font-size: 12px;
      color: ${COLORS.textSecondary};
    }

    .balance-value {
      font-size: 13px;
      color: ${COLORS.text};
    }

    .balance-total {
      margin-top: 4px;
      padding-top: 4px;
      border-top: 1px solid ${COLORS.border};
    }

    .balance-value.positive { color: ${COLORS.success}; font-weight: 600; }
    .balance-value.negative { color: ${COLORS.error}; font-weight: 600; }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 24px;
      color: ${COLORS.textSecondary};
      background-color: ${COLORS.background};
      border-radius: 12px;
    }

    /* Footer */
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid ${COLORS.border};
      text-align: center;
    }

    .footer-text {
      font-size: 12px;
      color: ${COLORS.textSecondary};
    }

    .footer-logo {
      font-weight: 600;
      color: ${COLORS.primary};
    }

    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .container { padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <header class="header">
      <div class="header-left">
        <h1>${trip.title}</h1>
        <p class="dates">${formatDate(trip.start_date)} - ${formatDate(trip.end_date)}</p>
      </div>
      <div class="header-right">
        <p class="logo">TripMate</p>
        <p class="generated">Généré le ${formatDate(generatedAt.toISOString())}</p>
      </div>
    </header>

    <!-- Overview Section -->
    <section class="section">
      <h2 class="section-title">Aperçu</h2>
      <div class="overview-stats">
        <div class="stat-card">
          <p class="stat-value">${formatCurrency(summary.totalBudget)}</p>
          <p class="stat-label">Budget total</p>
        </div>
        <div class="stat-card">
          <p class="stat-value">${formatCurrency(summary.totalSpent)}</p>
          <p class="stat-label">Dépensé</p>
        </div>
        <div class="stat-card">
          <p class="stat-value ${summary.remaining >= 0 ? "positive" : "negative"}">
            ${formatCurrency(summary.remaining)}
          </p>
          <p class="stat-label">Restant</p>
        </div>
      </div>
      <div class="budget-bar-container">
        <div class="budget-bar-header">
          <span class="budget-bar-label">Utilisation du budget</span>
          <span class="budget-bar-percent">${summary.budgetUsagePercent.toFixed(1)}%</span>
        </div>
        <div class="budget-bar">
          <div class="budget-bar-fill" style="width: ${budgetBarWidth}%; background-color: ${budgetBarColor};"></div>
        </div>
      </div>
    </section>

    <!-- Destinations Section -->
    <section class="section">
      <h2 class="section-title">
        Destinations
        <span class="section-count">${summary.destinationCount}</span>
      </h2>
      ${generateDestinationsHTML(destinations)}
    </section>

    <!-- Expenses Section -->
    <section class="section">
      <h2 class="section-title">
        Dépenses
        <span class="section-count">${summary.expenseCount} • Total: ${formatCurrency(summary.totalSpent)}</span>
      </h2>
      ${generateCategoryBreakdownHTML(expensesByCategory)}
      ${generateExpensesHTML(expenses)}
    </section>

    <!-- Participants Section -->
    <section class="section">
      <h2 class="section-title">
        Participants
        <span class="section-count">${summary.participantCount}</span>
      </h2>
      ${generateParticipantsHTML(participants)}
    </section>

    <!-- Footer -->
    <footer class="footer">
      <p class="footer-text">Généré par <span class="footer-logo">TripMate</span></p>
    </footer>
  </div>
</body>
</html>
  `;
}
