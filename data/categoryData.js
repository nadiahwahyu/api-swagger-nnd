let categories = [];
let currentId = 1;

const getAll = () => categories;

const getById = (id) => categories.find(c => c.id === id);

const create = (name) => {
  const newCategory = {
    id: currentId++,
    name,
    created_at: new Date(),
    updated_at: null,
  };

  categories.push(newCategory);
  return newCategory;
};

const update = (id, name) => {
  const category = categories.find(c => c.id === id);
  if (!category) return null;

  category.name = name;
  category.updated_at = new Date();

  return category;
};

const remove = (id) => {
  const index = categories.findIndex(c => c.id === id);
  if (index === -1) return null;

  return categories.splice(index, 1)[0];
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};