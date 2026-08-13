/* ============================================
   JOYMIZ INVOICE - JAVASCRIPT
   ============================================ */

// ---------- Currency Symbols ----------
const currencySymbols = {
    GBP: '£', USD: '$', EUR: '€', CAD: 'C$',
    AUD: 'A$', JPY: '¥', INR: '₹', CHF: 'Fr'
};

function getCurrencySymbol() {
    const code = document.getElementById('currency').value;
    return currencySymbols[code] || '$';
}

function formatCurrency(amount) {
    const symbol = getCurrencySymbol();
    const num = parseFloat(amount) || 0;
    return symbol + num.toFixed(2);
}

// ---------- Row Management ----------
function addRow() {
    const tbody = document.getElementById('itemsBody');
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td><input type="text" class="item-desc" placeholder="Item description"></td>
        <td><input type="number" class="item-qty" value="1" min="1"></td>
        <td><input type="number" class="item-rate" value="0" min="0" step="0.01"></td>
        <td class="item-amount">${formatCurrency(0)}</td>
        <td><button type="button" class="btn-remove" onclick="removeRow(this)" title="Remove">✕</button></td>
    `;
    tbody.appendChild(tr);
    bindRowEvents(tr);
    recalculate();
}

function removeRow(btn) {
    const tbody = document.getElementById('itemsBody');
    if (tbody.rows.length > 1) {
        btn.closest('tr').remove();
        recalculate();
    }
}

function bindRowEvents(row) {
    row.querySelectorAll('.item-qty, .item-rate').forEach(input => {
        input.addEventListener('input', recalculate);
    });
}

// ---------- Calculation ----------
function recalculate() {
    const rows = document.querySelectorAll('#itemsBody tr');
    let subtotal = 0;

    rows.forEach(row => {
        const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
        const rate = parseFloat(row.querySelector('.item-rate').value) || 0;
        const amount = qty * rate;
        row.querySelector('.item-amount').textContent = formatCurrency(amount);
        subtotal += amount;
    });

    const taxRate = parseFloat(document.getElementById('taxRate').value) || 0;
    const discountRate = parseFloat(document.getElementById('discountRate').value) || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const discountAmount = subtotal * (discountRate / 100);
    const total = subtotal + taxAmount - discountAmount;

    document.getElementById('subtotal').textContent = formatCurrency(subtotal);
    document.getElementById('taxAmount').textContent = formatCurrency(taxAmount);
    document.getElementById('discountAmount').textContent = '-' + formatCurrency(discountAmount);
    document.getElementById('totalAmount').textContent = formatCurrency(total);

    updatePreview(subtotal, taxRate, taxAmount, discountRate, discountAmount, total);
}

// ---------- Preview ----------
function updatePreview(subtotal, taxRate, taxAmount, discountRate, discountAmount, total) {
    const symbol = getCurrencySymbol();

    document.getElementById('previewInvNumber').textContent =
        document.getElementById('invoiceNumber').value || 'INV-001';
    document.getElementById('previewDate').textContent =
        document.getElementById('invoiceDate').value || '-';
    document.getElementById('previewDueDate').textContent =
        document.getElementById('dueDate').value || '-';

    document.getElementById('previewFromName').textContent =
        document.getElementById('fromName').value || 'Your Name';
    document.getElementById('previewFromEmail').textContent =
        document.getElementById('fromEmail').value || '';
    document.getElementById('previewFromAddress').textContent =
        document.getElementById('fromAddress').value || '';
    document.getElementById('previewFromPhone').textContent =
        document.getElementById('fromPhone').value || '';

    document.getElementById('previewToName').textContent =
        document.getElementById('toName').value || 'Client Name';
    document.getElementById('previewToEmail').textContent =
        document.getElementById('toEmail').value || '';
    document.getElementById('previewToAddress').textContent =
        document.getElementById('toAddress').value || '';

    // Items
    const previewItems = document.getElementById('previewItems');
    previewItems.innerHTML = '';
    document.querySelectorAll('#itemsBody tr').forEach(row => {
        const desc = row.querySelector('.item-desc').value || '-';
        const qty = row.querySelector('.item-qty').value || 0;
        const rate = parseFloat(row.querySelector('.item-rate').value) || 0;
        const amount = qty * rate;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${escapeHtml(desc)}</td>
            <td>${qty}</td>
            <td>${symbol}${rate.toFixed(2)}</td>
            <td>${symbol}${amount.toFixed(2)}</td>
        `;
        previewItems.appendChild(tr);
    });

    document.getElementById('previewSubtotal').textContent = formatCurrency(subtotal);

    const taxLine = document.getElementById('previewTaxLine');
    const discountLine = document.getElementById('previewDiscountLine');

    if (taxRate > 0) {
        taxLine.style.display = 'flex';
        document.getElementById('previewTaxRate').textContent = taxRate;
        document.getElementById('previewTaxAmount').textContent = formatCurrency(taxAmount);
    } else {
        taxLine.style.display = 'none';
    }

    if (discountRate > 0) {
        discountLine.style.display = 'flex';
        document.getElementById('previewDiscountRate').textContent = discountRate;
        document.getElementById('previewDiscountAmount').textContent = '-' + formatCurrency(discountAmount);
    } else {
        discountLine.style.display = 'none';
    }

    document.getElementById('previewTotal').textContent = formatCurrency(total);

    const notes = document.getElementById('notes').value;
    document.getElementById('previewNotes').textContent = notes || '';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ---------- Actions ----------
function previewInvoice() {
    recalculate();
    if (window.innerWidth <= 900) {
        document.getElementById('previewPanel').classList.add('active');
    }
}

function togglePreview() {
    document.getElementById('previewPanel').classList.remove('active');
}

function downloadPDF() {
    recalculate();
    window.print();
}

// ---------- Mobile Menu ----------
document.querySelector('.mobile-menu-btn').addEventListener('click', function () {
    document.querySelector('.nav-links').classList.toggle('active');
});

// ---------- Event Bindings ----------
document.addEventListener('DOMContentLoaded', function () {
    // Set default dates
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('invoiceDate').value = today;

    const due = new Date();
    due.setDate(due.getDate() + 30);
    document.getElementById('dueDate').value = due.toISOString().split('T')[0];

    // Bind existing row events
    document.querySelectorAll('#itemsBody tr').forEach(bindRowEvents);

    // Bind global inputs
    document.querySelectorAll('#invoiceForm input, #invoiceForm select, #invoiceForm textarea').forEach(el => {
        el.addEventListener('input', recalculate);
    });

    // Initial calc
    recalculate();
});
