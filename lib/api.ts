// const API_BASE_URL = "http://localhost:3000/api/v1"

// export async function signUp(data: {
//   username: string
//   email: string
//   otp: string
//   phone_number: string
//   password: string
//   confirm_password: string
//   gender: string
//   role: string
// }) {
//   const response = await fetch(`${API_BASE_URL}/auth/sign-up`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(data),
//   })

//   if (!response.ok) {
//     const error = await response.json()
//     throw new Error(error.message || "Failed to sign up")
//   }

//   return response.json()
// }

// export async function sendOtp(email: string) {
//   const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ email }),
//   })

//   if (!response.ok) {
//     const error = await response.json()
//     throw new Error(error.message || "Failed to send OTP")
//   }

//   return response.json()
// }

// export async function login(data: { email: string; password: string }) {
//   const response = await fetch(`${API_BASE_URL}/auth/login`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(data),
//   })

//   if (!response.ok) {
//     const error = await response.json()
//     throw new Error(error.message || "Failed to login")
//   }

//   return response.json()
// }

