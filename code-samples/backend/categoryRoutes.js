const express = require('express');

const authenticate = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const categoryController =
  require('../controllers/categoryController');

const router = express.Router();

router.use(authenticate);

router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategoryById);

router.post(
  '/',
  authorizeRoles('admin', 'manager'),
  categoryController.createCategory
);

router.patch(
  '/:id',
  authorizeRoles('admin', 'manager'),
  categoryController.updateCategory
);

router.patch(
  '/:id/status',
  authorizeRoles('admin', 'manager'),
  categoryController.setCategoryStatus
);

module.exports = router;