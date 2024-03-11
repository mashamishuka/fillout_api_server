const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON requests
app.use(express.json());

// Endpoint for fetching form responses with filters
app.get('/:formId/filteredResponses', async (req, res) => {
    try {
        const formId = req.params.formId;
        const apiKey = 'sk_prod_TfMbARhdgues5AuIosvvdAC9WsA5kXiZlW8HZPaRDlIbCpSpLsXBeZO7dCVZQwHAY3P4VSBPiiC33poZ1tdUj2ljOzdTCCOSpUZ_3912';
        const filters = req.query.filters ? JSON.parse(req.query.filters) : [];

        // Fetch form responses from Fillout.com API
        const response = await axios.get(`https://api.fillout.com/v1/api/forms/${formId}`, {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });

        // Filter responses based on provided filters
        const filteredResponses = response.data.questions.filter(response => {
            for (const filter of filters) {
                const question = response.questions.find(question => question.id === filter.id);
                if (!question) return false;
                switch (filter.condition) {
                    case 'equals':
                        if (question.value !== filter.value) return false;
                        break;
                    case 'does_not_equal':
                        if (question.value === filter.value) return false;
                        break;
                    case 'greater_than':
                        if (new Date(question.value) <= new Date(filter.value)) return false;
                        break;
                    case 'less_than':
                        if (new Date(question.value) >= new Date(filter.value)) return false;
                        break;
                }
            }
            return true;
        });

        // Send filtered responses
        res.json({
            responses: filteredResponses,
            totalResponses: filteredResponses.length,
            pageCount: 1 // Assuming no pagination for simplicity
        });
    } catch (error) {
        console.error('Error fetching form responses:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
