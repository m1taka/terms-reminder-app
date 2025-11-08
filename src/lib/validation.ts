export function validateRequired(value: any, fieldName: string): string | null {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} is required`;
  }
  return null;
}

export function validateDate(value: any, fieldName: string): string | null {
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return `${fieldName} must be a valid date`;
  }
  return null;
}

export function validateEnum(value: any, fieldName: string, allowedValues: string[]): string | null {
  if (value && !allowedValues.includes(value)) {
    return `${fieldName} must be one of: ${allowedValues.join(', ')}`;
  }
  return null;
}

export function validateMongoId(value: any, fieldName: string): string | null {
  if (value && !/^[0-9a-fA-F]{24}$/.test(value)) {
    return `${fieldName} must be a valid MongoDB ObjectId`;
  }
  return null;
}

export function collectErrors(validations: (string | null)[]): string[] {
  return validations.filter((error): error is string => error !== null);
}
