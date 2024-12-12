class ExpenseCalculator extends HTMLElement {
    constructor() {
        super();

        this.data = {
            expenses: [],
            total: 0
        };

        this.proxy = new Proxy(this.data, {
            set: (target, property, value) => {
                target[property] = value;
                if (property === 'expenses') {
                    this.updateList();
                }
                if (property === 'total') {
                    this.updateTotal();
                }
                return true;
            }
        });

        this.attachShadow({ mode: 'open' });
        this.render();
    }

    connectedCallback() {
        const form = this.shadowRoot.querySelector('form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const nameInput = this.shadowRoot.querySelector('#expense-name');
            const amountInput = this.shadowRoot.querySelector('#expense-amount');
            const name = nameInput.value.trim();
            const amount = parseFloat(amountInput.value);
            if (name && !isNaN(amount)) {
                this.proxy.expenses = [...this.proxy.expenses, { name, amount }];
                this.proxy.total += amount;
                form.reset();
            }
        });
        this.shadowRoot.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON' && e.target.dataset.index !== undefined) {
                const index = parseInt(e.target.dataset.index, 10);
                const removedExpense = this.proxy.expenses[index];
                this.proxy.expenses = this.proxy.expenses.filter((_, i) => i !== index);
                this.proxy.total -= removedExpense.amount;
            }
        });
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                expense-calculator {
                    display: block;
                    width: 100%;
                    max-width: 500px;
                    margin: 50px auto;
                    font-family: Arial, sans-serif;
                    background: #f9f9f9;
                    border: 1px solid #ccc;
                    border-radius: 8px;
                    padding: 20px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                }
                form {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 20px;
                }

                input {
                    flex: 1;
                    padding: 8px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                }

                button {
                    padding: 8px 16px;
                    background-color: #333;
                    color: #fff;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }

                button:hover {
                    background-color: #666;
                }

               

                li {
                    display: flex;
                    justify-content: space-between;
                    padding: 8px 0;
                    border-bottom: 1px solid white;
                }

                .total {
                    font-weight: bold;
                    text-align: right;
                    margin-top: 10px;
                    font-size: 16px;
                }
            </style>
            <form>
                <input id="expense-name" type="text" placeholder="Название" required>
                <input id="expense-amount" type="number" placeholder="Сумма" required>
                <button type="submit">Добавить</button>
            </form>
            <ul></ul>
            <div class="total">Общая сумма: 0 ₽</div>
        `;
    }

    updateList() {
        const ul = this.shadowRoot.querySelector('ul');
        ul.innerHTML = '';
        this.proxy.expenses.forEach((expense, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                ${expense.name} — ${expense.amount.toFixed(2)} ₽
                <button data-index="${index}">Удалить</button>
            `;
            ul.appendChild(li);
        });
    }

    updateTotal() {
        const totalDiv = this.shadowRoot.querySelector('.total');
        totalDiv.textContent = `Общая сумма: ${this.proxy.total.toFixed(2)} ₽`;
    }
}

customElements.define('expense-calculator', ExpenseCalculator);