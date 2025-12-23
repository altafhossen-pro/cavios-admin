import { Button, Card, CardBody, CardHeader, CardTitle } from 'react-bootstrap'

import { currency } from '@/context/constants'

interface Transaction {
  id: string
  date: string
  amount: string
  status: 'Cr' | 'Dr'
  description: string
}

interface TransactionsProps {
  transactions: Transaction[]
}

const Transactions = ({ transactions }: TransactionsProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  return (
    <Card>
      <CardHeader className="d-flex justify-content-between align-items-center">
        <CardTitle>Recent Transactions</CardTitle>
        <Button variant="light" size="sm" href="/ecommerce/orders">
          View All
        </Button>
      </CardHeader>
      <CardBody>
        <div className="table-responsive">
          <table className="table table-hover mb-0 table-centered">
            <thead>
              <tr>
                <th className="py-1">ID</th>
                <th className="py-1">Date</th>
                <th className="py-1">Amount</th>
                <th className="py-1">Status</th>
                <th className="py-1">Description</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? (
                transactions.slice(0, 5).map((transaction, idx) => (
                  <tr key={transaction.id || idx}>
                    <td>{transaction.id}</td>
                    <td>{formatDate(transaction.date)}</td>
                    <td>
                      {currency}
                      {transaction.amount}
                    </td>
                    <td>
                      <span className={`badge bg-${transaction.status === 'Dr' ? 'danger' : 'success'}`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td>{transaction.description}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center text-muted">No transactions found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
  )
}

export default Transactions
