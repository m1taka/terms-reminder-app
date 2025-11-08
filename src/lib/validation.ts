export function validateRequired(value: unknown, fieldName: string): string | null {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} is required`;
  }
  return null;
}

export function validateDate(value: unknown, fieldName: string): string | null {
  const date = new Date(value as string);
  if (isNaN(date.getTime())) {
    return `${fieldName} must be a valid date`;
  }
  return null;
}

export function validateEnum(value: unknown, fieldName: string, allowedValues: string[]): string | null {
  if (value && !allowedValues.includes(value as string)) {
    return `${fieldName} must be one of: ${allowedValues.join(', ')}`;
  }
  return null;
}

export function validateMongoId(value: unknown, fieldName: string): string | null {
  if (value && !/^[0-9a-fA-F]{24}$/.test(value as string)) {
    return `${fieldName} must be a valid MongoDB ObjectId`;
  }
  return null;
}

export function collectErrors(validations: (string | null)[]): string[] {
  return validations.filter((error): error is string => error !== null);
}
