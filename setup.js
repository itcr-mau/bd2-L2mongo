print("=== Iniciando setup de base de datos Ferreteria === " + new Date().toISOString());
use("Ferreteria");
print("Base de datos seleccionada: " + db.getName());

// Eliminar la colección si existe
// No se usa db.Productos?.drop() ya que me daba errores al ejecutarlo en mongosh
try {
  print("Verificando colección 'Productos' (si existe, se eliminará)...");
    db.Productos.drop();
    print("Colección 'Productos' eliminada exitosamente");
} catch (e) {
    print("La colección 'Productos' no existe");
  try { if (e && e.message) print("Detalle: " + e.message); } catch (_) {}
}

print("Creando colección 'Productos' con validación de schema...");
db.createCollection("Productos", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["sku", "nombre", "categoria", "precio", "stock", "creadoEn"],
      properties: {
        sku: {
          bsonType: "string",
          description: "Identificador de producto",
          pattern: "^P\\d{3,5}$", // P + 3–5 dígitos (ej. P001, P01234)
          minLength: 4,
          maxLength: 6
        },
        nombre: {
          bsonType: "string",
          description: "Nombre del producto",
          minLength: 3,
          maxLength: 120
        },
        categoria: {
          bsonType: "string",
          description: "Categoría del producto",
          enum: [
            "Herramientas",
            "Eléctricas",
            "Seguridad",
            "Pinturas",
            "Fijaciones",
            "Construcción",
            "Jardinería"
          ]
        },
        precio: {
          // permite int, double o decimal
          bsonType: ["int", "long", "double", "decimal"],
          description: "Precio en moneda local (CRC)",
          minimum: 0
        },
        stock: {
          bsonType: ["int", "long"],
          description: "Unidades en inventario (no negativo)",
          minimum: 0
        },
        creadoEn: {
          bsonType: "date",
          description: "Fecha de creación del registro"
        },
        // ----------- Campos opcionales -----------
        descripcion: {
          bsonType: "string",
          description: "Descripción breve",
          maxLength: 500
        },
        marca: {
          bsonType: "string",
          description: "Marca del producto",
          maxLength: 60
        },
        tags: {
          bsonType: "array",
          description: "Etiquetas (únicas, strings no vacías)",
          uniqueItems: true,
          items: { bsonType: "string", minLength: 1, maxLength: 30 }
        },
        proveedor: {
          bsonType: "object",
          required: ["nombre"],
          properties: {
            nombre: { bsonType: "string", minLength: 2, maxLength: 80 },
            telefono: {
              bsonType: "string",
              // acepta +, espacios y números (ajústalo a tu realidad)
              pattern: "^[+0-9\\s-]{7,20}$"
            },
            email: {
              bsonType: "string",
              pattern: "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$"
            }
          },
          additionalProperties: true
        }
      },
      additionalProperties: true // permite campos extra si luego necesitas evolucionar el schema
    }
  },
  validationAction: "error", // “warn” para solo avisar
  validationLevel: "strict" // “moderate” para validar solo inserts o campos cambiados
});
print("Colección 'Productos' creada/validada correctamente.");

print("Insertando documentos de ejemplo en 'Productos'...");
const insertResult = db.Productos.insertMany([
    { sku: "P001", nombre: "Martillo Pro Acero", categoria: "Herramientas", precio: 7500, stock: 20, creadoEn: ISODate("2025-03-01T10:00:00Z") },
    { sku: "P002", nombre: "Destornillador Phillips #2", categoria: "Herramientas", precio: 2500, stock: 60, creadoEn: ISODate("2025-03-02T11:00:00Z") },
    { sku: "P003", nombre: "Llave Inglesa 10\"", categoria: "Herramientas", precio: 5200, stock: 35, creadoEn: ISODate("2025-03-03T09:00:00Z") },
    { sku: "P004", nombre: "Taladro Inalámbrico 18V", categoria: "Eléctricas", precio: 45000, stock: 8, creadoEn: ISODate("2025-03-04T12:00:00Z") },
    { sku: "P005", nombre: "Brocas para Metal (Juego 13p)", categoria: "Eléctricas", precio: 9800, stock: 15, creadoEn: ISODate("2025-03-05T08:30:00Z") },
    { sku: "P006", nombre: "Sierra Circular 7-1/4\"", categoria: "Eléctricas", precio: 68500, stock: 5, creadoEn: ISODate("2025-03-06T14:00:00Z") },
    { sku: "P007", nombre: "Guantes Anticorte Talla L", categoria: "Seguridad", precio: 3200, stock: 50, creadoEn: ISODate("2025-03-07T10:45:00Z") },
    { sku: "P008", nombre: "Lentes de Seguridad Pro", categoria: "Seguridad", precio: 2900, stock: 70, creadoEn: ISODate("2025-03-08T13:20:00Z") },
    { sku: "P009", nombre: "Casco de Seguridad Azul", categoria: "Seguridad", precio: 8200, stock: 18, creadoEn: ISODate("2025-03-09T09:15:00Z") },
    { sku: "P010", nombre: "Pintura Látex Interior Blanca 1 Gal", categoria: "Pinturas", precio: 16500, stock: 25, creadoEn: ISODate("2025-03-10T15:00:00Z") },
    { sku: "P011", nombre: "Rodillo de Pintura 9\" Antigota", categoria: "Pinturas", precio: 4200, stock: 40, creadoEn: ISODate("2025-03-11T08:00:00Z") },
    { sku: "P012", nombre: "Brocha 2\" Cerdas Naturales", categoria: "Pinturas", precio: 2100, stock: 80, creadoEn: ISODate("2025-03-12T17:00:00Z") }
]);
try {
  const inserted = insertResult && insertResult.insertedIds ? Object.keys(insertResult.insertedIds).length : 0;
  print("Documentos insertados: " + inserted);
} catch (_) {}

try {
  const total = db.Productos.countDocuments();
  print("Total de documentos en 'Productos': " + total);
} catch (e) {
  print("No fue posible contar documentos: " + (e && e.message ? e.message : e));
}

try {
  print("Índices actuales en 'Productos':");
  printjson(db.Productos.getIndexes());
} catch (e) {
  print("No fue posible obtener índices: " + (e && e.message ? e.message : e));
}

try {
  print("Muestra de 3 documentos (sku, nombre, categoria):");
  printjson(db.Productos.find({}, { _id: 0, sku: 1, nombre: 1, categoria: 1 }).limit(3).toArray());
} catch (e) {
  print("No fue posible obtener muestra: " + (e && e.message ? e.message : e));
}

print("=== Setup completado correctamente === " + new Date().toISOString());
 