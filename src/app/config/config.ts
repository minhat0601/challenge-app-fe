import { z } from "zod"

const configSchema = z.object({
    NEXT_PUBLIC_API_ENDPOINT: z.string().default('http://localhost:3000'),
    NEXT_PUBLIC_APP_NAME: z.string().default('Challenge App'),
    NODE_ENV: z.string().default('development'),
    AUTH_ENDPOINTS: z.object({
        LOGIN: z.string().default('/auth/login'),
        REGISTER: z.string().default('/auth/register'),
        FORGOT_PASSWORD: z.string().default('/auth/forgot-password'),
        RESET_PASSWORD: z.string().default('/auth/reset-password'),
        CHANGE_PASSWORD: z.string().default('/api/auth/change-password')
    }).default({
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        FORGOT_PASSWORD: '/auth/forgot-password',
        RESET_PASSWORD: '/auth/reset-password',
        CHANGE_PASSWORD: '/api/auth/change-password',
    })
})

const configProject = configSchema.safeParse({
    NEXT_PUBLIC_API_ENDPOINT: process.env.NEXT_PUBLIC_API_ENDPOINT,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NODE_ENV: process.env.NODE_ENV,
    AUTH_ENDPOINTS: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        FORGOT_PASSWORD: '/auth/forgot-password',
        RESET_PASSWORD: '/auth/reset-password',
        CHANGE_PASSWORD: '/auth/change-password',
    }
})

if (!configProject.success) {
    console.error(configProject.error.issues)
    throw new Error('Lỗi khi xử lý env')
}

const envConf = configProject.data
export default envConf