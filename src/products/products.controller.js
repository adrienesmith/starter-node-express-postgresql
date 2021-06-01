const productsService = require("./products.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

// Middleware that validates if product exists
// written using promise chaining
/*
function productExists(req, res, next) {
  productsService
    .read(req.params.productId)
    .then((product) => {
      if (product) {
        res.locals.product = product;
        return next();
      }
      next({ status: 404, message: "Product cannot be found."});
    })
    .catch(next);
}
*/

// Middleware that validates if product exists
// written using async await
async function productExists(req, res, next) {
  const product = await productsService.read(req.params.productId);
  if (product) {
    res.locals.product = product;
    return next();
  }
  next({
    status: 404,
    message: "Product cannot be found"
  });
}

// List route handler written using promise chaining
/*
function list(req, res, next) {
  productsService
    .list()
    .then((data) => res.json({ data }))
    .catch(next);
}
*/

// List route handler written using async await
async function list(req, res, next){
  const data = await productsService.list();
  res.json({ data });
}

function read(req, res) {
  const { product: data } = res.locals;
  res.json({ data });
}

// Handler to list out-of-stock counts
async function listOutOfStockCount(req, res, next) {
  res.json({ data: await productsService.listOutOfStockCount() });
}

// Handler to list min/max/avg prices
async function listPriceSummary(req, res, next) {
  res.json({ data: await productsService.listPriceSummary() })
}

// Handler to list total weight by product
async function listTotalWeightByProduct(req, res) {
  res.json({ data: await productsService.listTotalWeightByProduct() });
}

module.exports = {
  list,
  read: [productExists, read],
  listOutOfStockCount: asyncErrorBoundary(listOutOfStockCount),
  listPriceSummary: asyncErrorBoundary(listPriceSummary),
  listTotalWeightByProduct: asyncErrorBoundary(listTotalWeightByProduct),
}