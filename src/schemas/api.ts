import { z } from 'zod'

// Base schema for common fields
const baseContactSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  clientId: z.string().nullish(), // GA4 client ID for consistent tracking (can be null or undefined)
  sessionId: z.string().nullish(), // GA4 session ID for consistent tracking (can be null or undefined)
})

// Schema for showreel API
export const showreelSchema = baseContactSchema

// Schema for contact API
export const contactSchema = baseContactSchema.extend({
  message: z.string().min(1, 'Message is required').max(5000, 'Message must be less than 5000 characters'),
})

// Type exports
export type ShowreelRequest = z.infer<typeof showreelSchema>
export type ContactRequest = z.infer<typeof contactSchema>
