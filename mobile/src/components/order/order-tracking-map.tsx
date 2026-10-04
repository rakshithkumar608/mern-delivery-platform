import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import Constants from "expo-constants";
import React, { useEffect, useMemo, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, {
  Circle,
  G,
  Path,
  Rect,
  Text as SvgText,
} from "react-native-svg";

// Safely probe and load react-native-maps to prevent TurboModule crashes in Expo Go or un-rebuilt clients
let NativeMapView: any = null;
let NativeMarker: any = null;
let NativePolyline: any = null;
let PROVIDER_GOOGLE: any = null;
let PROVIDER_DEFAULT: any = null;
let isNativeMapsAvailable = false;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Maps = require("react-native-maps");
  if (Maps) {
    NativeMapView = Maps.default || Maps;
    NativeMarker = Maps.Marker;
    NativePolyline = Maps.Polyline;
    PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
    PROVIDER_DEFAULT = Maps.PROVIDER_DEFAULT;
    isNativeMapsAvailable = Boolean(NativeMapView);
  }
} catch {
  isNativeMapsAvailable = false;
}

const BRAND_TEAL = "#007A5A";
const MINT_BG = "#E2F6F0";

// Coordinates in Marylebone / Baker Street, London matching the design
const COORD_RESTAURANT = { latitude: 51.5225, longitude: -0.1565 };
const COORD_COURIER = { latitude: 51.5208, longitude: -0.1542 };
const COORD_DESTINATION = { latitude: 51.5237, longitude: -0.1585 }; // 221B Baker Street

const ROUTE_COORDINATES = [
  COORD_RESTAURANT,
  { latitude: 51.5222, longitude: -0.1558 },
  { latitude: 51.5215, longitude: -0.155 },
  COORD_COURIER,
  { latitude: 51.5218, longitude: -0.1562 },
  { latitude: 51.5228, longitude: -0.1575 },
  COORD_DESTINATION,
];

