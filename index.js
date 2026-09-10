const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

async function getYahooLiveRealData() {
    try {
        const response = await axios.get('https://yahoo.com^SET', {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const result = response.data.chart.result.meta;
        return { set_index: result.regularMarketPrice, set_value: result.regularMarketVolume };
    } catch (error) {
        return null;
    }
}

app.get('/api/2d-live', async (req, res) => {
    const realMarket = await getYahooLiveRealData();
    const setIndex = realMarket && realMarket.set_index ? realMarket.set_index : 1615.27;
    const setValue = realMarket && realMarket.set_value ? realMarket.set_value : 43105.48;

    const indexStr = setIndex.toFixed(2);
    const valueStr = Math.floor(setValue).toString();
    const live2D = indexStr.replace('.', '').slice(-1) + valueStr.slice(-1);

    const timelyData = {
        "09:30 AM": { modern: "83", internet: "23" },
        "12:01 PM": { live_2d: "75", set_index: "1,615.27", set_value: "43,105.48" },
        "02:00 PM": { modern: "--", internet: "--" },
        "04:30 PM": { live_2d: live2D, set_index: Number(setIndex).toLocaleString('en-US', {minimumFractionDigits: 2}), set_value: Number(setValue).toLocaleString('en-US') }
    };

    const now = new Date();
    const formattedTime = `Updated: ${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${now.toTimeString().split(' ')}`;

    res.json({ status: "success", main_live: live2D, updated_time: formattedTime, history_today: timelyData });
});

app.listen(PORT, () => { console.log(`Server is running on port ${PORT}`); });
