import { TEMPLATE_FILE_SETTINGS } from "../settings/app.settings";


export function ValidateFile(control: any): { [key: string]: boolean } | null {
  const value = control.value;

  if (!value) {
    return null;
  }

  return value.name.length < 0 ||
    value.type !== TEMPLATE_FILE_SETTINGS.TYPE ||
    value.size > TEMPLATE_FILE_SETTINGS.MAX_SIZE ||
    value.size <= TEMPLATE_FILE_SETTINGS.MIN_SIZE ||
    value.name.length > TEMPLATE_FILE_SETTINGS.NAME_LENGTH
    ? { invalidFile: true }
    : null;
}