// Clean Google Maps styling matching the design palette
const MAP_STYLE_LIGHT = [
  {
    featureType: "poi.business",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#E5EFE0" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#788871" }],
  },
  {
    featureType: "landscape",
    elementType: "geometry",
    stylers: [{ color: "#F6F5F0" }],
  },
  {
    featureType: "road",
    elementType: "geometry.fill",
    stylers: [{ color: "#FFFFFF" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#ECEBE4" }],
  },
  {
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [{ color: "#FFFFFF" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#FFFFFF" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#DDEAF2" }],
  },
];

interface OrderTrackingMapProps {
  isDriverAssigned?: boolean;
  driverName?: string;
  restaurantName?: string;
  destinationAddress?: string;
  height?: number;
}

export function OrderTrackingMap({
  isDriverAssigned = true,
  restaurantName = "Bella Italia",
  height = 340,
}: OrderTrackingMapProps) {
  // Read real Google Maps API key from Expo environment
  const googleMapsApiKey = useMemo(() => {
    return (
      process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ||
      (process.env as any).ANDROID_MAPS_KEY ||
      Constants.expoConfig?.extra?.googleMapsApiKey ||
      ""
    );
  }, []);

  const hasApiKey = Boolean(googleMapsApiKey && googleMapsApiKey.trim().length > 0);

  // Allow toggling between Native Google Map and Stylized Vector Map
  const [useGoogleMap, setUseGoogleMap] = useState<boolean>(() => {
    return isNativeMapsAvailable && hasApiKey && Platform.OS !== "web";
  });

  // Pulse animation for courier marker or searching radar
  const [pulseAnim] = useState(() => new Animated.Value(1));
  const [pulseOpacity] = useState(() => new Animated.Value(0.6));

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1.5,
            duration: 1400,
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0,
            duration: 1400,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0.6,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [pulseAnim, pulseOpacity]);

  // Coordinate space (viewBox 0 0 380 340) for vector fallback
  const mapSvgWidth = 380;
  const mapSvgHeight = height;

  const canRenderNativeMap =
    useGoogleMap &&
    isNativeMapsAvailable &&
    NativeMapView &&
    Platform.OS !== "web";

  return (
    <View
      style={[styles.container, { height }]}
      className="w-full relative overflow-hidden bg-[#F4F3EE] dark:bg-[#151C24]"
    >
      {/* ─── 1. REAL GOOGLE MAP VIEW (When native module exists and is enabled) ─── */}
      {canRenderNativeMap ? (
        <NativeMapView
          style={StyleSheet.absoluteFill}
          provider={Platform.OS === "android" ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
          customMapStyle={MAP_STYLE_LIGHT}
          initialRegion={{
            latitude: 51.5222,
            longitude: -0.1565,
            latitudeDelta: 0.009,
            longitudeDelta: 0.009,
          }}
          showsUserLocation={false}
          showsCompass={false}
          toolbarEnabled={false}
        >
          {/* Delivery Route Polyline */}
          {NativePolyline && (
            <NativePolyline
              coordinates={ROUTE_COORDINATES}
              strokeColor={BRAND_TEAL}
              strokeWidth={4}
              lineCap="round"
              lineJoin="round"
            />
          )}

          {/* Restaurant Marker */}
          {NativeMarker && (
            <NativeMarker coordinate={COORD_RESTAURANT} anchor={{ x: 0.5, y: 1 }}>
              <View className="items-center">
                <View className="bg-[#12231E] rounded-xl px-2.5 py-1.5 border border-white/20 items-center justify-center shadow-md">
                  <Text className="text-white text-[11px] font-bold">
                    {restaurantName}
                  </Text>
                </View>
                <View
                  style={{
                    width: 0,
                    height: 0,
                    borderLeftWidth: 5,
                    borderRightWidth: 5,
                    borderTopWidth: 5,
                    borderLeftColor: "transparent",
                    borderRightColor: "transparent",
                    borderTopColor: "#12231E",
                  }}
                />
              </View>
            </NativeMarker>
          )}

          {/* Courier Marker (when driver is assigned) */}
          {NativeMarker && isDriverAssigned ? (
            <NativeMarker coordinate={COORD_COURIER} anchor={{ x: 0.5, y: 0.5 }}>
              <View className="items-center justify-center">
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: BRAND_TEAL,
                    borderWidth: 2.5,
                    borderColor: "#FFFFFF",
                    alignItems: "center",
                    justifyContent: "center",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 4,
                    elevation: 5,
                  }}
                >
                  <MaterialCommunityIcons name="moped" size={19} color="#FFFFFF" />
                </View>
              </View>
            </NativeMarker>
          ) : NativeMarker ? (
            /* Radar marker at restaurant when driver not assigned */
            <NativeMarker coordinate={COORD_RESTAURANT} anchor={{ x: 0.5, y: 0.5 }}>
              <View
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  backgroundColor: "#F59E0B",
                  borderWidth: 2,
                  borderColor: "#FFFFFF",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Feather name="search" size={14} color="#FFFFFF" />
              </View>
            </NativeMarker>
          ) : null}

          {/* Destination Marker */}
          {NativeMarker && (
            <NativeMarker coordinate={COORD_DESTINATION} anchor={{ x: 0.5, y: 0.5 }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: MINT_BG,
                  borderWidth: 2.5,
                  borderColor: "#FFFFFF",
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 4,
                }}
              >
                <Feather name="home" size={16} color={BRAND_TEAL} />
              </View>
            </NativeMarker>
          )}
        </NativeMapView>
      ) : (
        /* ─── 2. STYLIZED VECTOR MAP CANVAS (Exact reproduction of London design) ─── */
        <>
          <Svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${mapSvgWidth} ${mapSvgHeight}`}
            preserveAspectRatio="xMidYMid slice"
          >
            <Rect
              x="0"
              y="0"
              width={mapSvgWidth}
              height={mapSvgHeight}
              fill="#F6F5F0"
            />

            {/* Regent's Park Green Area */}
            <Path
              d="M 230 0 L 380 0 L 380 110 Q 300 100 240 60 Z"
              fill="#E5EFE0"
            />
            <Path
              d="M 280 120 Q 340 120 380 150 L 380 180 L 320 180 Z"
              fill="#EDF4E8"
            />

            {/* Street Blocks */}
            <Rect x="20" y="30" width="70" height="90" rx="6" fill="#EDECE5" />
            <Rect x="20" y="140" width="85" height="80" rx="6" fill="#EDECE5" />
            <Rect x="15" y="240" width="100" height="85" rx="6" fill="#EDECE5" />
            <Rect x="120" y="20" width="85" height="55" rx="6" fill="#EDECE5" />
            <Rect x="135" y="145" width="45" height="75" rx="6" fill="#EDECE5" />
            <Rect x="130" y="240" width="60" height="90" rx="6" fill="#EDECE5" />
            <Rect x="260" y="195" width="100" height="55" rx="6" fill="#EDECE5" />
            <Rect x="235" y="270" width="125" height="60" rx="6" fill="#EDECE5" />

            {/* Roads */}
            <Path
              d="M 105 0 L 105 340"
              stroke="#FFFFFF"
              strokeWidth="16"
              strokeLinecap="square"
            />
            <Path
              d="M 110 105 L 180 115 L 210 200 L 225 245 L 305 245 L 380 230"
              stroke="#FFFFFF"
              strokeWidth="18"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <Path d="M 0 130 L 380 130" stroke="#FFFFFF" strokeWidth="12" />
            <Path d="M 0 230 L 380 230" stroke="#FFFFFF" strokeWidth="12" />
            <Path d="M 215 0 L 215 340" stroke="#FFFFFF" strokeWidth="10" />

            {/* Street Labels */}
            <SvgText
              x="30"
              y="75"
              fill="#8E939B"
              fontSize="10"
              fontWeight="600"
              letterSpacing="0.2"
            >
              Marylebone
            </SvgText>
            <SvgText
              x="30"
              y="90"
              fill="#8E939B"
              fontSize="10"
              fontWeight="600"
              letterSpacing="0.2"
            >
              High Street
            </SvgText>

            <SvgText
              x="265"
              y="45"
              fill="#788871"
              fontSize="10"
              fontWeight="600"
              letterSpacing="0.2"
            >
              {"Regent's Park"}
            </SvgText>
            <SvgText
              x="285"
              y="60"
              fill="#788871"
              fontSize="10"
              fontWeight="600"
              letterSpacing="0.2"
            >
              Road
            </SvgText>

            <SvgText
              x="275"
              y="155"
              fill="#8E939B"
              fontSize="10"
              fontWeight="600"
              letterSpacing="0.2"
            >
              Madame
            </SvgText>
            <SvgText
              x="275"
              y="170"
              fill="#8E939B"
              fontSize="10"
              fontWeight="600"
              letterSpacing="0.2"
            >
              Tussauds
            </SvgText>
            <SvgText
              x="275"
              y="185"
              fill="#8E939B"
              fontSize="10"
              fontWeight="600"
              letterSpacing="0.2"
            >
              London
            </SvgText>

            <SvgText
              x="40"
              y="265"
              fill="#8E939B"
              fontSize="10"
              fontWeight="600"
              letterSpacing="0.2"
            >
              Portland
            </SvgText>
            <SvgText
              x="46"
              y="280"
              fill="#8E939B"
              fontSize="10"
              fontWeight="600"
              letterSpacing="0.2"
            >
              Place
            </SvgText>

            {/* Baker Street Tube Station */}
            <G transform="translate(155, 105)">
              <SvgText
                x="-36"
                y="7"
                fill="#1E293B"
                fontSize="10"
                fontWeight="700"
              >
                Baker
              </SvgText>
              <SvgText
                x="-40"
                y="20"
                fill="#1E293B"
                fontSize="10"
                fontWeight="700"
              >
                Street
              </SvgText>
              <Circle
                cx="7"
                cy="7"
                r="7"
                stroke="#DC2626"
                strokeWidth="2.5"
                fill="#FFFFFF"
              />
              <Rect x="0" y="5" width="14" height="4" rx="1" fill="#1D4ED8" />
            </G>

            {/* Route Polyline */}
            <Path
              d="M 98 102 L 110 152 L 165 140 L 180 185 L 200 195 L 210 240 L 265 242 L 300 235"
              stroke={BRAND_TEAL}
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <Path
              d="M 200 195 L 210 240 L 265 242 L 300 235"
              stroke="#A7DED0"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="6, 4"
              fill="none"
            />
          </Svg>

          {/* Restaurant Marker */}
          <View
            style={{
              position: "absolute",
              left: 36,
              top: 72,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.2,
              shadowRadius: 5,
              elevation: 5,
            }}
          >
            <View className="bg-[#12231E] rounded-xl px-2.5 py-1.5 border border-white/20 items-center justify-center">
              <Text className="text-white text-[12px] font-bold tracking-tight">
                {restaurantName}
              </Text>
            </View>
            <View
              style={{
                alignSelf: "flex-end",
                marginRight: 12,
                width: 0,
                height: 0,
                borderLeftWidth: 5,
                borderRightWidth: 5,
                borderTopWidth: 6,
                borderStyle: "solid",
                borderLeftColor: "transparent",
                borderRightColor: "transparent",
                borderTopColor: "#12231E",
              }}
            />
          </View>

          {/* Courier Marker */}
          {isDriverAssigned ? (
            <View
              style={{
                position: "absolute",
                left: 178,
                top: 172,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Animated.View
                style={{
                  position: "absolute",
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  backgroundColor: BRAND_TEAL,
                  opacity: pulseOpacity,
                  transform: [{ scale: pulseAnim }],
                }}
              />
              <View
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  backgroundColor: BRAND_TEAL,
                  borderWidth: 2.5,
                  borderColor: "#FFFFFF",
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.25,
                  shadowRadius: 5,
                  elevation: 6,
                }}
              >
                <MaterialCommunityIcons name="moped" size={20} color="#FFFFFF" />
              </View>
            </View>
          ) : (
            <View
              style={{
                position: "absolute",
                left: 85,
                top: 110,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Animated.View
                style={{
                  position: "absolute",
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: "#F59E0B",
                  opacity: pulseOpacity,
                  transform: [{ scale: pulseAnim }],
                }}
              />
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: "#F59E0B",
                  borderWidth: 2,
                  borderColor: "#FFFFFF",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Feather name="search" size={15} color="#FFFFFF" />
              </View>
            </View>
          )}

          {/* Destination Marker */}
          <View
            style={{
              position: "absolute",
              left: 280,
              top: 215,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.2,
              shadowRadius: 6,
              elevation: 5,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: MINT_BG,
                borderWidth: 2.5,
                borderColor: "#FFFFFF",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Feather name="home" size={18} color={BRAND_TEAL} />
            </View>
          </View>
        </>
      )}

      {/* ─── MAP PROVIDER TOGGLE & STATUS BADGE (Top Bar) ─── */}
      <View
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          right: 12,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Map Type Switcher (Only shown if native maps module is available in the binary) */}
        {isNativeMapsAvailable && Platform.OS !== "web" ? (
          <Pressable
            onPress={() => setUseGoogleMap((prev) => !prev)}
            className="bg-white/95 dark:bg-card/95 px-3 py-1.5 rounded-full border border-border/70 shadow-xs flex-row items-center active:opacity-75"
          >
            <Feather
              name={useGoogleMap ? "map" : "layers"}
              size={12}
              color={BRAND_TEAL}
            />
            <Text className="text-[11px] font-bold text-foreground ml-1.5">
              {useGoogleMap ? "Google Map" : "Design Map"}
            </Text>
          </Pressable>
        ) : (
          <View className="bg-white/90 dark:bg-card/90 px-2.5 py-1 rounded-full border border-border/60 flex-row items-center">
            <Feather name="map-pin" size={11} color={BRAND_TEAL} />
            <Text className="text-[10px] font-semibold text-muted-foreground ml-1">
              London Map
            </Text>
          </View>
        )}

        {/* Live Tracking / Assigning Status Pill */}
        <View className="ml-auto">
          {isDriverAssigned ? (
            <View className="bg-white/95 dark:bg-card/95 px-3 py-1.5 rounded-full border border-border/60 shadow-xs flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-[#00B37A] mr-1.5" />
              <Text className="text-[11px] font-semibold text-foreground">
                Live tracking
              </Text>
            </View>
          ) : (
            <View className="bg-amber-500/95 px-3 py-1.5 rounded-full border border-amber-600/30 shadow-xs flex-row items-center">
              <Feather name="clock" size={11} color="#FFFFFF" />
              <Text className="text-[11px] font-bold text-white ml-1.5">
                Assigning driver...
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
});
