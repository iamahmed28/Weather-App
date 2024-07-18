import { Client, GatewayIntentBits } from 'discord.js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();  // Load environment variables

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const fetchApi = async (location) => {
    try {
        const url = `https://api.tomorrow.io/v4/weather/forecast?location=${location}&apikey=${process.env.TOMORROW_API_KEY}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch data from the API');
        }
        const data = await response.json();
        if (data.timelines && data.timelines.minutely && data.timelines.minutely[0] && data.timelines.minutely[0].values) {
            const temperature = data.timelines.minutely[0].values.temperature;
            const windspeed = data.timelines.minutely[0].values.windSpeed;
            const humidity = data.timelines.minutely[0].values.humidity;
            return { temperature, windspeed, humidity };
        } else {
            throw new Error('Unexpected API response format');
        }
    } catch (error) {
        console.error(error);
        throw new Error('Unable to get weather data');
    }
};

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    const usermessage = message.content

    if (usermessage.startsWith('weather')) {
        if (!usermessage) {
            return message.reply({
                content: "I couldn't understand your message. Please provide a valid location."
            });
        }
    
        try {
            const user = usermessage.slice(8,);
            const { temperature, windspeed, humidity } = await fetchApi(user);
            message.reply({
                content: `Current Temperature: ${temperature}°C, Wind Speed: ${windspeed} m/s, Humidity: ${humidity}%`
            });
        } catch (error) {
            message.reply({
                content: `I couldn't retrieve the weather data. Please try again later or provide a different location.`
            });
        }
    }
    
    
});

client.login(process.env.PRIVATE);
