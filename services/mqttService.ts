import mqtt from 'mqtt';

export interface MqttConfig {
  url: string;
  topic: string;
  onMessage?: (topic: string, message: string) => void;
  onStatusChange?: (status: 'connected' | 'disconnected' | 'connecting' | 'error') => void;
}

class MqttService {
  private client: mqtt.MqttClient | null = null;

  connect(config: MqttConfig) {
    if (this.client) {
      this.client.end();
    }

    if (config.onStatusChange) config.onStatusChange('connecting');

    try {
      this.client = mqtt.connect(config.url, {
        reconnectPeriod: 5000,
        connectTimeout: 30 * 1000,
      });

      this.client.on('connect', () => {
        console.log('MQTT Connected');
        if (config.onStatusChange) config.onStatusChange('connected');
        this.client?.subscribe(config.topic);
      });

      this.client.on('message', (topic, payload) => {
        if (config.onMessage) {
          config.onMessage(topic, payload.toString());
        }
      });

      this.client.on('error', (err) => {
        console.error('MQTT Error:', err);
        if (config.onStatusChange) config.onStatusChange('error');
      });

      this.client.on('close', () => {
        if (config.onStatusChange) config.onStatusChange('disconnected');
      });

    } catch (e) {
      console.error('MQTT Connection Setup Error:', e);
      if (config.onStatusChange) config.onStatusChange('error');
    }
  }

  publish(topic: string, message: string) {
    if (this.client && this.client.connected) {
      this.client.publish(topic, message);
    } else {
      console.warn('MQTT Client not connected, cannot publish');
    }
  }

  disconnect() {
    if (this.client) {
      this.client.end();
      this.client = null;
    }
  }
}

export const mqttService = new MqttService();
