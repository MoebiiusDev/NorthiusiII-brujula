import React, { useState, useEffect, useRef } from 'react';

import { StyleSheet, Text, View, Animated, Dimensions, Image } from 'react-native';

import { Magnetometer, Accelerometer } from 'expo-sensors';

import * as Location from 'expo-location';



const { width } = Dimensions.get('window');

const COMPASS_SIZE = width * 0.85; // Un poco más grande para lucir el fondo



export default function App() {

  const [displayHeading, setDisplayHeading] = useState(0);

  const [tiltAngle, setTiltAngle] = useState(0);

  const [subscription, setSubscription] = useState(null);

  const [error, setError] = useState(null);



  // Animación: Usamos useRef para mantener el valor acumulado y evitar reseteos

  const compassRotationAnim = useRef(new Animated.Value(0)).current;



  // Guardamos el último ángulo "real" para calcular la ruta más corta

  const lastHeadingRef = useRef(0);



  const calculateTilt = (data) => {

    const { x, y, z } = data;

    const tilt = Math.atan2(y, Math.sqrt(x * x + z * z)) * (180 / Math.PI);

    setTiltAngle(Math.round(tilt));

  };



  const _subscribe = async () => {

    let { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {

      setError('Permiso denegado');

      return;

    }



    Accelerometer.setUpdateInterval(200);

    Accelerometer.addListener(calculateTilt);



    Magnetometer.setUpdateInterval(60); // Intervalo equilibrado



    setSubscription(

      Magnetometer.addListener((data) => {

        let { x, y } = data;



        // 1. Cálculo matemático básico

        let angle = Math.atan2(y, x) * (180 / Math.PI);



        // 2. Corrección de ejes (-90 grados para alinear Norte)

        angle = angle - 90;



        // 3. Normalizar a 0-360 positivo estricto para el TEXTO

        let positiveAngle = (angle % 360 + 360) % 360;

        setDisplayHeading(positiveAngle);



        // 4. LÓGICA ANTI-GIRO BRUSCO (Shortest Path)

        // Comparar el nuevo ángulo con el anterior acumulado

        let currentRot = lastHeadingRef.current;



        // Calcular diferencia normalizada (-180 a 180)

        let diff = angle - currentRot;



        // Ajustar el salto de 0/360

        // Mientras la diferencia sea mayor que 180, restamos 360 (ej: 350 a 10)

        while (diff > 180) diff -= 360;

        while (diff < -180) diff += 360;



        // El nuevo objetivo es el acumulado anterior + la diferencia corta

        const newTarget = currentRot + diff;



        lastHeadingRef.current = newTarget;



        // 5. Animar

        // Usamos spring para que se sienta "físico" pero sin rebotar mucho

        Animated.spring(compassRotationAnim, {

          toValue: -newTarget, // Negativo porque el plato gira al revés del usuario

          friction: 15,    // Fricción: controla que tan rápido frena

          tension: 20,     // Tensión: controla la fuerza del giro

          useNativeDriver: true,

        }).start();

      })

    );

  };



  const _unsubscribe = () => {

    subscription && subscription.remove();

    setSubscription(null);

  };



  useEffect(() => {

    _subscribe();

    return () => _unsubscribe();

  }, []);



  const getCardinalDirection = (angle) => {

    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];

    const index = Math.round(angle / 45) % 8;

    return directions[index];

  };



  return (

    <View style={styles.container}>

      <Text style={styles.title}>NORTHIUS V1</Text>



      {/* Panel de Datos */}

      <View style={styles.infoContainer}>

        <Text style={styles.headingValue}>{Math.round(displayHeading)}°</Text>

        <Text style={styles.cardinalValue}>{getCardinalDirection(displayHeading)}</Text>

        <Text style={styles.tiltValue}>Inclinación: {tiltAngle}°</Text>

      </View>



      {/* CONTENEDOR BRÚJULA */}

      <View style={styles.compassWrapper}>



        {/* Marcador FIJO (Triángulo Naranja - Hacia donde miras) */}

        <View style={styles.topIndicatorContainer}>

          <View style={styles.topTriangle} />

        </View>



        {/* PLATO GIRATORIO */}

        <Animated.View style={[

          styles.compassPlate,

          {
            transform: [{
              rotate: compassRotationAnim.interpolate({

                inputRange: [0, 360],

                outputRange: ['0deg', '360deg']

              })
            }]
          }

        ]}>

          <Image

            source={require('./assets/confuso-modified.png')}

            style={styles.backgroundImage}

          />



          {/* Overlay oscuro para que las letras resalten sobre la imagen */}

          <View style={styles.overlay} />



          {/* Letras Cardinales */}

          <View style={styles.northContainer}>

            <Text style={styles.textN}>N</Text>

            {/* Flechita roja pegada a la N */}

            <View style={styles.northArrow} />

          </View>



          <Text style={[styles.cardinalText, styles.textE]}>E</Text>

          <Text style={[styles.cardinalText, styles.textS]}>S</Text>

          <Text style={[styles.cardinalText, styles.textW]}>O</Text>



          {/* Marcas de grados (Decorativo simple) */}

          <View style={styles.ticksCircle} />



        </Animated.View>

      </View>



      {error && <Text style={{ color: 'red', marginTop: 20 }}>{error}</Text>}

    </View>

  );

}



