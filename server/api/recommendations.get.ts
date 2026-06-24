import { defineEventHandler } from 'h3'
import { listRecommendations } from '../repositories'

export default defineEventHandler(() => listRecommendations())
