const transactionForm = document.getElementById("transaction-form");
const incomeTodaySpan = document.getElementById("income-today");
const remainingBudgetSpan = document.getElementById("remaining-budget");
const incomeTableBody = document.getElementById("income-table-body");
const expenseTableBody = document.getElementById("expense-table-body");

// Initial values (replace with your preferred starting values)
let incomeToday = 0.00;
let remainingBudget = 0.00; // Example budget
let transactions = [];

transactionForm.addEventListener("submit", (event) => {
    event.preventDefault(); // Prevent default form submission

    const date = document.getElementById("date").value;
    const amount = parseFloat(document.getElementById("amount").value);
    const category = document.getElementById("category").value;
    const info = document.getElementById("info").value;

    // Basic validation
    if (isNaN(amount) || amount <= 0) {
        alert("Please enter a valid amount.");
        return;
    }

    // Update income and budget based on transaction type
    if (category === "income") {
        incomeToday += amount;
        remainingBudget += amount;
    } else {
        remainingBudget -= amount;
    }

    // Update dashboard display
    incomeTodaySpan.textContent = `$${incomeToday.toFixed(2)}`;
    remainingBudgetSpan.textContent = `$${remainingBudget.toFixed(2)}`;

    // Ensure transactions is an array
    if (!Array.isArray(transactions)) {
        transactions = [];
    }

    // Store the transaction in the array
    const transaction = {
        date,
        amount,
        category,
        info
    };
    transactions.push(transaction);

    // Store the updated transactions array in local storage
    updateLocalStorage();

    // Clear the form
    transactionForm.reset();

    // Update the tables with the new transaction
    addTransactionToTable(transaction);
});

function createDropdownButtons(index) {
    const dropdownContainer = document.createElement("div");
    dropdownContainer.classList.add("dropdown");

    dropdownContainer.innerHTML = `
        <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton${index}" data-bs-toggle="dropdown" aria-expanded="false">
        </button>
        <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton${index}">
            <li><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#editModal" onclick="editTransactionModal(${index})">Edit</a></li>
            <li><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#deleteModal" onclick="deleteTransactionModal(${index})">Delete</a></li>
        </ul>
    `;

    return dropdownContainer;
}

// Add to the table
function addTransactionToTable(transaction, index) {
    const newRow = document.createElement("tr");
    newRow.innerHTML = `<td>${transaction.date}</td><td>${transaction.category}</td><td>${transaction.amount}</td><td>${transaction.info}</td><td></td>`;

    const dropdownButtons = createDropdownButtons(index);
    newRow.lastElementChild.appendChild(dropdownButtons);

    const tableBody = transaction.category === "income" ? incomeTableBody : expenseTableBody;
    tableBody.appendChild(newRow);
}

// New function to open the edit modal with the selected transaction
function editTransactionModal(index) {
    const transaction = transactions[index];

    // Update the modal form with the selected transaction
    document.getElementById("edit-date").value = transaction.date;
    document.getElementById("edit-amount").value = transaction.amount;
    document.getElementById("edit-category").value = transaction.category;
    document.getElementById("edit-info").value = transaction.info;
    document.getElementById("edit-index").value = index;
}

// New function to open the delete modal with the selected transaction
function deleteTransactionModal(index) {
    // Set the index to delete in the delete modal's button
    document.getElementById("delete-modal-button").setAttribute("data-index", index);
}

// New function to handle the delete button in the delete modal
function confirmDeleteTransaction() {
    const index = document.getElementById("delete-modal-button").getAttribute("data-index");

    if (index !== null) {
        // Perform the deletion and update
        deleteTransaction(index);

        // Reset the attribute to avoid accidental deletions
        document.getElementById("delete-modal-button").removeAttribute("data-index");
    }
}

// Add event listener for the delete modal button
document.getElementById("delete-modal-button").addEventListener("click", confirmDeleteTransaction);


// Edit a transaction
function editTransaction() {
    const index = document.getElementById("edit-index").value;

    // Check if index is a valid number
    if (index !== "" && !isNaN(index)) {
        const transaction = transactions[index];

        // Update income and budget based on the removed transaction
        if (transaction.category === "income") {
            incomeToday -= transaction.amount;
            remainingBudget -= transaction.amount;
        } else {
            remainingBudget += transaction.amount;
        }

        // Update dashboard display
        incomeTodaySpan.textContent = `$${incomeToday.toFixed(2)}`;
        remainingBudgetSpan.textContent = `$${remainingBudget.toFixed(2)}`;

        // Remove the transaction from the array
        transactions[index] = {
            date: document.getElementById("edit-date").value,
            amount: parseFloat(document.getElementById("edit-amount").value),
            category: document.getElementById("edit-category").value,
            info: document.getElementById("edit-info").value,
        };

        // Update the tables
        updateLocalStorage();
        updateTables();

        // Clear the modal form
        document.getElementById("edit-transaction-form").reset();

        // Close the modal
        const editModal = new bootstrap.Modal(document.getElementById("editModal"));
        editModal.hide();
    } else {
        alert("Invalid transaction index.");
    }
}

// Delete a transaction
function deleteTransaction(index) {
    const transaction = transactions[index];

    // Remove the transaction from the array
    transactions.splice(index, 1);

    // Update income and budget based on the removed transaction
    if (transaction.category === "income") {
        incomeToday -= transaction.amount;
        remainingBudget -= transaction.amount;
    } else {
        remainingBudget += transaction.amount;
    }

    // Update dashboard display
    incomeTodaySpan.textContent = `$${incomeToday.toFixed(2)}`;
    remainingBudgetSpan.textContent = `$${remainingBudget.toFixed(2)}`;

    // Update the tables
    updateLocalStorage();
    updateTables();
}

// Update local storage
function updateLocalStorage() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

// Update tables
function updateTables() {
    incomeTableBody.innerHTML = "";
    expenseTableBody.innerHTML = "";

    transactions.forEach(addTransactionToTable);
}

// Restoring transactions from local storage on page load
document.addEventListener("DOMContentLoaded", () => {
    const storedTransactions = localStorage.getItem("transactions");
    if (storedTransactions) {
        transactions = JSON.parse(storedTransactions);
        updateTables();
    }
});
