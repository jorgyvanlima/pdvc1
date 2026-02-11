import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { asyncHandler } from '../middleware/asyncHandler';
import { authMiddleware } from '../middleware/auth';
import { FinancialController } from '../controllers/financial.controller';

const router = Router();
const controller = new FinancialController();

// Multer setup
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    try {
        fs.mkdirSync(uploadDir, { recursive: true });
    } catch (err) {
        console.error('Error creating uploads directory', err);
    }
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

router.use(authMiddleware);

// Categories
router.get('/categories', asyncHandler(controller.listCategories.bind(controller)));
router.post('/categories', asyncHandler(controller.createCategory.bind(controller)));

// Bank Accounts
router.get('/bank-accounts', asyncHandler(controller.listBankAccounts.bind(controller)));
router.post('/bank-accounts', asyncHandler(controller.createBankAccount.bind(controller)));

// Transactions
router.get('/transactions', asyncHandler(controller.listTransactions.bind(controller)));

// Payables
router.get('/payables', asyncHandler(controller.listPayables.bind(controller)));
router.post('/payables', upload.array('files'), asyncHandler(controller.createPayable.bind(controller)));
router.post('/payables/:id/pay', asyncHandler(controller.payBill.bind(controller)));

// Receivables
router.get('/receivables', asyncHandler(controller.listReceivables.bind(controller)));
router.post('/receivables', upload.array('files'), asyncHandler(controller.createReceivable.bind(controller)));
router.post('/receivables/:id/receive', asyncHandler(controller.receivePayment.bind(controller)));

// Stats
router.get('/stats', asyncHandler(controller.getStats.bind(controller)));

export default router;
