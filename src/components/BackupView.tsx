import React, { useState } from 'react';
import { HardDrive, CloudUpload, CloudDownload, Download, Upload, CheckCircle2, ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';
import { AppState } from '../types';
import { saveBackupToDrive, findDriveBackupFile, restoreBackupFromDrive } from '../lib/driveService';
import { getAccessToken, setAccessToken, logoutGoogle, getGoogleUser } from '../lib/auth';

interface BackupViewProps {
  state: AppState;
  onRestoreState: (newState: Partial<AppState>) => void;
  onUpdateBackupInfo: (info: { lastBackupDate: string; fileName: string }) => void;
  onInitGoogleAuth: () => void;
}

export const BackupView: React.FC<BackupViewProps> = ({
  state,
  onRestoreState,
  onUpdateBackupInfo,
  onInitGoogleAuth,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [manualTokenInput, setManualTokenInput] = useState<string>('');
  const [showManualToken, setShowManualToken] = useState<boolean>(false);

  const accessToken = getAccessToken();
  const googleUser = getGoogleUser();

  const handleBackupToDrive = async () => {
    const token = accessToken || manualTokenInput.trim();
    if (!token) {
      setMessage({ text: 'Google OAuth Access Token required. Please sign in or trigger Google Auth.', type: 'error' });
      onInitGoogleAuth();
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const res = await saveBackupToDrive(token, state);
      const backupTime = new Date(res.modifiedTime).toLocaleString();
      onUpdateBackupInfo({
        lastBackupDate: backupTime,
        fileName: 'workout_tracker_backup.json'
      });
      setMessage({
        text: `Successfully backed up state to Google Drive (${backupTime})!`,
        type: 'success'
      });
    } catch (err: any) {
      console.error(err);
      setMessage({
        text: `Backup failed: ${err.message || 'Error uploading to Drive'}. Check Google OAuth scope permission.`,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreFromDrive = async () => {
    const token = accessToken || manualTokenInput.trim();
    if (!token) {
      setMessage({ text: 'Google OAuth Access Token required to restore from Drive.', type: 'error' });
      onInitGoogleAuth();
      return;
    }

    if (!window.confirm('Are you sure you want to restore data from Google Drive? This will merge with your current local workout history.')) {
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const backupFile = await findDriveBackupFile(token);
      if (!backupFile) {
        setMessage({ text: 'No workout_tracker_backup.json file found in your Google Drive.', type: 'error' });
        return;
      }

      const restoredData = await restoreBackupFromDrive(token, backupFile.id);
      onRestoreState(restoredData);
      setMessage({
        text: 'Successfully restored workout data from Google Drive!',
        type: 'success'
      });
    } catch (err: any) {
      console.error(err);
      setMessage({
        text: `Restore failed: ${err.message || 'Error fetching file from Drive'}`,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Local File Export
  const handleExportLocalFile = () => {
    const backupPayload = {
      appVersion: '1.0.0',
      exportedAt: new Date().toISOString(),
      state: {
        workouts: state.workouts,
        customExercises: state.customExercises,
        bodyMetrics: state.bodyMetrics,
        unit: state.unit
      }
    };

    const blob = new Blob([JSON.stringify(backupPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workout_tracker_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setMessage({ text: 'Downloaded local JSON backup file successfully!', type: 'success' });
  };

  // Local File Import
  const handleImportLocalFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const payload = JSON.parse(event.target?.result as string);
        if (payload && payload.state) {
          if (window.confirm('Restore workout state from this local JSON file?')) {
            onRestoreState(payload.state);
            setMessage({ text: 'Successfully imported local backup JSON!', type: 'success' });
          }
        } else {
          setMessage({ text: 'Invalid JSON file format.', type: 'error' });
        }
      } catch (err) {
        setMessage({ text: 'Failed to parse JSON file.', type: 'error' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4 pb-24 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-lg font-black text-slate-100 tracking-tight flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-emerald-400" /> Google Drive Backup & Sync
        </h2>
        <p className="text-xs text-slate-400">Cloud backup, restore & offline JSON export</p>
      </div>

      {/* Cloud Status Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-4 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-100">Google Drive Status</h3>
              <p className="text-[11px] text-slate-400">
                {state.backupInfo?.lastBackupDate
                  ? `Last backed up: ${state.backupInfo.lastBackupDate}`
                  : 'No cloud backup performed yet'}
              </p>
            </div>
          </div>
        </div>

        {/* Google OAuth Connect Box */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-semibold">Google Account Access</span>
            <button
              onClick={onInitGoogleAuth}
              className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition-all shadow-sm"
            >
              {accessToken ? 'Connected' : 'Sign in for Drive'}
            </button>
          </div>

          <p className="text-[11px] text-slate-400">
            Authorizes backup to <strong className="text-emerald-400">workout_tracker_backup.json</strong> in your personal Google Drive.
          </p>

          <button
            onClick={() => setShowManualToken(!showManualToken)}
            className="text-[10px] text-slate-500 hover:text-slate-300 underline"
          >
            {showManualToken ? 'Hide Access Token Field' : 'Developer: Enter Manual OAuth Token'}
          </button>

          {showManualToken && (
            <div className="pt-2">
              <input
                type="text"
                placeholder="Paste Google Access Token (ya29...)"
                value={manualTokenInput}
                onChange={(e) => {
                  setManualTokenInput(e.target.value);
                  setAccessToken(e.target.value);
                }}
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg p-2 font-mono outline-none focus:border-emerald-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* Message Feedback Banner */}
      {message && (
        <div
          className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400'
              : 'bg-red-950/60 border-red-800 text-red-400'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Google Drive Primary Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleBackupToDrive}
          disabled={loading}
          className="p-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl flex flex-col items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all text-xs uppercase"
        >
          <CloudUpload className="w-6 h-6" />
          <span>{loading ? 'Uploading...' : 'Backup To Drive'}</span>
        </button>

        <button
          onClick={handleRestoreFromDrive}
          disabled={loading}
          className="p-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-100 font-black rounded-2xl flex flex-col items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all text-xs uppercase"
        >
          <CloudDownload className="w-6 h-6 text-cyan-400" />
          <span>{loading ? 'Restoring...' : 'Restore From Drive'}</span>
        </button>
      </div>

      {/* Local File Export & Import (Instant Fallback) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Local JSON Backup & Restore</h3>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleExportLocalFile}
            className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
          >
            <Download className="w-4 h-4 text-emerald-400" /> Export JSON
          </button>

          <label className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all">
            <Upload className="w-4 h-4 text-cyan-400" /> Import JSON
            <input
              type="file"
              accept=".json"
              onChange={handleImportLocalFile}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
