import { firestore } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export type UserSettings = {
  autoRunGemini?: boolean;
  preferredKpiCount?: number;
  preferredChartType?: 'line' | 'bar' | 'pie' | 'scatter';
  // future preferences can be added here
};

export class FirebaseUserSettingsService {
  static async getUserSettings(userId: string): Promise<UserSettings | null> {
    try {
      const ref = doc(firestore, 'users', userId);
      const snap = await getDoc(ref);
      if (!snap.exists()) return null;
      const data = snap.data() as any;
      const out: UserSettings = {};
      if (typeof data?.autoRunGemini === 'boolean') out.autoRunGemini = data.autoRunGemini;
      if (typeof data?.preferredKpiCount === 'number') out.preferredKpiCount = data.preferredKpiCount;
      if (typeof data?.preferredChartType === 'string') out.preferredChartType = data.preferredChartType;
      return out;
    } catch (e) {
      console.warn('Failed to read user settings from Firestore', e);
      return null;
    }
  }

  static async setUserSettings(userId: string, settings: Partial<UserSettings>): Promise<void> {
    try {
      const ref = doc(firestore, 'users', userId);
      await setDoc(ref, settings, { merge: true });
    } catch (e) {
      console.error('Failed to save user settings to Firestore', e);
      throw e;
    }
  }
}

export default FirebaseUserSettingsService;
