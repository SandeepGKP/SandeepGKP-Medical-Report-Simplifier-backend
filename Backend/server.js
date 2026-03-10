const express = require('express');
const app = express();
const reportsRouter = require('./routes/reports');

app.use(express.json());
app.use('/api', reportsRouter);

app.get('/api', (req, res) => res.send('Server is working'));

const port = process.env.PORT || 8000;
app.listen(port, "0.0.0.0", () => {
    console.log(`Listening on ${port}`);
});