use("Ferreteria");

// Parte A: Consultas Básicas (find)

console.log("\n=== A.1. Productos con SKU, Nombre y Precio ===");
printjson(
    db.Productos.find(
        {},
        { _id: 0, sku: 1, nombre: 1, precio: 1 }
    ).toArray()
);

console.log("\n=== A.2. Productos con precio mayor a 10,000 CRC (descendente) ===");
printjson(
    db.Productos.find(
        { precio: { $gt: 10000 } },
        { _id: 0, sku: 1, nombre: 1, precio: 1 }
    ).sort({ precio: -1 }).toArray()
);

console.log("\n=== A.3. Productos de categoría 'Seguridad' o 'Pinturas' ===");
printjson(
    db.Productos.find(
        { categoria: { $in: ["Seguridad", "Pinturas"] } },
        { _id: 0, sku: 1, nombre: 1, categoria: 1 }
    ).toArray()
);

console.log("\n=== A.4. Productos with stock entre 10 y 30 unidades ===");
printjson(
    db.Productos.find(
        { stock: { $gte: 10, $lte: 30 } },
        { _id: 0, sku: 1, nombre: 1, stock: 1 }
    ).toArray()
);

console.log("\n=== A.5. Productos cuyo nombre empieza con 'P' (insensible a mayúsculas) ===");
printjson(
    db.Productos.find(
        { nombre: { $regex: /^P/i } },
        { _id: 0, sku: 1, nombre: 1 }
    ).toArray()
);

console.log("\n=== A.6. Paginación: 5 productos después de saltar 3 (ordenados por nombre) ===");
printjson(
    db.Productos.find().sort({ nombre: 1 }).skip(3).limit(5).toArray()
);

// Parte B: Updates
console.log("\n=== B.1. Cambiar precio del producto P001 a 8000 ===");
db.Productos.updateOne(
    { sku: "P001" },
    { $set: { precio: 8000 } }
);
printjson(db.Productos.findOne({ sku: "P001" }));

console.log("\n=== B.2. Incrementar stock del producto P002 en +10 ===");
db.Productos.updateOne(
    { sku: "P002" },
    { $inc: { stock: 10 } }
);
printjson(db.Productos.findOne({ sku: "P002" }));

console.log("\n=== B.3. Agregar tags al producto P003 ===");
db.Productos.updateOne(
    { sku: "P003" },
    { $set: { tags: ["herramienta", "manual", "acero"] } }
);
printjson(db.Productos.findOne({ sku: "P003" }));

console.log("\n=== B.4. Normalizar nombre del producto P010 (Gal a Galón) ===");
db.Productos.updateOne(
    { sku: "P010" },
    { $set: { nombre: "Pintura Látex Interior Blanca 1 Galón" } }
);
printjson(db.Productos.findOne({ sku: "P010" }));

// Parte C: Upsert
console.log("\n=== C.1. Upsert de producto P999 (insertar) ===");
db.Productos.updateOne(
    { sku: "P999" },
    {
        $set: {
            nombre: "Producto Nuevo Upsert",
            categoria: "Jardinería",
            precio: 15000,
            creadoEn: new Date()
        },
        $inc: { stock: 10 }
    },
    { upsert: true }
);
printjson(db.Productos.findOne({ sku: "P999" }));

// Parte D: Deletes
console.log("\n=== D.1. Eliminar producto P999 ===");
db.Productos.deleteOne({ sku: "P999" });
printjson(db.Productos.findOne({ sku: "P999" })); // Debería ser null

console.log("\n=== D.2. Eliminar productos con stock < 10 ===");
const resultadoDelete = db.Productos.deleteMany({ stock: { $lt: 10 } });
printjson(resultadoDelete);

// Parte E: Agregaciones
console.log("\n=== E.1. Precio promedio, mínimo y máximo por categoría ===");
printjson(
    db.Productos.aggregate([
        {
            $group: {
                _id: "$categoria",
                precioPromedio: { $avg: "$precio" },
                precioMinimo: { $min: "$precio" },
                precioMaximo: { $max: "$precio" }
            }
        }
    ]).toArray()
);

console.log("\n=== E.2. Valor total de inventario por categoría ===");
printjson(
    db.Productos.aggregate([
        {
            $group: {
                _id: "$categoria",
                valorTotalInventario: { $sum: { $multiply: ["$precio", "$stock"] } }
            }
        },
        { $sort: { valorTotalInventario: -1 } }
    ]).toArray()
);

console.log("\n=== E.3. Top 3 productos más caros ===");
printjson(
    db.Productos.aggregate([
        { $sort: { precio: -1 } },
        { $limit: 3 },
        { $project: { _id: 0, nombre: 1, precio: 1 } }
    ]).toArray()
);

console.log("\n=== E.4. Cantidad de productos por categoría ===");
printjson(
    db.Productos.aggregate([
        { $group: { _id: "$categoria", cantidad: { $sum: 1 } } },
        { $sort: { cantidad: -1 } }
    ]).toArray()
);

console.log("\n=== E.5. Histograma de precios por rangos definidos ===");
printjson(
    db.Productos.aggregate([
        {
            $bucket: {
                groupBy: "$precio",
                boundaries: [0, 5000, 10000, 20000, 50000, 100000],
                default: "Mayor a 100000",
                output: {
                    cantidad: { $sum: 1 },
                    productos: { $push: "$nombre" }
                }
            }
        }
    ]).toArray()
);

console.log("\n=== E.6. Histograma automático de precios (5 rangos) ===");
printjson(
    db.Productos.aggregate([
        {
            $bucketAuto: {
                groupBy: "$precio",
                buckets: 5,
                output: {
                    cantidad: { $sum: 1 }
                }
            }
        }
    ]).toArray()
);

