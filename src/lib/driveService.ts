import { AppState } from '../types';

const BACKUP_FILENAME = 'workout_tracker_backup.json';

export interface DriveFileInfo {
  id: string;
  name: string;
  modifiedTime: string;
  size?: string;
}

/**
 * Searches for existing backup file in user's Google Drive.
 */
export const findDriveBackupFile = async (accessToken: string): Promise<DriveFileInfo | null> => {
  try {
    const query = encodeURIComponent(`name = '${BACKUP_FILENAME}' and trashed = false`);
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,modifiedTime,size)&pageSize=5`,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Drive search error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    if (data.files && data.files.length > 0) {
      return data.files[0];
    }
    return null;
  } catch (error) {
    console.error('findDriveBackupFile error:', error);
    throw error;
  }
};

/**
 * Uploads (or overwrites) the current app state as workout_tracker_backup.json in Google Drive.
 */
export const saveBackupToDrive = async (
  accessToken: string,
  state: AppState
): Promise<{ fileId: string; modifiedTime: string }> => {
  try {
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

    const existingFile = await findDriveBackupFile(accessToken);
    const jsonContent = JSON.stringify(backupPayload, null, 2);

    if (existingFile) {
      // Overwrite existing file content
      const updateResponse = await fetch(
        `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=media`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: jsonContent
        }
      );

      if (!updateResponse.ok) {
        throw new Error(`Drive update failed with status ${updateResponse.status}`);
      }

      const updatedData = await updateResponse.json();
      return {
        fileId: existingFile.id,
        modifiedTime: updatedData.modifiedTime || new Date().toISOString()
      };
    } else {
      // Create new file using multipart upload
      const metadata = {
        name: BACKUP_FILENAME,
        mimeType: 'application/json',
        description: 'Workout Tracker App Data Backup'
      };

      const boundary = '-------314159265358979323846';
      const delimiter = `\r\n--${boundary}\r\n`;
      const closeDelimiter = `\r\n--${boundary}--`;

      const multipartRequestBody =
        delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        jsonContent +
        closeDelimiter;

      const createResponse = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': `multipart/related; boundary=${boundary}`
          },
          body: multipartRequestBody
        }
      );

      if (!createResponse.ok) {
        const errText = await createResponse.text();
        throw new Error(`Drive file creation failed (${createResponse.status}): ${errText}`);
      }

      const createdFile = await createResponse.json();
      return {
        fileId: createdFile.id,
        modifiedTime: createdFile.modifiedTime || new Date().toISOString()
      };
    }
  } catch (error) {
    console.error('saveBackupToDrive error:', error);
    throw error;
  }
};

/**
 * Downloads and restores backup state from Google Drive.
 */
export const restoreBackupFromDrive = async (
  accessToken: string,
  fileId: string
): Promise<Partial<AppState>> => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to download file from Drive (${response.status})`);
    }

    const payload = await response.json();
    if (!payload || !payload.state) {
      throw new Error('Invalid backup file structure.');
    }

    return payload.state;
  } catch (error) {
    console.error('restoreBackupFromDrive error:', error);
    throw error;
  }
};
