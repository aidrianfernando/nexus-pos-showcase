const categoryRepository =
  require('../repositories/categoryRepository');

function makeError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function validateId(id) {
  if (!/^[1-9]\d*$/.test(String(id))) {
    throw makeError('Invalid category ID', 400);
  }

  return id;
}

function validateName(value) {
  const name = String(value || '').trim();

  if (!name || name.length > 100) {
    throw makeError('Invalid category name', 400);
  }

  return name;
}

async function getCategories() {
  return categoryRepository.findAll();
}

async function getCategoryById(id) {
  validateId(id);

  const category = await categoryRepository.findById(id);

  if (!category) {
    throw makeError('Category not found', 404);
  }

  return category;
}

async function createCategory({ name, description }) {
  const validName = validateName(name);

  const duplicate =
    await categoryRepository.findByName(validName);

  if (duplicate) {
    throw makeError('Category name already exists', 409);
  }

  return categoryRepository.create({
    name: validName,
    description:
      description === undefined || description === null
        ? null
        : String(description).trim(),
  });
}

async function updateCategory(id, data) {
  validateId(id);

  const current = await categoryRepository.findById(id);

  if (!current) {
    throw makeError('Category not found', 404);
  }

  const name =
    data.name === undefined
      ? current.name
      : validateName(data.name);

  const duplicate =
    await categoryRepository.findByName(name);

  if (
    duplicate &&
    String(duplicate.id) !== String(current.id)
  ) {
    throw makeError('Category name already exists', 409);
  }

  const description =
    data.description === undefined
      ? current.description
      : data.description === null
        ? null
        : String(data.description).trim();

  return categoryRepository.update(id, {
    name,
    description,
    is_active: current.is_active,
  });
}

async function setCategoryStatus(id, isActive) {
  validateId(id);

  if (typeof isActive !== 'boolean') {
    throw makeError('isActive must be a boolean', 400);
  }

  const current = await categoryRepository.findById(id);

  if (!current) {
    throw makeError('Category not found', 404);
  }

  return categoryRepository.setActive(id, isActive);
}

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  setCategoryStatus,
};