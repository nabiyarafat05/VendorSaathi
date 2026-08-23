import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import Groq from 'groq-sdk'
import { vendorRouter } from './vendorRoutes.mjs'

// =====================================================
// ENVIRONMENT CHECKS
// =====================================================

if (!process.env.GROQ_API_KEY) {
  throw new Error(
    'GROQ_API_KEY is missing. Check your .env file.'
  )
}

if (!process.env.WEATHER_API_KEY) {
  throw new Error(
    'WEATHER_API_KEY is missing. Check your .env file.'
  )
}


// =====================================================
// APP SETUP
// =====================================================

const app = express()

// Render provides PORT automatically.
// Locally, it will use 3001.
const port = process.env.PORT || 3001

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})


// =====================================================
// MIDDLEWARE
// =====================================================

app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
    ],
  })
)

app.use(express.json())


// =====================================================
// VENDORSAATHI FEATURE ROUTES
// =====================================================

// Routes include:
// GET  /api/recommendation
// POST /api/checkin
// GET  /api/inventory
// etc.

app.use('/api', vendorRouter)


// =====================================================
// HOME ROUTE
// =====================================================

app.get('/', (request, response) => {
  response.json({
    message: 'VendorSaathi API is running',
  })
})


// =====================================================
// AI CHAT API
// =====================================================

app.post('/api/chat', async (request, response) => {
  try {
    const { message } = request.body

    if (!message || typeof message !== 'string') {
      return response.status(400).json({
        error: 'Please enter a message.',
      })
    }

    const completion =
      await groq.chat.completions.create({
        model: 'openai/gpt-oss-20b',

        messages: [
          {
            role: 'system',

            content: `You are VendorSaathi, a friendly AI business assistant for Indian street-food vendors.

Give practical and short advice about sales, inventory, profit, food wastage, and customer demand.

Use simple English or Hinglish when the user writes in Hinglish.

Do not use Markdown symbols such as **, #, bullet characters, tables, or numbered lists. Write plain, short sentences.

Do not invent vendor sales data. If the vendor has not provided their sales or inventory data, clearly say that your recommendation is a general estimate.

Never promise exact profit, loan approval, or guaranteed demand.

Answer in 2 to 4 complete sentences. Never end with an incomplete sentence.`,
          },

          {
            role: 'user',
            content: message.slice(0, 1000),
          },
        ],

        temperature: 0.5,
        max_completion_tokens: 250,
      })

    const reply =
      completion.choices[0]?.message?.content ||
      'Sorry, I could not generate a response right now.'

    response.json({
      reply,
    })

  } catch (error) {
    console.error('AI error:', error)

    response.status(500).json({
      error:
        'VendorSaathi AI is temporarily unavailable. Please try again.',
    })
  }
})


// =====================================================
// WEATHER API
// =====================================================

