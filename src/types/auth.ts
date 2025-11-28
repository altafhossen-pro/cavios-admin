export type UserType = {
  id: string
  username: string
  email: string
  password?: string // Optional - not stored after login
  firstName: string
  lastName: string
  role: string
  token: string
}
