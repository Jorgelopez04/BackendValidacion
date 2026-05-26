# Pruebas de Regresión con BugBug

En esta carpeta puedes agregar tus pruebas de regresión automatizadas usando BugBug.

## ¿Qué es una prueba de regresión?
Son pruebas que aseguran que nuevas funcionalidades o cambios no rompan lo que ya funcionaba.

## Ejemplo de archivo de prueba
Consulta el archivo `example-regression.json` para ver cómo estructurar una prueba.

## ¿Cómo ejecutar una prueba?
1. Sube tu prueba a BugBug (puedes hacerlo desde la web o CLI).
2. Ejecuta la prueba con:
   ```sh
   bugbug run <test-id> --api-key <your-api-key>
   ```

Más información en la [documentación oficial](https://bugbug.io/docs/cli/).
