import React, { useState, useEffect } from 'react';
import { Download, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { AppUpdater, UpdateInfo } from '@/lib/updater';
import { toast } from 'sonner';

export function UpdateButton() {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  const updater = AppUpdater.getInstance();

  useEffect(() => {
    checkForUpdates();
  }, []);

  const checkForUpdates = async () => {
    setIsChecking(true);
    try {
      const info = await updater.checkForUpdates();
      setUpdateInfo(info);
    } catch (error) {
      toast.error('Impossible de vérifier les mises à jour');
    } finally {
      setIsChecking(false);
    }
  };

  const installUpdate = async () => {
    if (!updateInfo?.available) return;

    setIsInstalling(true);
    try {
      await updater.installAndRestart();
    } catch (error) {
      toast.error('Échec de l\'installation de la mise à jour');
    } finally {
      setIsInstalling(false);
    }
  };

  if (isChecking) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
        Vérification...
      </Button>
    );
  }

  if (!updateInfo) {
    return (
      <Button variant="ghost" size="sm" onClick={checkForUpdates}>
        <RefreshCw className="h-4 w-4 mr-2" />
        Vérifier les mises à jour
      </Button>
    );
  }

  if (updateInfo.available) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
          <AlertCircle className="h-4 w-4" />
          <span>v{updateInfo.latestVersion} disponible</span>
        </div>
        <Button
          variant="default"
          size="sm"
          onClick={installUpdate}
          disabled={isInstalling}
          className="bg-green-600 hover:bg-green-700"
        >
          {isInstalling ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Installation...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Mettre à jour
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
      <Check className="h-4 w-4" />
      <span>À jour (v{updateInfo.currentVersion})</span>
      <Button variant="ghost" size="sm" onClick={checkForUpdates}>
        <RefreshCw className="h-4 w-4" />
      </Button>
    </div>
  );
}