console.log("\n=== E.7. Top 3 productos más caros por categoría ===");
printjson(
    db.Productos.aggregate([
        { $sort: { precio: -1 } },
        {
            $group: {
                _id: "$categoria",
                productos: { $push: { nombre: "$nombre", precio: "$precio" } }
            }
        },
        {
            $project: {
                _id: 1,
                top3: { $slice: ["$productos", 3] }
            }
        }
    ]).toArray()
);

console.log("\n=== E.8. Productos con 'Pro' y su porcentaje por categoría ===");
printjson(
    db.Productos.aggregate([
        {
            $group: {
                _id: "$categoria",
                totalProductos: { $sum: 1 },
                productosConPro: {
                    $sum: {
                        $cond: [{ $regexMatch: { input: "$nombre", regex: /Pro/i } }, 1, 0]
                    }
                }
            }
        },
        {
            $project: {
                _id: 1,
                porcentajeConPro: {
                    $cond: [
                        { $eq: ["$totalProductos", 0] },
                        0,
                        { $multiply: [{ $divide: ["$productosConPro", "$totalProductos"] }, 100] }
                    ]
                }
            }
        }
    ]).toArray()
);

console.log("\n=== E.9. Productos creados entre 2025-03-05 y 2025-03-10 ===");
printjson(
    db.Productos.find({
        creadoEn: {
            $gte: ISODate("2025-03-05T00:00:00Z"),
            $lte: ISODate("2025-03-10T23:59:59Z")
        }
    }).toArray()
);

console.log("\n=== E.10. Etiquetas únicas por categoría ===");
printjson(
    db.Productos.aggregate([
        { $match: { tags: { $exists: true, $ne: [] } } },
        { $unwind: "$tags" },
        { $group: { _id: "$categoria", etiquetasUnicas: { $addToSet: "$tags" } } }
    ]).toArray()
);

console.log("\n=== E.11. Conteo de productos por palabras clave en el nombre ===");
printjson(
    db.Productos.aggregate([
        {
            $facet: {
                "Pintura": [
                    { $match: { nombre: /Pintura/i } },
                    { $count: "cantidad" }
                ],
                "Seguridad": [
                    { $match: { nombre: /Seguridad/i } },
                    { $count: "cantidad" }
                ],
                "Eléctrico": [
                    { $match: { nombre: /Eléctrico|Inalámbrico/i } },
                    { $count: "cantidad" }
                ]
            }
        }
    ]).toArray()
);

console.log("\n=== E.12. Clasificar productos como Caros o Baratos/Promedio ===");
const avgPriceResult = db.Productos.aggregate([
    { $group: { _id: null, avgPrice: { $avg: "$precio" } } }
]).toArray();
const avgPrice = avgPriceResult.length > 0 ? avgPriceResult[0].avgPrice : 0;
printjson(
    db.Productos.aggregate([
        {
            $addFields: {
                clasificacionPrecio: {
                    $cond: {
                        if: { $gt: ["$precio", avgPrice] },
                        then: "Caro",
                        else: "Barato/Promedio"
                    }
                }
            }
        },
        { $project: { _id: 0, nombre: 1, precio: 1, clasificacionPrecio: 1 } }
    ]).toArray()
);

console.log("\n=== E.13. Valor total de inventario por día de creación ===");
printjson(
    db.Productos.aggregate([
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$creadoEn" } },
                valorTotalInventario: { $sum: { $multiply: ["$precio", "$stock"] } }
            }
        },
        { $sort: { _id: 1 } }
    ]).toArray()
);

console.log("\n=== E.14. Reporte múltiple con $facet ===");
printjson(
    db.Productos.aggregate([
        {
            $facet: {
                "top3Caros": [
                    { $sort: { precio: -1 } },
                    { $limit: 3 },
                    { $project: { nombre: 1, precio: 1 } }
                ],
                "resumenPorCategoria": [
                    { $group: { _id: "$categoria", cantidad: { $sum: 1 } } }
                ],
                "productosConPro": [
                    { $match: { nombre: /Pro/i } },
                    { $count: "cantidad" }
                ]
            }
        }
    ]).toArray()
);

console.log("\n=== E.15. Clasificar productos por nivel de stock ===");
printjson(
    db.Productos.aggregate([
        {
            $addFields: {
                nivelStock: {
                    $switch: {
                        branches: [
                            { case: { $lte: ["$stock", 10] }, then: "Bajo" },
                            { case: { $lte: ["$stock", 50] }, then: "Medio" }
                        ],
                        default: "Alto"
                    }
                }
            }
        },
        { $project: { _id: 0, nombre: 1, stock: 1, nivelStock: 1 } }
    ]).toArray()
);

console.log("\n=== E.16. Productos con comillas en el nombre ===");
printjson(
    db.Productos.find({ nombre: /"/ }).toArray()
);

console.log("\n=== E.17. Catálogo resumido por categoría (Top 5 más caros) ===");
printjson(
    db.Productos.aggregate([
        { $sort: { precio: -1 } },
        {
            $group: {
                _id: "$categoria",
                productos: { $push: { nombre: "$nombre", precio: "$precio" } }
            }
        },
        {
            $project: {
                _id: 1,
                catalogo: { $slice: ["$productos", 5] }
            }
        }
    ]).toArray()
);

console.log("\n=== E.18. Crear campo derivado precioConIVA (13%) ===");
printjson(
    db.Productos.aggregate([
        {
            $addFields: {
                precioConIVA: { $multiply: ["$precio", 1.13] }
            }
        },
        {
            $project: {
                _id: 0,
                nombre: 1,
                precio: 1,
                precioConIVA: 1
            }
        }
    ]).toArray()
);