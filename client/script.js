/**
 * Expense Tracker Logic
 * Features: Local Storage, Income/Expense tracking, Transaction history, Balance calculation.
 */

const balance = document.getElementById('balance');
const money_plus = document.getElementById('money-plus');
const money_minus = document.getElementById('money-minus');
const list = document.getElementById('list');
const form = document.getElementById('form');
const text = document.getElementById('text');
const amount = document.getElementById('amount');

const API_URL = 'http://localhost:5000/api/v1/transactions';

let transactions = [];

// Get transactions from backend
async function getTransactions() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    if (data.success) {
      transactions = data.data;
      init();
    }
  } catch (err) {
    console.error('Error fetching transactions:', err);
  }
}

// Add transaction to backend
async function addTransaction(e) {
  e.preventDefault();

  if (text.value.trim() === '' || amount.value.trim() === '') {
    alert('Please add a description and amount');
    return;
  }

  const newTransaction = {
    text: text.value,
    amount: +amount.value
  };

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newTransaction)
    });

    const data = await res.json();

    if (data.success) {
      transactions.push(data.data);
      addTransactionDOM(data.data);
      updateValues();

      // Reset form
      text.value = '';
      amount.value = '';
    } else {
      alert(data.error);
    }
  } catch (err) {
    console.error('Error adding transaction:', err);
  }
}

// Remove transaction from backend
async function removeTransaction(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });

    const data = await res.json();

    if (data.success) {
      transactions = transactions.filter(transaction => transaction._id !== id);
      init();
    }
  } catch (err) {
    console.error('Error deleting transaction:', err);
  }
}

// Add transaction to the DOM list
function addTransactionDOM(transaction) {
  const sign = transaction.amount < 0 ? '-' : '+';
  const item = document.createElement('li');

  item.classList.add(transaction.amount < 0 ? 'minus' : 'plus');

  item.innerHTML = `
    ${transaction.text} <span>${sign}${Math.abs(
    transaction.amount
  ).toFixed(2)}</span>
    <button class="delete-btn" onclick="removeTransaction('${transaction._id
    }')">x</button>
  `;

  list.appendChild(item);
}

// Update the balance, income and expense displays
function updateValues() {
  const amounts = transactions.map(transaction => transaction.amount);

  const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(2);

  const income = amounts
    .filter(item => item > 0)
    .reduce((acc, item) => (acc += item), 0)
    .toFixed(2);

  const expense = (
    amounts.filter(item => item < 0).reduce((acc, item) => (acc += item), 0) * -1
  ).toFixed(2);

  balance.innerText = `$${total}`;
  money_plus.innerText = `+$${income}`;
  money_minus.innerText = `-$${expense}`;
}

// Initialize application
function init() {
  list.innerHTML = '';
  transactions.forEach(addTransactionDOM);
  updateValues();
}

// Initial call
getTransactions();

// Event listeners
form.addEventListener('submit', addTransaction);
