const categoryService =
  require('../services/categoryService');

async function getCategories(req, res, next) {
  try {
    const data = await categoryService.getCategories();

    res.status(200).json({
      status: 'success',
      data,
    });
  } catch (error) {
    next(error);
  }
}

async function getCategoryById(req, res, next) {
  try {
    const data = await categoryService.getCategoryById(
      req.params.id
    );

    res.status(200).json({
      status: 'success',
      data,
    });
  } catch (error) {
    next(error);
  }
}

async function createCategory(req, res, next) {
  try {
    const data = await categoryService.createCategory(
      req.body || {}
    );

    res.status(201).json({
      status: 'success',
      data,
    });
  } catch (error) {
    next(error);
  }
}

async function updateCategory(req, res, next) {
  try {
    const data = await categoryService.updateCategory(
      req.params.id,
      req.body || {}
    );

    res.status(200).json({
      status: 'success',
      data,
    });
  } catch (error) {
    next(error);
  }
}

async function setCategoryStatus(req, res, next) {
  try {
    const data = await categoryService.setCategoryStatus(
      req.params.id,
      req.body?.isActive
    );

    res.status(200).json({
      status: 'success',
      data,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  setCategoryStatus,
};