app.get('/api/weather', async (request, response) => {
  try {

    // -------------------------------------------------
    // LUCKNOW COORDINATES
    // -------------------------------------------------

    const latitude = 26.8467
    const longitude = 80.9462


    // -------------------------------------------------
    // CURRENT WEATHER
    // -------------------------------------------------

    const currentWeatherUrl =
      'https://api.openweathermap.org/data/2.5/weather' +
      `?lat=${latitude}` +
      `&lon=${longitude}` +
      `&appid=${process.env.WEATHER_API_KEY}` +
      '&units=metric'

    const currentResponse =
      await fetch(currentWeatherUrl)

    if (!currentResponse.ok) {
      throw new Error(
        `Current weather API error: ${currentResponse.status}`
      )
    }

    const currentData =
      await currentResponse.json()


    // -------------------------------------------------
    // 5-DAY / 3-HOUR FORECAST
    // -------------------------------------------------

    const forecastUrl =
      'https://api.openweathermap.org/data/2.5/forecast' +
      `?lat=${latitude}` +
      `&lon=${longitude}` +
      `&appid=${process.env.WEATHER_API_KEY}` +
      '&units=metric'

    const forecastResponse =
      await fetch(forecastUrl)

    if (!forecastResponse.ok) {
      throw new Error(
        `Forecast API error: ${forecastResponse.status}`
      )
    }

    const forecastData =
      await forecastResponse.json()


    // -------------------------------------------------
    // FIND TOMORROW'S DATE
    // -------------------------------------------------

    const tomorrow = new Date()

    tomorrow.setDate(
      tomorrow.getDate() + 1
    )

    const tomorrowDate =
      tomorrow.toISOString().split('T')[0]


    // -------------------------------------------------
    // FIND TOMORROW'S FORECAST DATA
    // -------------------------------------------------

    const tomorrowForecasts =
      forecastData.list.filter((item) => {
        return item.dt_txt.startsWith(
          tomorrowDate
        )
      })


    // -------------------------------------------------
    // DEFAULT TOMORROW VALUES
    // -------------------------------------------------

    let tomorrowTemperature = null

    let tomorrowRainProbability = 0

    let tomorrowDescription =
      'No forecast available'

    let tomorrowWeatherMain =
      'Clouds'

    let tomorrowIcon =
      '03d'


    // -------------------------------------------------
    // CALCULATE TOMORROW'S WEATHER
    // -------------------------------------------------

    if (tomorrowForecasts.length > 0) {

      // Average temperature
      const temperatures =
        tomorrowForecasts.map(
          (item) => item.main.temp
        )

      tomorrowTemperature =
        Math.round(
          temperatures.reduce(
            (sum, temp) => sum + temp,
            0
          ) / temperatures.length
        )


      // Highest rain probability
      const rainValues =
        tomorrowForecasts.map(
          (item) => item.pop || 0
        )

      tomorrowRainProbability =
        Math.round(
          Math.max(...rainValues) * 100
        )


      // Forecast closest to midday
      const middayForecast =
        tomorrowForecasts.find((item) =>
          item.dt_txt.includes(
            '12:00:00'
          )
        ) || tomorrowForecasts[0]


      tomorrowDescription =
        middayForecast.weather[0].description

      tomorrowWeatherMain =
        middayForecast.weather[0].main

      tomorrowIcon =
        middayForecast.weather[0].icon
    }


    // -------------------------------------------------
    // SEND REAL WEATHER DATA
    // -------------------------------------------------

    response.json({

      city: currentData.name,

      country:
        currentData.sys.country,

      temperature:
        currentData.main.temp,

      feelsLike:
        currentData.main.feels_like,

      humidity:
        currentData.main.humidity,

      description:
        currentData.weather[0].description,

      weatherMain:
        currentData.weather[0].main,

      weatherCode:
        currentData.weather[0].id,

      icon:
        currentData.weather[0].icon,


      today: {
        temperature:
          Math.round(
            currentData.main.temp
          ),
      },


      tomorrow: {
        temperature:
          tomorrowTemperature,

        rainProbability:
          tomorrowRainProbability,

        description:
          tomorrowDescription,

        weatherMain:
          tomorrowWeatherMain,

        icon:
          tomorrowIcon,
      },


      // false = real OpenWeather data
      demo: false,
    })

  } catch (error) {

    console.error(
      'Weather API error:',
      error.message
    )


    // =================================================
    // FALLBACK DEMO DATA
    // =================================================

    response.json({

      city: 'Lucknow',

      country: 'IN',

      temperature: 28,

      feelsLike: 30,

      humidity: 74,

      description: 'light rain',

      weatherMain: 'Rain',

      weatherCode: 500,

      icon: '10d',


      today: {
        temperature: 31,
      },


      tomorrow: {
        temperature: 26,

        rainProbability: 70,

        description: 'light rain',

        weatherMain: 'Rain',

        icon: '10d',
      },


      // true = fallback/demo data
      demo: true,
    })
  }
})


// =====================================================
// START SERVER
// =====================================================

app.listen(
  port,
  '0.0.0.0',
  () => {
    console.log(
      `VendorSaathi API running on port ${port}`
    )
  }
)