<script>
/**
 * Populate CMS Data from an external API. https://dummyjson.com/products
 */
window.fsAttributes = window.fsAttributes || [];
window.fsAttributes.push([
  'cmsfilter',
  async (filtersInstances: CMSFilters[]) => {
    // Get the filters instance
    const [filtersInstance] = filtersInstances;

    // Get the list instance
    const { listInstance } = filtersInstance;

    // Save a copy of the template
    const [firstItem] = listInstance.items;
    const itemTemplateElement = firstItem.element;

    // Fetch external data
    const products = await fetchProducts();

    // Remove existing items
    listInstance.clearItems();

    // Create the new items
    const newItems = products.map((product) => createItem(product, itemTemplateElement));

    // Populate the list
    await listInstance.addItems(newItems);

    // Get the template filter
    const filterTemplateElement = filtersInstance.form.querySelector<HTMLLabelElement>('[data-element="filter"]');
    if (!filterTemplateElement) return;

    // Get the parent wrapper
    const filtersWrapper = filterTemplateElement.parentElement;
    if (!filtersWrapper) return;

    // Remove the template from the DOM
    filterTemplateElement.remove();

    // Collect the categories
    const categories = collectCategories(products);

    // Create the new filters and append them to the parent wrapper
    for (const category of categories) {
      const newFilter = createFilter(category, filterTemplateElement);
      if (!newFilter) continue;

      filtersWrapper.append(newFilter);
    }

    // Sync the CMSFilters instance with the newly created filters
    filtersInstance.storeFiltersData();
  },
]);

/**
 * Fetches products from Dummy JSON API.
 * @returns An array of products.
 */
const fetchProducts = async () => {
  try {
    const response = await fetch('https://dummyjson.com/products');
    const data: Product[] = await response.json();

    return data;
  } catch (error) {
    return [];
  }
};

/**
 * Creates an item from the template element.
 * @param product The product data to create the item from.
 * @param templateElement The template element.
 *
 * @returns A new Collection Item element.
 */
const createItem = (product: Product, templateElement: HTMLDivElement) => {
  // Clone the template element
  const newItem = templateElement.cloneNode(true) as HTMLDivElement;

  // Query inner elements
  const name = newItem.querySelector<HTMLHeadingElement>('[data-element="name"]');
  const price = newItem.querySelector<HTMLDivElement>('[data-element="price"]');
  const discount = newItem.querySelector<HTMLDivElement>('[data-element="discount"]');
  const description = newItem.querySelector<HTMLParagraphElement>('[data-element="description"]');
  const rating = newItem.querySelector<HTMLDivElement>('[data-element="rating"]');
  const brand = newItem.querySelector<HTMLDivElement>('[data-element="brand"]');
  const category = newItem.querySelector<HTMLDivElement>('[data-element="category"]');

  // Populate inner elements
  if (name) name.textContent = product.name;
  if (price) price.textContent = `$${product.price}`;
  if (discount) discount.textContent = `${product.discount}% off`;
  if (description) description.textContent = product.description;
  if (rating) rating.textContent = `Rating: ${product.rating}`;
  if (brand) brand.textContent = `Brand: ${product.brand}`;
  if (category) category.textContent = `Category: ${product.category}`;

  return newItem;
};

/**
 * Collects all the categories from the products' data.
 * @param products The products' data.
 *
 * @returns An array of product categories.
 */
const collectCategories = (products: Product[]) => {
  const categories: Set<Product['category']> = new Set();

  for (const { category } of products) {
    categories.add(category);
  }

  return [...categories];
};

/**
 * Creates a new radio filter from the template element.
 * @param category The filter value.
 * @param templateElement The template element.
 *
 * @returns A new category radio filter.
 */
const createFilter = (category: Product['category'], templateElement: HTMLLabelElement) => {
  // Clone the template element
  const newFilter = templateElement.cloneNode(true) as HTMLLabelElement;

  // Query inner elements
  const label = newFilter.querySelector('span');
  const radio = newFilter.querySelector('input');

  if (!label || !radio) return;

  // Populate inner elements
  label.textContent = category;
  radio.value = category;

  return newFilter;
};
</script>
