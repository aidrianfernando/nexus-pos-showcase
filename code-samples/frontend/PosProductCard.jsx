function PlusIcon({ size = 16 }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

const pesoFormatter =
  new Intl.NumberFormat(
    'en-PH',
    {
      style: 'currency',
      currency: 'PHP',
    }
  );

function getAvailableQuantity(
  product
) {
  return Number(
    product.availableQuantity ??
    product.available ??
    product.stock ??
    product.quantity ??
    product.inventoryQuantity ??
    0
  );
}

function getStockStatus(product) {
  const quantity =
    getAvailableQuantity(product);

  const reorderLevel =
    Number(
      product.reorderLevel ??
      0
    );

  if (quantity <= 0) {
    return 'out_of_stock';
  }

  if (
    quantity <= reorderLevel
  ) {
    return 'low_stock';
  }

  return 'in_stock';
}

function PosProductCard({
  product,
  cartQuantity = 0,
  onAdd,
  disabled = false,
}) {
  const available =
    getAvailableQuantity(product);

  const price = Number(
    product.price ??
    product.unitPrice ??
    product.sellingPrice ??
    0
  );

  const stockStatus =
    product.stockStatus ??
    getStockStatus(product);

  const isOutOfStock =
    stockStatus ===
      'out_of_stock' ||
    available <= 0;

  const isLowStock =
    !isOutOfStock &&
    stockStatus ===
      'low_stock';

  const canAdd =
    !disabled &&
    !isOutOfStock &&
    cartQuantity < available;

  function getStockLabel() {
    if (isOutOfStock) {
      return 'Out of stock';
    }

    if (isLowStock) {
      return `${available} available · Low stock`;
    }

    return `${available} available`;
  }

  return (
    <article
      className={
        isOutOfStock
          ? 'pos-product-card pos-product-card--out'
          : 'pos-product-card'
      }
    >
      <div className="pos-product-card__header">
        <span className="pos-product-card__sku">
          {product.sku ||
            'No SKU'}
        </span>

        <span
          className={
            isOutOfStock
              ? 'pos-stock pos-stock--empty'
              : isLowStock
                ? 'pos-stock pos-stock--low'
                : 'pos-stock pos-stock--available'
          }
        >
          {getStockLabel()}
        </span>
      </div>

      <h3>
        {product.name}
      </h3>

      {product.categoryName && (
        <p className="pos-product-card__category">
          {product.categoryName}
        </p>
      )}

      <div className="pos-product-card__footer">
        <strong>
          {pesoFormatter.format(
            price
          )}
        </strong>

        <button
          type="button"
          onClick={() =>
            onAdd(product)
          }
          disabled={!canAdd}
          aria-label={
            canAdd
              ? `Add ${product.name} to cart`
              : undefined
          }
        >
          {canAdd && (
            <PlusIcon
              name="plus"
              size={16}
            />
          )}

          {isOutOfStock
            ? 'Unavailable'
            : canAdd
              ? 'Add'
              : 'Max stock'}
        </button>
      </div>
    </article>
  );
}

export default PosProductCard;
