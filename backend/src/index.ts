import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import tenantRoutes from './routes/tenant.routes';
import registrationRoutes from './routes/registration.routes';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'WAYN-Ai' });
});

app.use('/api/tenants', tenantRoutes);
app.use('/api/registrations', registrationRoutes);

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});