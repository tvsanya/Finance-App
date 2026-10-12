<template>
    <div class="add-transaction_wrapper">
        <div class="transaction-category">
            <select id="transactionCategory" v-model="transaction.category">
                <option value="" disabled>Выберите категорию</option>
                <option value="income" >Доход</option>
                <option value="expense" >Расход</option>
            </select>
            <input type="number" id="transactionAmount" v-model="transaction.amount" placeholder="Сумма" min="0.01" step="0.01">
        </div>
        <div class="transaction-type">
            <input type="text" id="transactionType" v-model="transaction.type" placeholder="Введите название">

            </input>
            <input type="date" id="transactionDate" v-model="transaction.date" value="2026-08-15">
        </div>
        <input type="text" id="transactionDescription" v-model="transaction.description" placeholder="Описание (необязательно)">
        <button id="transaction-add" @click="submitTransaction">Добавить транзакцию</button>
    </div>
</template>

<script setup lang="ts">
import { reactive} from 'vue'
import type { NewTransaction } from '../types/transaction';


const emit = defineEmits<{
    (e: 'transaction-added', transaction: NewTransaction): void
}>()

type TransactionForm = {
    category: NewTransaction['category'] | ''
    amount: number
    type: string
    date: string
    description: string
    tags: string[]
}

const transaction = reactive<TransactionForm>({
    category: '',
    amount: 0, 
    type: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    tags: []
})

function submitTransaction() {
    if (!transaction.category || !transaction.amount || !transaction.type) {
        alert('Пожалуйста, заполните все обязательные поля')
        return
    }

    if (transaction.amount <= 0) {
        alert('Сумма должна быть больше нуля')
        return
    }

    emit('transaction-added', {
        category: transaction.category,
        amount: Number(transaction.amount),
        type: transaction.type,
        date: transaction.date,
        description: transaction.description,
        tags: transaction.tags
    })

     // Очищаем форму
    transaction.category = ''
    transaction.amount = 0
    transaction.type = ''
    transaction.description = ''
    transaction.tags = []
    transaction.date = new Date().toISOString().split('T')[0]
}
</script>

<style scoped>
.add-transaction_wrapper{
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 16px 24px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: var(--primary-color);
}

.transaction-category, .transaction-type{
    display: flex;
    gap: 4px;
}

#transaction-add{
    padding: 8px 4px;
    background: var(--bg-primary);
    border-radius: 6px;
    transition: all .3s;
}

#transaction-add:hover{
    background-color: rgb(42, 221, 42);
}
</style>