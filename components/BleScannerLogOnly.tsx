import { useEffect } from 'react';
import { NativeEventEmitter, NativeModules, PermissionsAndroid, Platform } from 'react-native';
import BleManager from 'react-native-ble-manager';

const BleManagerModule = NativeModules.BleManager;
const bleEmitter = new NativeEventEmitter(BleManagerModule);

const BleScanner = () => {

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

    return permissions.every(
      (permission) => granted[permission] === PermissionsAndroid.RESULTS.GRANTED
    );
  };

  useEffect(() => {
    let discoverListener: any = null;
    let stopListener: any = null;
    let stateListener: any = null;

    const startBle = async () => {
      const hasPermissions = await requestPermissions();

      if (!hasPermissions) {
        console.log("❌ Permissions denied");
        return;
      }

      console.log("🚀 Initializing BLE...");
      await BleManager.start({ showAlert: false });

      stateListener = subscribeState(({ state }) => {
        console.log("🧭 Bluetooth state:", state);
      });

      console.log("🔵 Enabling Bluetooth...");
      await BleManager.enableBluetooth();

      discoverListener = subscribeDiscover((device) => {
        console.log("📡 Device found:", {
          name: device.name,
          id: device.id,
        //   rssi: device.rssi
        });
      });

      stopListener = subscribeStopScan(() => {
        console.log("🛑 Scan stopped");
      });

      try {
        console.log("🔍 Starting scan...");
        await BleManager.scan({
          serviceUUIDs: [],
          seconds: 10,
          allowDuplicates: true,
        });
      } catch (error) {
        console.log("❌ Scan error:", error);
      }
    };

    startBle();

    return () => {
      discoverListener?.remove();
      stopListener?.remove();
      stateListener?.remove();
    };
  }, []);

  return null;
};

export default BleScanner;