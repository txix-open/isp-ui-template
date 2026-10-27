export interface Session {
  headerName: string
  token: string
}
export interface LoginInput {
  email: string
  password: string
}
export interface Profile {
  id: string
  displayName: string
  email: string
  permissions: string[]
}