const styles = StyleSheet.create({

  container: {

    flex: 1,

    backgroundColor: '#0F172A', // Azul oscuro profundo

    alignItems: 'center',

    justifyContent: 'center',

  },

  title: {

    color: '#64748B',

    fontSize: 16,

    letterSpacing: 4,

    marginBottom: 10,

    fontWeight: 'bold',

  },

  infoContainer: {

    alignItems: 'center',

    marginBottom: 30,

    zIndex: 10,

  },

  headingValue: {

    color: '#F8FAFC',

    fontSize: 56,

    fontWeight: '800',

    fontVariant: ['tabular-nums'],

  },

  cardinalValue: {

    color: '#38BDF8', // Azul neón suave

    fontSize: 24,

    fontWeight: 'bold',

    marginTop: -5,

  },

  tiltValue: {

    color: '#94A3B8',

    fontSize: 12,

    marginTop: 5,

  },

  compassWrapper: {

    width: COMPASS_SIZE,

    height: COMPASS_SIZE,

    alignItems: 'center',

    justifyContent: 'center',

  },

  compassPlate: {

    width: '100%',

    height: '100%',

    borderRadius: COMPASS_SIZE / 2,

    borderWidth: 4,

    borderColor: '#334155',

    backgroundColor: '#1E293B',

    alignItems: 'center',

    justifyContent: 'center',

    overflow: 'hidden', // Importante para que la imagen no se salga

    elevation: 10,

    shadowColor: '#000',

    shadowOffset: { width: 0, height: 10 },

    shadowOpacity: 0.5,

    shadowRadius: 10,

  },

  // ESTILOS DE LA IMAGEN DE FONDO

  backgroundImage: {

    position: 'absolute',

    width: '100%',

    height: '100%',

    resizeMode: 'cover',

    opacity: 0.3, // Transparencia para que no moleste

  },

  overlay: {

    ...StyleSheet.absoluteFillObject,

    backgroundColor: 'rgba(15, 23, 42, 0.4)', // Capa azulada encima de la imagen

  },

  // Indicador Superior Fijo

  topIndicatorContainer: {

    position: 'absolute',

    top: -20,

    zIndex: 20,

    alignItems: 'center',

  },

  topTriangle: {

    width: 0,

    height: 0,

    borderLeftWidth: 12,

    borderRightWidth: 12,

    borderBottomWidth: 24,

    borderStyle: 'solid',

    backgroundColor: 'transparent',

    borderLeftColor: 'transparent',

    borderRightColor: 'transparent',

    borderBottomColor: '#F59E0B', // Ámbar/Naranja

    shadowColor: '#F59E0B',

    shadowOffset: { width: 0, height: 0 },

    shadowOpacity: 0.8,

    shadowRadius: 10,

  },

  // Letras

  cardinalText: {

    position: 'absolute',

    fontSize: 22,

    fontWeight: 'bold',

    color: '#E2E8F0',

  },

  northContainer: {

    position: 'absolute',

    top: 15,

    alignItems: 'center',

  },

  textN: {

    fontSize: 28,

    fontWeight: '900',

    color: '#EF4444', // Rojo intenso

  },

  northArrow: {

    width: 0,

    height: 0,

    marginTop: 2,

    borderLeftWidth: 6,

    borderRightWidth: 6,

    borderBottomWidth: 10,

    borderStyle: 'solid',

    backgroundColor: 'transparent',

    borderLeftColor: 'transparent',

    borderRightColor: 'transparent',

    borderBottomColor: '#EF4444',

    transform: [{ rotate: '180deg' }], // Apunta hacia el centro

  },

  textE: { right: 20 },

  textS: { bottom: 20 },

  textW: { left: 20 },



  ticksCircle: {

    width: '90%',

    height: '90%',

    borderRadius: COMPASS_SIZE,

    borderWidth: 2,

    borderColor: 'rgba(255,255,255,0.1)',

    position: 'absolute',

    borderStyle: 'dashed', // Borde punteado decorativo

  }

});