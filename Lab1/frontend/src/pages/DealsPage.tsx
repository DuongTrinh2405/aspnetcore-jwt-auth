import { useEffect, useState, type FormEvent } from 'react'
import { createDeal, getDeals } from '../services/deals'
import type { Deal } from '../types/deal'

const defaultForm = {
  title: '',
  amount: 0,
  stage: 'Prospect',
  status: 'Open',
  customerId: 1,
  propertyId: '',
  employeeId: '',
  expectedCloseDate: '',
  notes: '',
}

export function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState(defaultForm)

  const loadDeals = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getDeals()
      setDeals(data)
    } catch (err: any) {
      const message =
        err?.response?.data?.error?.message ||
        err?.response?.data ||
        'Cannot load deals'
      setError(String(message))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadDeals()
  }, [])

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    try {
      await createDeal({
        title: form.title,
        amount: Number(form.amount),
        stage: form.stage,
        status: form.status,
        customerId: Number(form.customerId),
        propertyId: form.propertyId ? Number(form.propertyId) : null,
        employeeId: form.employeeId ? Number(form.employeeId) : null,
        expectedCloseDate: form.expectedCloseDate || null,
        notes: form.notes || null,
      })
      setForm(defaultForm)
      await loadDeals()
    } catch (err: any) {
      const message =
        err?.response?.data?.error?.message ||
        err?.response?.data ||
        'Create deal failed'
      setError(String(message))
    }
  }

  return (
    <section>
      <h2>Deals</h2>
      <p>Create and view deals from your backend module.</p>

      <form className="card form-grid" onSubmit={handleCreate}>
        <h3>Create deal</h3>
        <input
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Amount"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
        />
        <input
          placeholder="Customer ID"
          type="number"
          value={form.customerId}
          onChange={(e) => setForm({ ...form, customerId: Number(e.target.value) })}
          required
        />
        <select
          value={form.stage}
          onChange={(e) => setForm({ ...form, stage: e.target.value })}
        >
          <option>Prospect</option>
          <option>Proposal</option>
          <option>Negotiation</option>
          <option>Won</option>
          <option>Lost</option>
        </select>
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
        >
          <option>Open</option>
          <option>Won</option>
          <option>Lost</option>
          <option>Cancelled</option>
        </select>
        <input
          placeholder="Expected close date (optional)"
          type="datetime-local"
          value={form.expectedCloseDate}
          onChange={(e) => setForm({ ...form, expectedCloseDate: e.target.value })}
        />
        <textarea
          placeholder="Notes"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          rows={3}
        />
        <button className="btn btn-primary" type="submit">
          Create deal
        </button>
      </form>

      {error && <div className="error-box">{error}</div>}

      <div className="card">
        <h3>Deal list</h3>
        {loading ? (
          <p>Loading...</p>
        ) : deals.length === 0 ? (
          <p>No deal found.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Amount</th>
                  <th>Stage</th>
                  <th>Status</th>
                  <th>Customer</th>
                </tr>
              </thead>
              <tbody>
                {deals.map((deal) => (
                  <tr key={deal.id}>
                    <td>{deal.id}</td>
                    <td>{deal.title}</td>
                    <td>{deal.amount}</td>
                    <td>{deal.stage}</td>
                    <td>{deal.status}</td>
                    <td>{deal.customerId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
