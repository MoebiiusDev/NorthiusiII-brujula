# 🧭 NorthiusII - Explorer V1 🌌

Una aplicación de brújula digital moderna, precisa y elegante, diseñada para la plataforma Android utilizando el poder de React Native y Expo.

## ✨ Características Principales

* **Algoritmo de Ruta Corta (Shortest Path):** Garantiza que la aguja de la brújula gire suavemente sin saltos bruscos al pasar de 359° a 0°.
* **Diseño de Alto Contraste:** Interfaz oscura (dark mode) con tipografía bold para lectura en cualquier condición de luz.
* **Detección de Inclinación:** Utiliza el Acelerómetro para detectar y mostrar el ángulo de inclinación del dispositivo.
* **Optimización de Sensores:** Configuración de intervalos de actualización optimizada para un equilibrio entre precisión y consumo de batería.

## 📱 Previsualización

| Pantalla Principal | Brújula Activa |
| :---: | :---: |
|  |  |

*Nota: Las capturas de pantalla están siendo cargadas por el desarrollador asique paciencia.*

## 📥 Descarga y Prueba (APK)

¡Descarga la aplicación y pruébala directamente en tu dispositivo Android!

### ** [Descargar Northius V1.0 (APK)]($https://expo.dev/accounts/moebiius/projects/NorthiusII/builds/9e3e6150-f887-4c42-9c06-1e53869b4329)**

> **Aviso:** Para instalar este archivo `.apk`, tu teléfono deberá tener habilitada la opción "Instalar apps de fuentes desconocidas".

## ⚙️ Tecnologías Usadas

* **Framework:** React Native (Managed Workflow with Expo)
* **Sensores:** `expo-sensors` (Magnetómetro y Acelerómetro)
* **Animación:** Animated API (React Native)
* **Compilación:** EAS Build

---

### 🔑 Instrucciones de Compilación (Para Colaboradores)

Si deseas probar o contribuir con el código:

```bash
# 1. Clonar el repositorio
git clone [https://docs.github.com/es/repositories/creating-and-managing-repositories/quickstart-for-repositories](https://docs.github.com/es/repositories/creating-and-managing-repositories/quickstart-for-repositories)
cd NorthiusII
npm install

# 2. Iniciar el desarrollo (Usar --tunnel si falla la red local)
npx expo start --tunnel 

# 3. Generar un nuevo APK
eas build -p android --profile preview