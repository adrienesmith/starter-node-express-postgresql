const suppliersService = require("./suppliers.service"); 
const hasProperties = require("../errors/hasProperties");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

// middleware that checks for valid fields in the request body
const VALID_PROPERTIES = [
  "supplier_name",
  "supplier_address_line_1",
  "supplier_address_line_2",
  "supplier_city",
  "supplier_state",
  "supplier_zip",
  "supplier_phone",
  "supplier_email",
  "supplier_notes",
  "supplier_type_of_goods",
];

function hasOnlyValidProperties(req, res, next) {
  const { data = {} } = req.body;

  const invalidFields = Object.keys(data).filter(
    (field) => !VALID_PROPERTIES.includes(field)
  );

  if (invalidFields.length) {
    return next({
      status: 400,
      message: `Invalid field(s): ${invalidFields.join(", ")}`,
    });
  }
  next();
}

// Middleware that checks for required properties
const hasRequiredProperties = hasProperties("supplier_name", "supplier_email");

// Middleware that checks to see if the supplier exists
// built using promise chaining
/*
function supplierExists(req, res, next) {
  suppliersService
    .read(req.params.supplierId)
    .then((supplier) => {
      if (supplier) {
        res.locals.supplier = supplier;
        return next();
      }
      next({ status: 404, message: `Supplier cannot be found.` });
    })
    .catch(next);
}
*/
// Middleware that checks to see if the supplier exists
// built using async await
async function supplierExists(req, res, next) {
  const supplier = await suppliersService.read(req.params.supplierId);
  if (supplier) {
    res.locals.supplier = supplier;
    return next();
  }
  next({
    status: 404,
    message: "Supplier cannot be found",
  });
}

// Create route handler - built using promise chaining
/*
function create(req, res, next) {
  suppliersService
    .create(req.body.data)
    .then((data) => res.status(201).json({ data }))
    .catch(next);
}
*/

// Create route handler - build using async await
async function create(req, res) {
  const data = await suppliersService.create(req.body.data);
  res.status(201).json({ data });
}

// Update route handler - built using promise chaining
/*
function update(req, res, next) {
  const updatedSupplier = {
    ...req.body.data,
    supplier_id: res.locals.supplier.supplier_id,
  };
  suppliersService
    .update(updatedSupplier)
    .then((data) => res.json({ data }))
    .catch(next);
}
*/

// Update route handler - built using async await
async function update(req, res){
  const updatedSupplier = {
    ...req.body.data,
    supplier_id: res.locals.supplier.supplier_id,
  };
  const data = await suppliersService.update(updatedSupplier);
  res.json({ data });
}

// Delete route handler - built using promise chaining
/*
function destroy(req, res, next) {
  suppliersService
    .delete(res.locals.supplier.supplier_id)
    .then(() => res.sendStatus(204))
    .catch(next);
}
*/

// Delete route handler - built using async await
async function destroy(req, res) {
  const { supplier } = res.locals;
  await suppliersService.delete(supplier.supplier_id);
  res.sendStatus(204);
}

// any async / await functions are wrapped in the asyncErrorBoundary higher order function
module.exports = {
  create: [
    hasOnlyValidProperties, 
    hasRequiredProperties, 
    asyncErrorBoundary(create)
  ],
  update: [
    asyncErrorBoundary(supplierExists), 
    hasOnlyValidProperties, 
    hasRequiredProperties, 
    asyncErrorBoundary(update)
  ],
  delete: [asyncErrorBoundary(supplierExists), asyncErrorBoundary(destroy)],
};
