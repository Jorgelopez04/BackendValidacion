# BugBug

Este apartado está dedicado a las pruebas automatizadas utilizando BugBug.

## Estructura
- `regression/`: Pruebas de regresión
- `security/`: Pruebas de seguridad
- `performance/`: Pruebas de performance

## ¿Cómo empezar?
1. Instala la CLI de BugBug:
   ```sh
   npm install -g @bugbugio/cli
   ```
2. Crea tus pruebas en los directorios correspondientes.
3. Consulta la [documentación oficial](https://bugbug.io/docs/cli/) para más detalles.

## Ejemplo de comando para ejecutar una prueba:
```sh
bugbug run <test-id> --api-key <your-api-key>
```
