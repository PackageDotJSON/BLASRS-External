import { TEMPLATE_FILE_SETTINGS } from '../settings/app.settings';

export function ValidateFile(control: any): { [key: string]: boolean } | null {
  const value = control.value;

  if (!value) {
    return null;
  }

  if (value.name.length < 6) {
    return { invalidMinName: true };
  } else if (value.type !== TEMPLATE_FILE_SETTINGS.TYPE) {
    return { invalidType: true };
  } else if (value.size > TEMPLATE_FILE_SETTINGS.MAX_SIZE) {
    return { invalidMaxSize: true };
  } else if (value.size <= TEMPLATE_FILE_SETTINGS.MIN_SIZE) {
    return { invalidMinSize: true };
  } else if (value.name.length > TEMPLATE_FILE_SETTINGS.NAME_LENGTH) {
    return { invalidMaxName: true };
  } else {
    return null;
  }
}
