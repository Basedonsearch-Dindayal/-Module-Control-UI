import React, { useEffect, useRef, useState } from 'react';
import { Button, FlatList, NativeEventEmitter, NativeModules, PermissionsAndroid, Platform, StyleSheet, Text, View } from 'react-native';
import BleManager from 'react-native-ble-manager';

const BleManagerModule = NativeModules.BleManager;
const bleEmitter = new NativeEventEmitter(BleManagerModule);

const getRangeFromRssi = (rssi?: number) => {
  if (typeof rssi !== 'number') return 'unknown';
  if (rssi >= -60) return 'near';
  if (rssi >= -75) return 'medium';
  return 'far'; 
};

type DiscoveredDevice = {
  id: string;
  name: string;
  rssi?: number;
  range: string;
};

const BleScanner = () => {
  const uniqueIdsRef = useRef<Set<string>>(new Set());
  const [status, setStatus] = useState('Starting BLE scanner...');
  const [permissionsStatus, setPermissionsStatus] = useState('Pending');
  const [bluetoothState, setBluetoothState] = useState('Unknown');
  const [devices, setDevices] = useState<DiscoveredDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanTrigger, setScanTrigger] = useState(0);

  const subscribeState = (callback: ({ state }: { state: string }) => void) => {
    if (typeof (BleManager as any).onDidUpdateState === 'function') {
      return (BleManager as any).onDidUpdateState(callback);
    }
    return bleEmitter.addListener('BleManagerDidUpdateState', callback);
  };

  const subscribeDiscover = (callback: (device: any) => void) => {
    if (typeof (BleManager as any).onDiscoverPeripheral === 'function') {
      return (BleManager as any).onDiscoverPeripheral(callback);
    }
    return bleEmitter.addListener('BleManagerDiscoverPeripheral', callback);
  };

  const subscribeStopScan = (callback: () => void) => {
    if (typeof (BleManager as any).onStopScan === 'function') {
      return (BleManager as any).onStopScan(callback);
    }
    return bleEmitter.addListener('BleManagerStopScan', callback);
  };

  const getCurrentBleState = async () => {
    const checkStateFn = (BleManager as any).checkState;
    if (typeof checkStateFn !== 'function') return undefined;

    if (checkStateFn.length > 0) {
      return await new Promise<string | undefined>((resolve) => {
        checkStateFn((state: string) => resolve(state));
      });
    }

    const state = await checkStateFn();
    return typeof state === 'string' ? state : undefined;
  };

  const requestPermissions = async () => {
    if (Platform.OS !== 'android') return true;

    const permissions = [PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION];

    if (Platform.Version >= 31) {
      permissions.push(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      );
    } else {
      permissions.push(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION);
    }

    const granted = await PermissionsAndroid.requestMultiple(permissions);
    console.log("🔐 Permissions:", granted);

    const denied = permissions.filter(
      (permission) => granted[permission] !== PermissionsAndroid.RESULTS.GRANTED,
    );

    if (denied.length > 0) {
      console.log("⛔ Missing permissions:", denied);
      setPermissionsStatus(`Denied (${denied.length})`);
      return false;
    }

    setPermissionsStatus('Granted');

    return true;
  };

  useEffect(() => {
    let discoverListener: { remove: () => void } | null = null;
    let stopListener: { remove: () => void } | null = null;
    let stateListener: { remove: () => void } | null = null;

    const startBle = async () => {
      const hasPermissions = await requestPermissions();

      if (!hasPermissions) {
        setIsScanning(false);
        setStatus('Permissions denied. Enable Bluetooth and location permissions.');
        console.log("❌ Scan skipped: required Bluetooth/Location permissions not granted.");
        return;
      }

      // 🔥 Initialize BLE
      setStatus('Initializing BLE...');
      await BleManager.start({ showAlert: false });
      console.log("✅ BLE Initialized");

      stateListener = subscribeState(({ state }) => {
          setBluetoothState(state);
          if (state !== 'on') {
            setStatus(`Bluetooth state is ${state}. Turn Bluetooth ON.`);
          }
          console.log("🧭 Bluetooth state:", state);
        },
      );

      const currentState = await getCurrentBleState();
      if (currentState) {
        setBluetoothState(currentState);
      }
      if (currentState && currentState !== 'on') {
        setStatus(`Bluetooth state is ${currentState}. Turn Bluetooth ON.`);
      }

      // 🔥 Force enable Bluetooth (important!)
      setStatus('Enabling Bluetooth...');
      await BleManager.enableBluetooth();
      setBluetoothState('on');
      console.log("🔵 Bluetooth Enabled");

      // 📡 Listen BEFORE scan (important!)
        uniqueIdsRef.current.clear();
      setDevices([]);
      setStatus('Scanning for 10 seconds...');
      setIsScanning(true);

        discoverListener = subscribeDiscover((device) => {
          uniqueIdsRef.current.add(device.id);
          const range = getRangeFromRssi(device.rssi);
          setDevices((prev) => {
            const updated: DiscoveredDevice = {
              id: device.id,
              name: device.name || 'Unnamed device',
              rssi: device.rssi,
              range,
            };

            const index = prev.findIndex((item) => item.id === device.id);
            if (index >= 0) {
              const next = [...prev];
              next[index] = updated;
              return next;
            }

            return [...prev, updated];
          });
          console.log("📡 Device found:", device.name, device.id, "RSSI:", device.rssi, "Range:", range);
        },
      );

        stopListener = subscribeStopScan(() => {
          console.log("🛑 Scan stopped");
          setIsScanning(false);
          const uniqueCount = uniqueIdsRef.current.size;
          if (uniqueCount === 0) {
            setStatus('Scan finished. No devices found. Check GPS and advertising mode.');
            console.log("⚠️ No BLE devices found. Check GPS/location service, nearby permissions, and whether target devices are advertising.");
          } else {
            setStatus(`Scan finished. Found ${uniqueCount} unique devices.`);
          }
        },
      );

      // 🔍 Start scanning
      try {
        await BleManager.scan({
          serviceUUIDs: [],
          seconds: 10,
          allowDuplicates: false,
        });
        setStatus('Scan started... waiting for results');
        console.log("🔍 Scan started");
      } catch (error) {
        setIsScanning(false);
        setStatus('Scan failed. Check Bluetooth state and permissions.');
        console.log("❌ Scan error:", error);
      }

    };

    startBle().catch((error) => {
      setIsScanning(false);
      setStatus('BLE initialization failed. See details below.');
      console.log("❌ BLE init error:", error);
    });

    return () => {
      discoverListener?.remove();
      stopListener?.remove();
      stateListener?.remove();
    };
  }, [scanTrigger]);

  const refreshScan = () => {
    if (isScanning) {
      setStatus('Scan already in progress...');
      return;
    }

    setStatus('Refreshing scan...');
    setScanTrigger((value) => value + 1);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BLE Scanner</Text>
      <Text style={styles.meta}>Status: {status}</Text>
      <Text style={styles.meta}>Permissions: {permissionsStatus}</Text>
      <Text style={styles.meta}>Bluetooth State: {bluetoothState}</Text>
      <Text style={styles.count}>Discovered Devices ({devices.length})</Text>
      <Button
        title={isScanning ? 'Scanning...' : 'Refresh Scan'}
        onPress={refreshScan}
        disabled={isScanning}
      />

      <View style={styles.listViewport}>
        <FlatList
          data={devices}
          keyExtractor={(item) => item.id}
          nestedScrollEnabled
          showsVerticalScrollIndicator
          contentContainerStyle={styles.listContent}
          renderItem={({ item: device }) => (
          <View style={styles.deviceRow}>
            <Text style={styles.rowText}>Name: {device.name}</Text>
            <Text style={styles.rowText}>ID: {device.id}</Text>
            <Text style={styles.rowText}>RSSI: {typeof device.rssi === 'number' ? device.rssi : 'N/A'}</Text>
            <Text style={styles.rowText}>Range: {device.range}</Text>
          </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyListText}>No devices yet. Press Refresh Scan.</Text>}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#183324',
  },
  meta: {
    marginTop: 4,
    color: '#355643',
    fontSize: 13,
  },
  count: {
    marginTop: 8,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#173320',
  },
  listViewport: {
    marginTop: 10,
    height: 320,
    borderWidth: 1,
    borderColor: '#E4ECE7',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#FAFCFB',
  },
  deviceRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E8EFEB',
  },
  rowText: {
    fontSize: 12,
    color: '#2C4A39',
  },
  listContent: {
    paddingBottom: 10,
  },
  emptyListText: {
    fontSize: 12,
    color: '#557163',
    paddingVertical: 12,
  },
});

export default BleScanner;