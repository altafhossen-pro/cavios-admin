import { Button, Card, CardBody, CardHeader, CardTitle } from 'react-bootstrap'

interface RecentUser {
  _id: string
  name: string
  email: string
  phone?: string
  createdAt: string
}

interface AccountsProps {
  recentUsers: RecentUser[]
}

const Accounts = ({ recentUsers }: AccountsProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Card>
      <CardHeader className="d-flex justify-content-between align-items-center">
        <CardTitle>New Accounts</CardTitle>
        <Button variant="light" size="sm" href="/customers">
          View All
        </Button>
      </CardHeader>
      <CardBody className="pb-1">
        <div className="table-responsive">
          <table className="table table-hover mb-0 table-centered">
            <thead>
              <tr>
                <th className="py-1">ID</th>
                <th className="py-1">Date</th>
                <th className="py-1">Name</th>
                <th className="py-1">Email</th>
                <th className="py-1">Phone</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.length > 0 ? (
                recentUsers.map((user, idx) => (
                  <tr key={user._id || idx}>
                    <td>#{user._id.slice(-6).toUpperCase()}</td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="avatar-xs me-2">
                          <div className="avatar-title bg-primary-subtle text-primary rounded-circle">
                            {getInitials(user.name || 'U')}
                          </div>
                        </div>
                        <span className="align-middle">{user.name || 'N/A'}</span>
                      </div>
                    </td>
                    <td>{user.email || 'N/A'}</td>
                    <td>{user.phone || 'N/A'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center text-muted">No new accounts found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
  )
}

export default Accounts
