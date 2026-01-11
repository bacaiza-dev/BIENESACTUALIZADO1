import { Capacitor } from '@capacitor/core';
import { Network } from '@capacitor/network';

interface AppConfig {
  apiUrl: string;
  isNative: boolean;
  platform: string;
  apiTimeout: number;
}

class ConfigService {
  private config: AppConfig | null = null;

  async initialize(): Promise<AppConfig> {
    if (this.config) {
      return this.config;
    }

    const isNative = Capacitor.isNativePlatform();
    const platform = Capacitor.getPlatform();
    
    // Configurar URL de la API según el entorno
    let apiUrl: string;
    
    if (isNative) {
      // Para dispositivos móviles nativos
      const networkStatus = await Network.getStatus();
      
      if (networkStatus.connected) {
        // Intentar conectar a la API en diferentes direcciones
        apiUrl = await this.detectApiUrl();
      } else {
        // Sin conexión, usar dirección por defecto
        apiUrl = 'http://192.168.1.100:3000/api';
      }
    } else {
      // Para navegadores web
      apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    }

    this.config = {
      apiUrl,
      isNative,
      platform,
      apiTimeout: 10000
    };

    return this.config;
  }

  private async detectApiUrl(): Promise<string> {
    const possibleUrls = [
      'http://localhost:3000/api',
      'http://127.0.0.1:3000/api',
      'http://192.168.1.100:3000/api',
      'http://10.0.2.2:3000/api', // Android emulator
      'http://10.0.0.2:3000/api'   // iOS simulator
    ];

    for (const url of possibleUrls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch(`${url}/health`, {
          method: 'GET',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          return url;
        }
      } catch (error) {
        // Silent fail, continue trying other URLs
      }
    }

    // Si no se encuentra la API, usar la URL por defecto
    return 'http://localhost:3000/api';
  }

  getConfig(): AppConfig {
    if (!this.config) {
      throw new Error('ConfigService no ha sido inicializado');
    }
    return this.config;
  }

  getApiUrl(): string {
    return this.getConfig().apiUrl;
  }

  isNative(): boolean {
    return this.getConfig().isNative;
  }

  getPlatform(): string {
    return this.getConfig().platform;
  }

  // Método para actualizar la URL de la API dinámicamente
  updateApiUrl(newUrl: string): void {
    if (this.config) {
      this.config.apiUrl = newUrl;
    }
  }
}

export const configService = new ConfigService();
export type { AppConfig };