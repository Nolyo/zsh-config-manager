import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';
import { toast } from 'sonner';

export interface UpdateInfo {
  available: boolean;
  currentVersion: string;
  latestVersion?: string;
  body?: string;
  date?: string;
}

export class AppUpdater {
  private static instance: AppUpdater;
  private updateChecked = false;

  private constructor() {}

  static getInstance(): AppUpdater {
    if (!AppUpdater.instance) {
      AppUpdater.instance = new AppUpdater();
    }
    return AppUpdater.instance;
  }

  async checkForUpdates(): Promise<UpdateInfo> {
    try {
      const update = await check();

      if (update?.available) {
        return {
          available: true,
          currentVersion: update.currentVersion,
          latestVersion: update.version,
          body: update.body,
          date: update.date
        };
      }

      return {
        available: false,
        currentVersion: update?.currentVersion || 'unknown'
      };
    } catch (error) {
      console.error('Failed to check for updates:', error);
      return {
        available: false,
        currentVersion: 'unknown'
      };
    }
  }

  async installAndRestart(): Promise<void> {
    try {
      const update = await check();

      if (!update?.available) {
        toast.error('Aucune mise à jour disponible');
        return;
      }

      let downloaded = 0;
      let contentLength = 0;

      toast.info('Téléchargement de la mise à jour...');

      await update.downloadAndInstall((event) => {
        switch (event.event) {
          case 'Started':
            contentLength = event.data.contentLength || 0;
            break;
          case 'Progress':
            downloaded += event.data.chunkLength;
            const progress = contentLength > 0
              ? Math.round((downloaded / contentLength) * 100)
              : 0;
            toast.info(`Téléchargement: ${progress}%`, {
              id: 'update-download'
            });
            break;
          case 'Finished':
            toast.success('Mise à jour téléchargée avec succès', {
              id: 'update-download'
            });
            break;
        }
      });

      toast.success('L\'application va redémarrer pour installer la mise à jour');
      await relaunch();
    } catch (error) {
      console.error('Failed to install update:', error);
      toast.error('Échec de l\'installation de la mise à jour');
    }
  }

  async autoCheckOnStartup(): Promise<void> {
    if (this.updateChecked) return;

    this.updateChecked = true;

    try {
      const updateInfo = await this.checkForUpdates();

      if (updateInfo.available) {
        toast.success(`Nouvelle version disponible: ${updateInfo.latestVersion}`, {
          action: {
            label: 'Mettre à jour',
            onClick: () => this.installAndRestart()
          },
          duration: 10000
        });
      }
    } catch (error) {
      console.error('Auto-check failed:', error);
    }
  }
}