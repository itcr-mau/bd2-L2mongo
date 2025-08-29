# Taller MongoDB

**Instituto Tecnológico de Costa Rica**  
Campus Tecnológico Central Cartago  
Escuela de Ingeniería en Computación  

**Curso**: IC4302 Bases de datos II  
**Profesor**: Diego Andres Mora Rojas  
**Semestre**: II Semestre, 2025  

**Estudiante**: Mauricio González Prendas  
**Carné**: 2024143009  
**Correo**: m.gonzalez.9@estudiantec.cr  

## Datos para probar

- **Usuario:** `bd2`
- **Contraseña:** `5YkEejQmtK9XOeUV`

**Conexión con MongoDB Compass:**
```
mongodb+srv://bd2:5YkEejQmtK9XOeUV@bd2.zbo2sqn.mongodb.net/
```

**Conexión con `mongosh` (Shell):**
```shell
mongosh "mongodb+srv://bd2.zbo2sqn.mongodb.net/" --apiVersion 1 --username bd2
```

> **Nota:** Estas credenciales tienen acceso únicamente a la base de datos `Ferreteria`.

---

### Parte A: Consultas Básicas (find) 
1. Mostrar todos los productos con solo sku, nombre y precio.
2. Consultar los productos con precio mayor a 10,000 CRC ordenados descendentemente.
3. Consultar los productos de la categoría Seguridad o Pinturas.
4. Mostrar los productos con stock entre 10 y 30 unidades.
5. Consultar productos cuyo nombre empiece con la letra P, sin importar mayúsculas o minúsculas.
6. Implementar paginación mostrando 5 productos después de saltar 3, ordenados por nombre.

### Parte B: Updates 
1. Cambiar el precio de un producto específico a un nuevo valor.
2. Incrementar el stock de un producto en una cantidad determinada.
3. Agregar un nuevo campo tags a un producto con un arreglo de etiquetas.
4. Normalizar el nombre de un producto (por ejemplo cambiar 'IA' por 'Inteligencia Artificial').

### Parte C: Upsert 
1. Realizar un upsert sobre un producto por su sku. Si existe, actualizar el stock; si no existe, insertarlo con todos los datos.

### Parte D: Deletes 
1. Eliminar un producto específico por su sku.
2. Eliminar todos los productos con stock menor a 10 unidades.

### Parte E: Agregaciones 
1. Calcular precio promedio, mínimo y máximo por categoría.
2. Calcular el valor total de inventario por categoría (precio * stock).
3. Mostrar el top 3 de productos más caros.
4. Contar la cantidad de productos por categoría.
5. Generar un histograma de precios por rangos definidos (bucket).
6. Generar un histograma automático de precios (bucketAuto).
7. Obtener los 3 productos más caros dentro de cada categoría (ranking interno).
8. Mostrar productos que contengan la palabra 'Pro' en su nombre y calcular su porcentaje en cada categoría.
9. Consultar productos creados dentro de un rango de fechas.
10. Listar etiquetas únicas por categoría (si existe el campo tags).
11. Contar productos por palabras clave en el nombre (ejemplo: 'Pintura', 'Seguridad', 'Eléctrico').
12. Clasificar productos como Caros o Baratos/Promedio en relación con el precio promedio general.
13. Calcular el valor total de inventario agrupado por día de creación.
14. Generar un reporte múltiple con $facet que incluya: top 3 productos caros, resumen por categoría y productos con 'Pro'.
15. Clasificar productos por niveles de stock (Bajo, Medio, Alto).
16. Listar productos que contengan comillas en su nombre.
17. Mostrar catálogo resumido por categoría con los 5 productos más caros y nombres representativos.
18. Crear un campo derivado precioConIVA (13%) y mostrarlo en un reporte.	

---

## Entrega

Este repositorio contiene la solución completa del Taller MongoDB con los siguientes archivos:

- **`setup.js`**: Creación de la colección `Productos` con validación de schema e inserción de datos de prueba.
- **`index.js`**: Archivo ejecutable en `mongosh` que contiene todos los queries solicitados, organizados por partes (A-E) con títulos descriptivos y salida formateada con `printjson`.
- **`.vscode/tasks.json`**: Configuración de VS Code para conectar automáticamente a MongoDB Atlas.

Todos los ejercicios están implementados siguiendo el formato solicitado, cada uno con su respectivo `console.log` descriptivo y la impresión de resultados.

**Ejemplos del formato utilizado:**

```js
console.log("\n=== Consulta: Productos con precio mayor a 10,000 CRC ===");
printjson(
    db.Productos.find(
        { precio: { $gt: 10000 } },
        { _id: 0, sku: 1, nombre: 1, precio: 1 }
    ).toArray()
)
```

```js
console.log("\n=== Agregación: Valor total de inventario por categoría ===");
printjson(
    db.Productos.aggregate([
        {
            $group: {
                _id: "$categoria",
                totalInventario: { $sum: { $multiply: ["$precio", "$stock"] } },
                cantidad: { $sum: 1 }
            }
        },
        {
            $sort: { valorInventario: -1 }
        }
    ]).toArray()
)
```

```js
console.log("\n=== Update: Incrementar stock de producto P002 en +10 ===");
db.Productos.updateOne(
    { sku: "P002" },
    { $inc: { stock: 10 } }
)
printjson(
    db.Productos.findOne({ sku: "P002" })
)
```