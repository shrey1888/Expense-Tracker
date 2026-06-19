// ===== Expense Tracker Script =====

// Grab DOM elements
const form = document.getElementById('transaction-form');
const textInput = document.getElementById('text');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const list = document.getElementById('transaction-list');
const balanceEl = document.getElementById('balance');
const incomeEl = document.getElementById('income');
const expenseEl = document.getElementById('expense');
const clearAllBtn = document.getElementById('clear-all');

// Load transactions from localStorage (or start empty)
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// Generate a simple unique ID
function generateID() {
  return Date.now().toString() + Math.random().toString(16).slice(2);
}

// Format number as currency (₹)
function formatCurrency(value) {
  return '₹' + Math.abs(value).toFixed(2);
}

// Save transactions array to localStorage
function saveToLocalStorage() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Render a single transaction in the list
function renderTransaction(transaction) {
  const li = document.createElement('li');
  const isIncome = transaction.amount > 0;

  li.classList.add('transaction-item', isIncome ? 'income' : 'expense');

  li.innerHTML = `
    <div class="transaction-info">
      <p class="desc">${transaction.text}</p>
      <p class="category">${transaction.category}</p>
    </div>
    <div class="transaction-amount">
      <span class="${isIncome ? 'income' : 'expense'}">
        ${isIncome ? '+' : '-'}${formatCurrency(transaction.amount)}
      </span>
      <button class="delete-btn" data-id="${transaction.id}">✕</button>
    </div>
  `;

  list.appendChild(li);
}

// Render all transactions + update summary
function renderAll() {
  list.innerHTML = '';

  if (transactions.length === 0) {
    list.innerHTML = '<li class="empty-state">No transactions yet. Add one above!</li>';
  } else {
    // Show most recent first
    transactions
      .slice()
      .reverse()
      .forEach(renderTransaction);
  }

  updateSummary();
}

// Calculate and display balance, income, expense
function updateSummary() {
  const amounts = transactions.map(t => t.amount);

  const total = amounts.reduce((acc, val) => acc + val, 0);
  const income = amounts
    .filter(val => val > 0)
    .reduce((acc, val) => acc + val, 0);
  const expense = amounts
    .filter(val => val < 0)
    .reduce((acc, val) => acc + val, 0);

  balanceEl.textContent = formatCurrency(total);
  incomeEl.textContent = formatCurrency(income);
  expenseEl.textContent = formatCurrency(expense);
}

// Add a new transaction
function addTransaction(e) {
  e.preventDefault();

  const text = textInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const category = categoryInput.value;

  if (text === '' || isNaN(amount)) {
    alert('Please enter a valid description and amount.');
    return;
  }

  const transaction = {
    id: generateID(),
    text,
    amount,
    category
  };

  transactions.push(transaction);
  saveToLocalStorage();
  renderAll();

  // Reset form
  form.reset();
  textInput.focus();
}

// Delete a transaction by id
function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  saveToLocalStorage();
  renderAll();
}

// Clear all transactions
function clearAll() {
  if (transactions.length === 0) return;

  const confirmClear = confirm('Are you sure you want to delete all transactions?');
  if (confirmClear) {
    transactions = [];
    saveToLocalStorage();
    renderAll();
  }
}

// Event delegation for delete buttons
list.addEventListener('click', (e) => {
  if (e.target.classList.contains('delete-btn')) {
    const id = e.target.getAttribute('data-id');
    deleteTransaction(id);
  }
});

form.addEventListener('submit', addTransaction);
clearAllBtn.addEventListener('click', clearAll);

// Initial render on page load
renderAll();
